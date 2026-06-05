import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "gbpendotiba", public_id: filename, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function uploadToLocal(buffer: Buffer, ext: string): Promise<string> {
  const filename = `${uuidv4()}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      return NextResponse.json({ error: "Tipo não permitido" }, { status: 400 });
    }
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Máx 10MB" }, { status: 400 });
    }

    // Produção: Cloudinary | Desenvolvimento: local
    const url = process.env.CLOUDINARY_CLOUD_NAME
      ? await uploadToCloudinary(buffer, uuidv4())
      : await uploadToLocal(buffer, ext);

    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
  }
}
