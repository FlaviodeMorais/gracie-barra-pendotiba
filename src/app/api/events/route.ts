import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";

  const events = await prisma.event.findMany({
    where: all ? {} : { status: { in: ["upcoming", "open"] } },
    orderBy: { date: "asc" },
    include: {
      _count: { select: { registrations: true } },
    },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const data = await req.json();
    const event = await prisma.event.create({
      data: {
        ...data,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : null,
        price: parseFloat(data.price) || 0,
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar evento" }, { status: 500 });
  }
}
