import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth, parseSearchParams } from "@/lib/api-utils";
import { canManageAttendance } from "@/lib/auth";
import { attendanceSessionSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";
import { Prisma } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { page, limit, sortOrder, dateFrom, dateTo, eventType } =
      parseSearchParams(request.url);

    const where: Prisma.AttendanceSessionWhereInput = {};

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    if (eventType) {
      where.eventType = eventType as Prisma.EnumEventTypeFilter["equals"];
    }

    const [sessions, total] = await Promise.all([
      prisma.attendanceSession.findMany({
        where,
        include: {
          createdBy: { select: { id: true, username: true } },
          sections: true,
          event: { select: { id: true, title: true } },
          records: { select: { status: true } },
          _count: { select: { records: true } },
        },
        orderBy: { date: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.attendanceSession.count({ where }),
    ]);

    return jsonResponse({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List attendance sessions error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canManageAttendance(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const parsed = attendanceSessionSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const data = parsed.data;

    const attendanceSession = await prisma.attendanceSession.create({
      data: {
        date: new Date(data.date),
        eventType: data.eventType,
        venue: data.venue,
        startTime: data.startTime,
        reportingTime: data.reportingTime,
        notes: data.notes,
        createdById: session.userId,
        eventId: data.eventId || null,
        sections: data.sectionIds && data.sectionIds.length > 0
          ? { connect: data.sectionIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        sections: true,
        createdBy: { select: { id: true, username: true } },
      },
    });

    // Auto-create attendance records for relevant members
    const memberWhere: Prisma.MemberWhereInput = {
      status: "ACTIVE",
    };

    if (data.sectionIds && data.sectionIds.length > 0) {
      memberWhere.sectionId = { in: data.sectionIds };
    }

    const members = await prisma.member.findMany({
      where: memberWhere,
      select: { id: true },
    });

    if (members.length > 0) {
      await prisma.attendanceRecord.createMany({
        data: members.map((member) => ({
          sessionId: attendanceSession.id,
          memberId: member.id,
          status: "ABSENT" as const,
        })),
      });
    }

    await createAuditLog({
      userId: session.userId,
      action: "CREATE",
      entity: "AttendanceSession",
      entityId: attendanceSession.id,
      details: `Created attendance session for ${data.date} (${data.eventType}). ${members.length} records created.`,
    });

    return jsonResponse({
      session: attendanceSession,
      recordsCreated: members.length,
    }, 201);
  } catch (error) {
    console.error("Create attendance session error:", error);
    return errorResponse("Internal server error", 500);
  }
}
