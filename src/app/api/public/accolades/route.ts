import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const accolades = await prisma.accolade.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { date: "desc" }],
      select: { id: true, title: true, description: true, date: true, category: true, imageUrl: true },
    });
    return NextResponse.json({ accolades });
  } catch {
    return NextResponse.json({ error: "Failed to load accolades" }, { status: 500 });
  }
}
