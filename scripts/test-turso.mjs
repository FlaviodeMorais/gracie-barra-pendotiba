import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

try {
  const [admins, banners, schedules, settings] = await Promise.all([
    prisma.admin.count(),
    prisma.banner.count(),
    prisma.classSchedule.count(),
    prisma.siteSettings.count(),
  ]);
  console.log("✅ Turso conectado com sucesso!");
  console.log(`   Admins: ${admins}`);
  console.log(`   Banners: ${banners}`);
  console.log(`   Aulas: ${schedules}`);
  console.log(`   Configurações: ${settings}`);
} catch (e) {
  console.error("❌ Erro:", e.message);
} finally {
  await prisma.$disconnect();
}
