import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sections = await prisma.section.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    });
    return NextResponse.json({ sections });
  } catch {
    return NextResponse.json({ error: "Failed to load sections" }, { status: 500 });
  }
}
