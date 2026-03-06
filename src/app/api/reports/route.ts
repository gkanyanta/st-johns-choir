import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-utils";
import { canViewReports, canViewFinancialReports } from "@/lib/auth";
import { Prisma } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canViewReports(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "members";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const sectionId = searchParams.get("section") || "";
    const memberId = searchParams.get("memberId") || "";
    const status = searchParams.get("status") || "";

    switch (type) {
      case "members": {
        const where: Prisma.MemberWhereInput = {};
        if (sectionId) where.sectionId = sectionId;
        if (status) where.status = status as Prisma.EnumMemberStatusFilter["equals"];
        else where.status = { not: "ARCHIVED" };

        const members = await prisma.member.findMany({
          where,
          include: {
            section: true,
            _count: {
              select: {
                attendanceRecords: true,
                penalties: true,
                payments: true,
              },
            },
          },
          orderBy: [{ section: { sortOrder: "asc" } }, { lastName: "asc" }],
        });

        const sections = await prisma.section.findMany({
          where: { isActive: true },
          select: {
            name: true,
            _count: { select: { members: { where } } },
          },
          orderBy: { sortOrder: "asc" },
        });

        return jsonResponse({
          type: "members",
          data: members,
          summary: {
            total: members.length,
            bySection: sections.map((s) => ({
              section: s.name,
              count: s._count.members,
            })),
            byGender: {
              male: members.filter((m) => m.gender === "MALE").length,
              female: members.filter((m) => m.gender === "FEMALE").length,
            },
            byStatus: {
              active: members.filter((m) => m.status === "ACTIVE").length,
              inactive: members.filter((m) => m.status === "INACTIVE").length,
              suspended: members.filter((m) => m.status === "SUSPENDED").length,
            },
          },
        });
      }

      case "attendance": {
        const sessionWhere: Prisma.AttendanceSessionWhereInput = {};
        if (dateFrom || dateTo) {
          sessionWhere.date = {};
          if (dateFrom) sessionWhere.date.gte = new Date(dateFrom);
          if (dateTo) sessionWhere.date.lte = new Date(dateTo);
        }

        const sessions = await prisma.attendanceSession.findMany({
          where: sessionWhere,
          include: {
            records: {
              include: {
                member: {
                  select: { id: true, firstName: true, lastName: true, sectionId: true },
                },
              },
            },
            sections: true,
          },
          orderBy: { date: "desc" },
        });

        let totalRecords = 0;
        let presentCount = 0;
        let lateCount = 0;
        let absentCount = 0;
        let excusedCount = 0;

        for (const s of sessions) {
          for (const r of s.records) {
            totalRecords++;
            if (r.status === "PRESENT") presentCount++;
            else if (r.status === "LATE") lateCount++;
            else if (r.status === "ABSENT") absentCount++;
            else if (r.status === "EXCUSED") excusedCount++;
          }
        }

        // Per-member attendance summary
        const memberAttendance: Record<string, { name: string; present: number; late: number; absent: number; excused: number; total: number }> = {};

        for (const s of sessions) {
          for (const r of s.records) {
            if (!memberAttendance[r.memberId]) {
              memberAttendance[r.memberId] = {
                name: `${r.member.firstName} ${r.member.lastName}`,
                present: 0,
                late: 0,
                absent: 0,
                excused: 0,
                total: 0,
              };
            }
            const ma = memberAttendance[r.memberId];
            ma.total++;
            if (r.status === "PRESENT") ma.present++;
            else if (r.status === "LATE") ma.late++;
            else if (r.status === "ABSENT") ma.absent++;
            else if (r.status === "EXCUSED") ma.excused++;
          }
        }

        return jsonResponse({
          type: "attendance",
          data: sessions,
          summary: {
            totalSessions: sessions.length,
            totalRecords,
            present: presentCount,
            late: lateCount,
            absent: absentCount,
            excused: excusedCount,
            attendanceRate: totalRecords > 0 ? Math.round(((presentCount + lateCount) / totalRecords) * 100) : 0,
          },
          memberSummary: Object.values(memberAttendance).sort((a, b) => {
            const rateA = a.total > 0 ? (a.present + a.late) / a.total : 0;
            const rateB = b.total > 0 ? (b.present + b.late) / b.total : 0;
            return rateB - rateA;
          }),
        });
      }

      case "penalties": {
        const penaltyWhere: Prisma.PenaltyWhereInput = {};
        if (memberId) penaltyWhere.memberId = memberId;
        if (status) penaltyWhere.status = status as Prisma.EnumPenaltyStatusFilter["equals"];
        if (dateFrom || dateTo) {
          penaltyWhere.createdAt = {};
          if (dateFrom) penaltyWhere.createdAt.gte = new Date(dateFrom);
          if (dateTo) penaltyWhere.createdAt.lte = new Date(dateTo);
        }

        const penalties = await prisma.penalty.findMany({
          where: penaltyWhere,
          include: {
            member: {
              select: { id: true, firstName: true, lastName: true, section: true },
            },
            penaltyRule: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        const totals = await prisma.penalty.aggregate({
          where: penaltyWhere,
          _sum: { amount: true, amountPaid: true, balance: true, waivedAmount: true },
          _count: true,
        });

        const byType: Record<string, number> = {};
        const byStatus: Record<string, number> = {};
        for (const p of penalties) {
          byType[p.penaltyType] = (byType[p.penaltyType] || 0) + 1;
          byStatus[p.status] = (byStatus[p.status] || 0) + 1;
        }

        return jsonResponse({
          type: "penalties",
          data: penalties,
          summary: {
            total: totals._count,
            totalAmount: totals._sum.amount ?? 0,
            totalPaid: totals._sum.amountPaid ?? 0,
            totalBalance: totals._sum.balance ?? 0,
            totalWaived: totals._sum.waivedAmount ?? 0,
            byType,
            byStatus,
          },
        });
      }

      case "payments": {
        if (!canViewFinancialReports(session.role)) {
          return errorResponse("Forbidden: financial reports require elevated permissions", 403);
        }

        const paymentWhere: Prisma.PaymentWhereInput = {};
        if (memberId) paymentWhere.memberId = memberId;
        if (dateFrom || dateTo) {
          paymentWhere.paymentDate = {};
          if (dateFrom) paymentWhere.paymentDate.gte = new Date(dateFrom);
          if (dateTo) paymentWhere.paymentDate.lte = new Date(dateTo);
        }

        const categoryFilter = searchParams.get("category") || "";
        if (categoryFilter) {
          paymentWhere.category = categoryFilter as Prisma.EnumPaymentCategoryFilter["equals"];
        }

        const payments = await prisma.payment.findMany({
          where: paymentWhere,
          include: {
            member: {
              select: { id: true, firstName: true, lastName: true, section: true },
            },
            recordedBy: { select: { id: true, username: true } },
          },
          orderBy: { paymentDate: "desc" },
        });

        const totals = await prisma.payment.aggregate({
          where: paymentWhere,
          _sum: { amountDue: true, amountPaid: true, balance: true },
          _count: true,
        });

        const byCategory: Record<string, { count: number; total: number }> = {};
        const byMethod: Record<string, { count: number; total: number }> = {};

        for (const p of payments) {
          if (!byCategory[p.category]) byCategory[p.category] = { count: 0, total: 0 };
          byCategory[p.category].count++;
          byCategory[p.category].total += Number(p.amountPaid);

          if (!byMethod[p.paymentMethod]) byMethod[p.paymentMethod] = { count: 0, total: 0 };
          byMethod[p.paymentMethod].count++;
          byMethod[p.paymentMethod].total += Number(p.amountPaid);
        }

        return jsonResponse({
          type: "payments",
          data: payments,
          summary: {
            total: totals._count,
            totalDue: totals._sum.amountDue ?? 0,
            totalPaid: totals._sum.amountPaid ?? 0,
            totalBalance: totals._sum.balance ?? 0,
            byCategory,
            byMethod,
          },
        });
      }

      case "events": {
        const eventWhere: Prisma.EventWhereInput = {};
        if (status) eventWhere.status = status as Prisma.EnumEventStatusFilter["equals"];
        if (dateFrom || dateTo) {
          eventWhere.date = {};
          if (dateFrom) eventWhere.date.gte = new Date(dateFrom);
          if (dateTo) eventWhere.date.lte = new Date(dateTo);
        }

        const eventTypeFilter = searchParams.get("eventType") || "";
        if (eventTypeFilter) {
          eventWhere.eventType = eventTypeFilter as Prisma.EnumEventTypeFilter["equals"];
        }

        const events = await prisma.event.findMany({
          where: eventWhere,
          include: {
            attendanceSessions: {
              include: {
                _count: { select: { records: true } },
              },
            },
          },
          orderBy: { date: "desc" },
        });

        const byType: Record<string, number> = {};
        const byStatus2: Record<string, number> = {};
        for (const e of events) {
          byType[e.eventType] = (byType[e.eventType] || 0) + 1;
          byStatus2[e.status] = (byStatus2[e.status] || 0) + 1;
        }

        return jsonResponse({
          type: "events",
          data: events,
          summary: {
            total: events.length,
            byType,
            byStatus: byStatus2,
          },
        });
      }

      default:
        return errorResponse("Invalid report type. Valid types: members, attendance, penalties, payments, events");
    }
  } catch (error) {
    console.error("Reports error:", error);
    return errorResponse("Internal server error", 500);
  }
}
