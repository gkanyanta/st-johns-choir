import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth, parseSearchParams } from "@/lib/api-utils";
import { canManageAnnouncements } from "@/lib/auth";
import { announcementSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { page, limit, sortOrder } = parseSearchParams(request.url);

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        include: {
          createdBy: { select: { id: true, username: true } },
        },
        orderBy: { publishDate: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.announcement.count(),
    ]);

    return jsonResponse({
      announcements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List announcements error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canManageAnnouncements(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const parsed = announcementSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const data = parsed.data;

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        audience: data.audience,
        sectionId: data.sectionId,
        role: data.role,
        publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        isUrgent: data.isUrgent,
        createdById: session.userId,
      },
      include: {
        createdBy: { select: { id: true, username: true } },
      },
    });

    await createAuditLog({
      userId: session.userId,
      action: "CREATE",
      entity: "Announcement",
      entityId: announcement.id,
      details: `Created announcement: ${announcement.title}`,
    });

    return jsonResponse({ announcement }, 201);
  } catch (error) {
    console.error("Create announcement error:", error);
    return errorResponse("Internal server error", 500);
  }
}
