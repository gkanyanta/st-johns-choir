import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth, parseSearchParams } from "@/lib/api-utils";
import { canManageEvents } from "@/lib/auth";
import { eventSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";
import { Prisma } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { page, limit, sortOrder, status, eventType, dateFrom, dateTo } =
      parseSearchParams(request.url);

    const where: Prisma.EventWhereInput = {};

    if (status) {
      where.status = status as Prisma.EnumEventStatusFilter["equals"];
    }

    if (eventType) {
      where.eventType = eventType as Prisma.EnumEventTypeFilter["equals"];
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { date: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return jsonResponse({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List events error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canManageEvents(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const data = parsed.data;

    const event = await prisma.event.create({
      data: {
        title: data.title,
        eventType: data.eventType,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : null,
        time: data.time,
        venue: data.venue,
        description: data.description,
        requiredSections: data.requiredSections || [],
        status: data.status || "UPCOMING",
        notes: data.notes,
      },
    });

    await createAuditLog({
      userId: session.userId,
      action: "CREATE",
      entity: "Event",
      entityId: event.id,
      details: `Created event: ${event.title} on ${data.date}`,
    });

    return jsonResponse({ event }, 201);
  } catch (error) {
    console.error("Create event error:", error);
    return errorResponse("Internal server error", 500);
  }
}
