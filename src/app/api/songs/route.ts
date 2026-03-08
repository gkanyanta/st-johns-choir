import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(request: Request) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const songs = await prisma.song.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return jsonResponse({ songs });
}

export async function POST(request: Request) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  if (!body.title) return errorResponse("Title is required");

  const song = await prisma.song.create({
    data: {
      title: body.title,
      artist: body.artist || null,
      category: body.category || null,
      youtubeUrl: body.youtubeUrl || null,
      description: body.description || null,
      isPublished: body.isPublished !== false,
      sortOrder: body.sortOrder || 0,
    },
  });

  return jsonResponse({ song }, 201);
}
