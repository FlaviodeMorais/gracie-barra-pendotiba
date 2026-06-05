/**
 * Faz upload de todas as imagens locais para o Cloudinary
 * e atualiza as URLs no banco Turso.
 */
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function uploadFile(filePath, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { folder: "gbpendotiba", public_id: publicId, overwrite: true },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
  });
}

// Upload das fotos em public/uploads
const uploadsDir = path.join(ROOT, "public", "uploads");
const files = (await readdir(uploadsDir)).filter(
  (f) => !f.startsWith(".") && /\.(jpg|jpeg|png|webp|gif)$/i.test(f)
);

console.log(`📤 Fazendo upload de ${files.length} imagens...\n`);

const urlMap = {};
for (const file of files) {
  const filePath = path.join(uploadsDir, file);
  const publicId = file.replace(/\.[^.]+$/, "");
  const url = await uploadFile(filePath, publicId);
  urlMap[`/uploads/${file}`] = url;
  console.log(`✓ ${file} → ${url}`);
}

// Também faz upload do logo
const logoPath = path.join(ROOT, "public", "logo-gracie-barra.jpg");
const logoUrl = await uploadFile(logoPath, "logo-gracie-barra");
urlMap["/logo-gracie-barra.jpg"] = logoUrl;
console.log(`✓ logo-gracie-barra.jpg → ${logoUrl}`);

// Atualiza URLs dos banners no Turso
const banners = await prisma.banner.findMany();
let updated = 0;
for (const banner of banners) {
  const newUrl = urlMap[banner.imageUrl];
  if (newUrl) {
    await prisma.banner.update({ where: { id: banner.id }, data: { imageUrl: newUrl } });
    updated++;
  }
}

// Atualiza URL dos eventos
const events = await prisma.event.findMany({ where: { bannerUrl: { not: null } } });
for (const event of events) {
  const newUrl = urlMap[event.bannerUrl];
  if (newUrl) {
    await prisma.event.update({ where: { id: event.id }, data: { bannerUrl: newUrl } });
    updated++;
  }
}

console.log(`\n✅ Upload concluído! ${updated} registros atualizados no banco.`);
await prisma.$disconnect();
