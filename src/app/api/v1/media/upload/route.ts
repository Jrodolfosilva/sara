import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { auth } from "@/auth";
import { minioClient, MINIO_BUCKET, minioPublicUrl, garantirBucket } from "@/lib/minio";

const MAX_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Arquivo maior que 8MB" }, { status: 400 });
  }

  await garantirBucket();

  const ext = path.extname(file.name) || "";
  const objectName = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await minioClient.putObject(MINIO_BUCKET, objectName, buffer, buffer.length, {
    "Content-Type": file.type,
  });

  return NextResponse.json({ url: minioPublicUrl(objectName) }, { status: 201 });
}
