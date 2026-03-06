import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-utils";
import { canManageEvents } from "@/lib/auth";
import { eventSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        attendanceSessions: {
          include: {
            _count: { select: { records: true } },
          },
        },
      },
    });

    if (!event) {
      return errorResponse("Event not found", 404);
    }

    return jsonResponse({ event });
  } catch (error) {
    console.error("Get event error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canManageEvents(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Event not found", 404);
    }

    const body = await request.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const data = parsed.data;

    const event = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        eventType: data.eventType,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : null,
        time: data.time,
        venue: data.venue,
        description: data.description,
        requiredSections: data.requiredSections || [],
        status: data.status,
        notes: data.notes,
      },
    });

    await createAuditLog({
      userId: session.userId,
      action: "UPDATE",
      entity: "Event",
      entityId: event.id,
      details: `Updated event: ${event.title}`,
    });

    return jsonResponse({ event });
  } catch (error) {
    console.error("Update event error:", error);
    return errorResponse("Internal server error", 500);
  }
}
