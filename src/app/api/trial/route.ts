import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const trial = await prisma.trialClass.create({ data });
    return NextResponse.json(trial, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao agendar aula" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const trials = await prisma.trialClass.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(trials);
}
