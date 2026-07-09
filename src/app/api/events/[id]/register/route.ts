import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { createPixPayment } from "@/lib/mercadopago";
import { getMpAccessToken, getAllSettings } from "@/lib/settings";
import { generatePixPayload } from "@/lib/utils";
import {
  ACTIVE_PENDING_PAYMENT_STATUSES,
  getReservationExpiration,
  isReservationActive,
} from "@/lib/payments";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const data = await req.json();
    const now = new Date();
    const adults = Math.max(1, parseInt(data.adults) || 1);
    const children = Math.max(0, parseInt(data.children) || 0);
    const phone = String(data.phone || "").trim();

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    if (!event.registrationOpen) {
      return NextResponse.json({ error: "Inscrições encerradas" }, { status: 400 });
    }

    await prisma.eventRegistration.updateMany({
      where: {
        eventId: id,
        paid: false,
        paymentStatus: { in: Array.from(ACTIVE_PENDING_PAYMENT_STATUSES) },
        reservationExpiresAt: { lte: now },
      },
      data: {
        paymentStatus: "expired",
        reservationExpiresAt: null,
      },
    });

    if (event.maxParticipants) {
      const registrations = await prisma.eventRegistration.findMany({
        where: { eventId: id },
        select: { adults: true, paid: true, paymentStatus: true, reservationExpiresAt: true },
      });
      const occupied = registrations.reduce(
        (sum, registration) => sum + (registration.paid || isReservationActive(registration, now) ? registration.adults : 0),
        0
      );
      if (occupied + adults > event.maxParticipants) {
        const available = event.maxParticipants - occupied;
        return NextResponse.json(
          { error: available <= 0 ? "Vagas esgotadas" : `Apenas ${available} vaga${available > 1 ? "s" : ""} disponível${available > 1 ? "is" : ""}` },
          { status: 400 }
        );
      }
    }

    const existing = await prisma.eventRegistration.findFirst({
      where: { eventId: id, phone },
      orderBy: { createdAt: "desc" },
    });
    if (existing?.paid || existing?.paymentStatus === "not_required") {
      return NextResponse.json({ error: "Este WhatsApp já está inscrito neste evento" }, { status: 400 });
    }
    if (existing && isReservationActive(existing, now)) {
      return NextResponse.json(
        {
          error: "Já existe uma inscrição aguardando pagamento para este WhatsApp. Finalize o PIX atual ou aguarde a reserva expirar.",
          reservationExpiresAt: existing.reservationExpiresAt,
        },
        { status: 409 }
      );
    }

    const totalAmount = event.price * adults;
    const syntheticEmail = `${phone.replace(/\D/g, "")}@participante.gbpendotiba.com.br`;
    const reservationExpiresAt = totalAmount > 0 ? getReservationExpiration(now) : null;

    const baseData = {
      eventId: id,
      name: data.name,
      email: syntheticEmail,
      phone,
      academy: data.academy || null,
      adults,
      children,
      totalAmount,
      notes: data.notes || null,
      pixTxId: totalAmount > 0 ? uuidv4().replace(/-/g, "").substring(0, 25) : null,
      mpPaymentId: null,
      paid: totalAmount === 0,
      paymentStatus: totalAmount > 0 ? "pending" : "not_required",
      reservationExpiresAt,
    };

    let registration = existing
      ? await prisma.eventRegistration.update({
          where: { id: existing.id },
          data: baseData,
        })
      : await prisma.eventRegistration.create({
          data: baseData,
        });

    let mpPix: { qrCode: string; qrCodeBase64: string } | null = null;
    let mpPixError = false;
    let staticPixPayload: string | null = null;
    const accessToken = await getMpAccessToken();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const publicSiteUrl = siteUrl && /^https:\/\//.test(siteUrl) ? siteUrl : undefined;

    if (totalAmount > 0 && accessToken) {
      try {
        const payment = await createPixPayment({
          amount: totalAmount,
          description: `Inscrição ${event.title}`.substring(0, 255),
          payerEmail: syntheticEmail,
          externalReference: registration.id,
          notificationUrl: publicSiteUrl ? `${publicSiteUrl}/api/webhooks/mercadopago` : undefined,
          accessToken,
        });
        registration = await prisma.eventRegistration.update({
          where: { id: registration.id },
          data: {
            mpPaymentId: String(payment.id),
            paymentStatus: payment.status || "pending",
            paid: payment.status === "approved",
            reservationExpiresAt: payment.status === "approved" ? null : reservationExpiresAt,
          },
        });
        mpPix = { qrCode: payment.qrCode, qrCodeBase64: payment.qrCodeBase64 };
      } catch (mpError) {
        console.error("Erro Mercado Pago:", mpError);
        mpPixError = true;
      }
    } else if (totalAmount > 0) {
      mpPixError = true;
    }

    if (mpPixError && totalAmount > 0) {
      const settings = await getAllSettings();
      const pixKey = event.pixKey || settings.pixKey;
      const pixKeyType = event.pixKeyType || settings.pixKeyType || "email";
      if (pixKey) {
        staticPixPayload = generatePixPayload(
          pixKey,
          pixKeyType,
          totalAmount,
          settings.pixName || "Gracie Barra Pendotiba",
          settings.pixCity || "Niteroi",
          registration.pixTxId || "GBPENDOTIBA",
          `Inscricao ${event.title}`
        );
        registration = await prisma.eventRegistration.update({
          where: { id: registration.id },
          data: { paymentStatus: "manual_pending" },
        });
      }
    }

    return NextResponse.json({ ...registration, event, mpPix, mpPixError, staticPixPayload }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao realizar inscrição" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminToken = req.cookies.get("admin_token")?.value;
  if (!adminToken) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const now = new Date();

  await prisma.eventRegistration.updateMany({
    where: {
      eventId: id,
      paid: false,
      paymentStatus: { in: Array.from(ACTIVE_PENDING_PAYMENT_STATUSES) },
      reservationExpiresAt: { lte: now },
    },
    data: {
      paymentStatus: "expired",
      reservationExpiresAt: null,
    },
  });

  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId: id },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: registrations.length,
    totalAdults: registrations.reduce((sum, registration) => sum + registration.adults, 0),
    totalChildren: registrations.reduce((sum, registration) => sum + registration.children, 0),
    paid: registrations.filter((registration) => registration.paid).length,
    pending: registrations.filter((registration) => isReservationActive(registration, now)).length,
    checkedIn: registrations.filter((registration) => registration.checkedIn).length,
  };

  return NextResponse.json({ registrations, stats });
}
