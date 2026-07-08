import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { getAllSettings, getPublicSettings } from "@/lib/settings";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const settings = session ? await getAllSettings() : await getPublicSettings();
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const data = await req.json();
    const results = await Promise.all(
      Object.entries(data).map(([key, value]) =>
        prisma.siteSettings.upsert({
          where: { key },
          create: { key, value: String(value) },
          update: { value: String(value) },
        })
      )
    );
    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar configurações" }, { status: 500 });
  }
}
