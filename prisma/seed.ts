import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";

const absPath = path.join(process.cwd(), "dev.db").replace(/\\/g, "/");
const dbUrl = `file:///${absPath}`;
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@gbpendotiba.com.br";
  const password = process.env.ADMIN_PASSWORD || "GBPendotiba@2024";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    create: { email, name: "Administrador", passwordHash },
    update: { passwordHash },
  });

  const defaultHours = [
    { day: 0, open: true, openTime: "08:00", closeTime: "12:00" },
    { day: 1, open: true, openTime: "06:00", closeTime: "22:00" },
    { day: 2, open: true, openTime: "06:00", closeTime: "22:00" },
    { day: 3, open: true, openTime: "06:00", closeTime: "22:00" },
    { day: 4, open: true, openTime: "06:00", closeTime: "22:00" },
    { day: 5, open: true, openTime: "06:00", closeTime: "22:00" },
    { day: 6, open: true, openTime: "08:00", closeTime: "12:00" },
  ];
  for (const h of defaultHours) {
    await prisma.operatingHours.upsert({ where: { day: h.day }, create: h, update: h });
  }

  const scheduleData = [
    { day: 1, startTime: "06:00", endTime: "07:00", modality: "Jiu-Jitsu", level: "Fundamentos", instructor: "André Amaral" },
    { day: 1, startTime: "07:00", endTime: "08:00", modality: "Jiu-Jitsu", level: "Avançado", instructor: "André Amaral" },
    { day: 1, startTime: "10:00", endTime: "11:00", modality: "Jiu-Jitsu", level: "Fundamentos", instructor: "André Amaral" },
    { day: 1, startTime: "18:00", endTime: "19:00", modality: "Jiu-Jitsu", level: "Infantil", instructor: "André Amaral" },
    { day: 1, startTime: "19:00", endTime: "20:30", modality: "Jiu-Jitsu", level: "Fundamentos", instructor: "André Amaral" },
    { day: 1, startTime: "20:30", endTime: "22:00", modality: "Jiu-Jitsu", level: "Avançado", instructor: "André Amaral" },
    { day: 2, startTime: "06:00", endTime: "07:00", modality: "Muay Thai", level: "Todos", instructor: "Instrutor" },
    { day: 2, startTime: "10:00", endTime: "11:00", modality: "Jiu-Jitsu", level: "Feminino", instructor: "André Amaral" },
    { day: 2, startTime: "19:00", endTime: "20:00", modality: "Muay Thai", level: "Todos", instructor: "Instrutor" },
    { day: 2, startTime: "20:00", endTime: "21:30", modality: "Jiu-Jitsu", level: "Fundamentos", instructor: "André Amaral" },
    { day: 3, startTime: "06:00", endTime: "07:00", modality: "Jiu-Jitsu", level: "Fundamentos", instructor: "André Amaral" },
    { day: 3, startTime: "07:00", endTime: "08:00", modality: "Jiu-Jitsu", level: "Avançado", instructor: "André Amaral" },
    { day: 3, startTime: "18:00", endTime: "19:00", modality: "Ginástica Artística", level: "Infantil", instructor: "Instrutor" },
    { day: 3, startTime: "19:00", endTime: "20:30", modality: "Jiu-Jitsu", level: "Fundamentos", instructor: "André Amaral" },
    { day: 3, startTime: "20:30", endTime: "22:00", modality: "Jiu-Jitsu", level: "Avançado", instructor: "André Amaral" },
    { day: 4, startTime: "06:00", endTime: "07:00", modality: "Muay Thai", level: "Todos", instructor: "Instrutor" },
    { day: 4, startTime: "10:00", endTime: "11:00", modality: "Jiu-Jitsu", level: "Feminino", instructor: "André Amaral" },
    { day: 4, startTime: "19:00", endTime: "20:00", modality: "Muay Thai", level: "Todos", instructor: "Instrutor" },
    { day: 4, startTime: "20:00", endTime: "21:30", modality: "Jiu-Jitsu", level: "Fundamentos", instructor: "André Amaral" },
    { day: 5, startTime: "06:00", endTime: "07:00", modality: "Jiu-Jitsu", level: "Fundamentos", instructor: "André Amaral" },
    { day: 5, startTime: "07:00", endTime: "08:00", modality: "Jiu-Jitsu", level: "Avançado", instructor: "André Amaral" },
    { day: 5, startTime: "19:00", endTime: "20:30", modality: "Jiu-Jitsu", level: "Faixa Preta", instructor: "André Amaral" },
    { day: 6, startTime: "09:00", endTime: "10:30", modality: "Jiu-Jitsu", level: "Todos", instructor: "André Amaral" },
    { day: 6, startTime: "10:30", endTime: "12:00", modality: "Muay Thai", level: "Todos", instructor: "Instrutor" },
  ];
  await prisma.classSchedule.deleteMany();
  await prisma.classSchedule.createMany({ data: scheduleData });

  const defaultSettings = [
    { key: "phone", value: "(21) 97469-7908" },
    { key: "email", value: "gb.pendotiba@gmail.com" },
    { key: "address", value: "Estr. Caetano Monteiro, 2912 - Pendotiba, Niterói - RJ" },
    { key: "instagram", value: "https://www.instagram.com/gbpendotiba/" },
    { key: "whatsapp", value: "5521974697908" },
    { key: "headCoach", value: "Mestre André Amaral" },
    { key: "headCoachBelt", value: "Faixa Preta 2º Grau" },
    { key: "pixKey", value: "gb.pendotiba@gmail.com" },
    { key: "pixKeyType", value: "email" },
    { key: "pixName", value: "Gracie Barra Pendotiba" },
    { key: "pixCity", value: "Niterói" },
    { key: "heroTitle", value: "Gracie Barra Pendotiba" },
    { key: "heroSubtitle", value: "Jiu-Jitsu & Defesa Pessoal" },
  ];
  for (const s of defaultSettings) {
    await prisma.siteSettings.upsert({ where: { key: s.key }, create: s, update: { value: s.value } });
  }

  console.log("Seed concluído! Admin:", email, "| Senha:", password);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
