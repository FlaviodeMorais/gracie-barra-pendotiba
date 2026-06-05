/**
 * Migra todos os dados do SQLite local para o Turso (produção).
 *
 * Uso:
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/migrate-to-turso.mjs
 */
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// ── Cliente LOCAL (SQLite) ────────────────────────────────────────────────
const absPath = path.join(ROOT, "dev.db").replace(/\\/g, "/");
const localAdapter = new PrismaLibSql({ url: `file:///${absPath}` });
const local = new PrismaClient({ adapter: localAdapter });

// ── Cliente TURSO (produção) ───────────────────────────────────────────────
const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;
if (!TURSO_DATABASE_URL) {
  console.error("❌  TURSO_DATABASE_URL não definida.");
  process.exit(1);
}
const tursoAdapter = new PrismaLibSql({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });
const turso = new PrismaClient({ adapter: tursoAdapter });

async function migrate() {
  console.log("🚀 Iniciando migração SQLite → Turso...\n");

  // Admins
  const admins = await local.admin.findMany();
  for (const a of admins) {
    await turso.admin.upsert({ where: { email: a.email }, create: a, update: a });
  }
  console.log(`✓ Admins: ${admins.length}`);

  // Configurações
  const settings = await local.siteSettings.findMany();
  for (const s of settings) {
    await turso.siteSettings.upsert({ where: { key: s.key }, create: s, update: s });
  }
  console.log(`✓ Configurações: ${settings.length}`);

  // Horários de funcionamento
  const hours = await local.operatingHours.findMany();
  for (const h of hours) {
    await turso.operatingHours.upsert({ where: { day: h.day }, create: h, update: h });
  }
  console.log(`✓ Horários: ${hours.length}`);

  // Horários de aulas
  const schedules = await local.classSchedule.findMany();
  await turso.classSchedule.deleteMany();
  if (schedules.length) await turso.classSchedule.createMany({ data: schedules });
  console.log(`✓ Grade de aulas: ${schedules.length}`);

  // Banners
  const banners = await local.banner.findMany();
  await turso.banner.deleteMany();
  if (banners.length) await turso.banner.createMany({ data: banners });
  console.log(`✓ Banners: ${banners.length}`);

  // Eventos + inscrições
  const events = await local.event.findMany({ include: { registrations: true } });
  for (const { registrations, ...event } of events) {
    await turso.event.upsert({
      where: { id: event.id },
      create: event,
      update: event,
    });
    for (const r of registrations) {
      await turso.eventRegistration.upsert({
        where: { id: r.id },
        create: r,
        update: r,
      });
    }
  }
  console.log(`✓ Eventos: ${events.length} | Inscrições: ${events.reduce((n, e) => n + e.registrations.length, 0)}`);

  // Aulas teste
  const trials = await local.trialClass.findMany();
  for (const t of trials) {
    await turso.trialClass.upsert({ where: { id: t.id }, create: t, update: t });
  }
  console.log(`✓ Aulas teste: ${trials.length}`);

  console.log("\n✅ Migração concluída!");
}

migrate()
  .catch((e) => { console.error("❌ Erro:", e); process.exit(1); })
  .finally(async () => { await local.$disconnect(); await turso.$disconnect(); });
