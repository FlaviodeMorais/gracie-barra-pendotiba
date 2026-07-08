import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const registration = await prisma.eventRegistration.findUnique({
    where: { id },
    select: { paid: true, paymentStatus: true },
  });
  if (!registration) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(registration);
}
