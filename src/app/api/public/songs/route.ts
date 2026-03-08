import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const songs = await prisma.song.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, title: true, artist: true, category: true, youtubeUrl: true, description: true },
    });
    return NextResponse.json({ songs });
  } catch {
    return NextResponse.json({ error: "Failed to load songs" }, { status: 500 });
  }
}
