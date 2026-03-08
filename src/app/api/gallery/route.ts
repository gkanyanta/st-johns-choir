import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(request: Request) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const photos = await prisma.galleryPhoto.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return jsonResponse({ photos });
}

export async function POST(request: Request) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  if (!body.imageUrl) return errorResponse("Image is required");

  const photo = await prisma.galleryPhoto.create({
    data: {
      imageUrl: body.imageUrl,
      caption: body.caption || null,
      isPublished: body.isPublished !== false,
      sortOrder: body.sortOrder || 0,
    },
  });

  return jsonResponse({ photo }, 201);
}
