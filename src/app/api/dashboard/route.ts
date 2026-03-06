import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalMembers,
      membersBySection,
      attendanceThisMonth,
      outstandingPenalties,
      totalPaymentsThisMonth,
      upcomingEvents,
      recentAnnouncements,
      recentSessionsRaw,
    ] = await Promise.all([
      // Total active members
      prisma.member.count({ where: { status: "ACTIVE" } }),

      // Members by section
      prisma.section.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          _count: {
            select: { members: { where: { status: "ACTIVE" } } },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),

      // Attendance rate this month
      (async () => {
        const sessions = await prisma.attendanceSession.findMany({
          where: {
            date: { gte: startOfMonth, lte: endOfMonth },
            isFinalized: true,
          },
          include: {
            _count: { select: { records: true } },
          },
        });

        if (sessions.length === 0) return { rate: 0, sessions: 0 };

        const sessionIds = sessions.map((s) => s.id);
        const totalRecords = await prisma.attendanceRecord.count({
          where: { sessionId: { in: sessionIds } },
        });
        const presentRecords = await prisma.attendanceRecord.count({
          where: {
            sessionId: { in: sessionIds },
            status: { in: ["PRESENT", "LATE"] },
          },
        });

        return {
          rate: totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0,
          sessions: sessions.length,
          totalRecords,
          presentRecords,
        };
      })(),

      // Outstanding penalties
      (async () => {
        const penalties = await prisma.penalty.aggregate({
          where: { status: { in: ["UNPAID", "PARTIALLY_PAID"] } },
          _sum: { balance: true },
          _count: true,
        });
        return {
          count: penalties._count,
          totalBalance: penalties._sum.balance ?? 0,
        };
      })(),

      // Total payments this month
      (async () => {
        const payments = await prisma.payment.aggregate({
          where: {
            paymentDate: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amountPaid: true },
          _count: true,
        });
        return {
          count: payments._count,
          totalAmount: payments._sum.amountPaid ?? 0,
        };
      })(),

      // Upcoming events
      prisma.event.findMany({
        where: {
          date: { gte: now },
          status: "UPCOMING",
        },
        orderBy: { date: "asc" },
        take: 5,
      }),

      // Recent announcements
      prisma.announcement.findMany({
        orderBy: { publishDate: "desc" },
        take: 5,
        include: {
          createdBy: { select: { id: true, username: true } },
        },
      }),

      // Recent sessions
      prisma.attendanceSession.findMany({
        orderBy: { date: "desc" },
        take: 5,
        include: {
          records: { select: { status: true } },
        },
      }),
    ]);

    return jsonResponse({
      totalMembers,
      membersBySection: membersBySection.map((s) => ({
        id: s.id,
        name: s.name,
        count: s._count.members,
      })),
      attendance: attendanceThisMonth,
      outstandingPenalties,
      paymentsThisMonth: totalPaymentsThisMonth,
      upcomingEvents,
      recentAnnouncements,
      recentSessions: recentSessionsRaw.map((s: { id: string; date: Date; eventType: string; records: { status: string }[] }) => ({
        id: s.id,
        date: s.date,
        eventType: s.eventType,
        presentCount: s.records.filter((r: { status: string }) => r.status === "PRESENT" || r.status === "LATE").length,
        totalCount: s.records.length,
      })),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return errorResponse("Internal server error", 500);
  }
}
