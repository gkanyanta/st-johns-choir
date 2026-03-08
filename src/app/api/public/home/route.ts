import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalMembers, totalSections, upcomingEvents, recentAnnouncements, accolades] = await Promise.all([
      prisma.member.count({ where: { status: "ACTIVE" } }),
      prisma.section.count({ where: { isActive: true } }),
      prisma.event.findMany({
        where: { date: { gte: new Date() }, status: "UPCOMING" },
        orderBy: { date: "asc" },
        take: 5,
        select: { id: true, title: true, date: true, eventType: true, venue: true },
      }),
      prisma.announcement.findMany({
        orderBy: { publishDate: "desc" },
        take: 6,
        select: { id: true, title: true, content: true, isUrgent: true, publishDate: true },
      }),
      prisma.accolade.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { date: "desc" }],
        take: 6,
        select: { id: true, title: true, description: true, date: true, category: true },
      }),
    ]);

    return NextResponse.json({ totalMembers, totalSections, upcomingEvents, recentAnnouncements, accolades });
  } catch {
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
