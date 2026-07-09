import { prisma } from "@/lib/prisma";

// Chaves que nunca devem ser expostas a páginas/componentes públicos.
const SENSITIVE_KEYS = ["mpAccessToken", "zapsterToken"];

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSettings.findMany();
  const map: Record<string, string> = {};
  rows.forEach((row) => (map[row.key] = row.value));
  return map;
}

export async function getPublicSettings(): Promise<Record<string, string>> {
  const map = await getAllSettings();
  for (const key of SENSITIVE_KEYS) delete map[key];
  return map;
}

export async function getMpAccessToken(): Promise<string | undefined> {
  const row = await prisma.siteSettings.findUnique({ where: { key: "mpAccessToken" } });
  return row?.value || process.env.MP_ACCESS_TOKEN;
}
