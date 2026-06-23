import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await req.json();
    const adults = Math.max(1, parseInt(data.adults) || 1);
    const children = Math.max(0, parseInt(data.children) || 0);

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    if (!event.registrationOpen) {
      return NextResponse.json({ error: "Inscrições encerradas" }, { status: 400 });
    }
    if (event.maxParticipants) {
      const registrations = await prisma.eventRegistration.findMany({
        where: { eventId: id },
        select: { adults: true },
      });
      const occupied = registrations.reduce((sum, r) => sum + r.adults, 0);
      if (occupied + adults > event.maxParticipants) {
        const available = event.maxParticipants - occupied;
        return NextResponse.json(
          { error: available <= 0 ? "Vagas esgotadas" : `Apenas ${available} vaga${available > 1 ? "s" : ""} disponível${available > 1 ? "is" : ""}` },
          { status: 400 }
        );
      }
    }
    const existing = await prisma.eventRegistration.findFirst({
      where: { eventId: id, email: data.email },
    });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado neste evento" }, { status: 400 });
    }

    const totalAmount = event.price * adults;

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        belt: data.belt || "branca",
        academy: data.academy || null,
        adults,
        children,
        totalAmount,
        notes: data.notes || null,
        pixTxId: totalAmount > 0 ? uuidv4().replace(/-/g, "").substring(0, 25) : null,
      },
    });
    return NextResponse.json({ ...registration, event }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao realizar inscrição" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminToken = req.cookies.get("admin_token")?.value;
  if (!adminToken) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId: id },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: registrations.length,
    totalAdults: registrations.reduce((s, r) => s + r.adults, 0),
    totalChildren: registrations.reduce((s, r) => s + r.children, 0),
    paid: registrations.filter((r) => r.paid).length,
    pending: registrations.filter((r) => !r.paid).length,
    checkedIn: registrations.filter((r) => r.checkedIn).length,
  };

  return NextResponse.json({ registrations, stats });
}
