import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shouldExpireReservation } from "@/lib/payments";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let registration = await prisma.eventRegistration.findUnique({
    where: { id },
    select: {
      paid: true,
      paymentStatus: true,
      reservationExpiresAt: true,
      name: true,
      adults: true,
      children: true,
      totalAmount: true,
    },
  });
  if (!registration) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  if (shouldExpireReservation(registration)) {
    registration = await prisma.eventRegistration.update({
      where: { id },
      data: {
        paymentStatus: "expired",
        reservationExpiresAt: null,
      },
      select: {
      paid: true,
      paymentStatus: true,
      reservationExpiresAt: true,
      name: true,
      adults: true,
      children: true,
      totalAmount: true,
    },
    });
  }

  return NextResponse.json(registration);
}
