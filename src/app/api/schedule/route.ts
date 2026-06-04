import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET() {
  const schedules = await prisma.classSchedule.findMany({
    where: { active: true },
    orderBy: [{ day: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(schedules);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const data = await req.json();
    const schedule = await prisma.classSchedule.create({ data: { ...data, day: parseInt(data.day) } });
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar horário" }, { status: 500 });
  }
}
