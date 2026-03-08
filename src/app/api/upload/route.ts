import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireRole } from "@/lib/api-utils";

export async function POST(request: Request) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  // Use Vercel Blob in production
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${filename}`, buffer, { access: "public" });
    return NextResponse.json({ url: blob.url });
  }

  // Fallback: write to public directory (development)
  const uploadDir = path.join(process.cwd(), "public", "images", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/images/uploads/${filename}` });
}
