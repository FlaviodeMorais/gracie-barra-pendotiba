import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET() {
  const hours = await prisma.operatingHours.findMany({ orderBy: { day: "asc" } });
  return NextResponse.json(hours);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const data = await req.json();
    const results = await Promise.all(
      data.map((h: { day: number; open: boolean; openTime: string; closeTime: string }) =>
        prisma.operatingHours.upsert({
          where: { day: h.day },
          create: h,
          update: h,
        })
      )
    );
    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar horários" }, { status: 500 });
  }
}
