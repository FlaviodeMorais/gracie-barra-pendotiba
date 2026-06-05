import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

async function updateAdmin(label, adapterConfig) {
  const adapter = new PrismaLibSql(adapterConfig);
  const prisma = new PrismaClient({ adapter });
  try {
    const existing = await prisma.admin.findFirst();
    if (existing) {
      await prisma.admin.update({
        where: { id: existing.id },
        data: { email: "gb.pendotiba@gmail.com" },
      });
      console.log(`✓ ${label}: email atualizado → gb.pendotiba@gmail.com`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Local
const absPath = path.join(ROOT, "dev.db").replace(/\\/g, "/");
await updateAdmin("SQLite local", { url: `file:///${absPath}` });

// Turso
if (process.env.TURSO_DATABASE_URL) {
  await updateAdmin("Turso", {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

console.log("\n✅ Login agora: gb.pendotiba@gmail.com");
