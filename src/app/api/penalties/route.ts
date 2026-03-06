import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth, parseSearchParams } from "@/lib/api-utils";
import { canManagePenalties } from "@/lib/auth";
import { penaltySchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";
import { Prisma } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { page, limit, sortOrder, status, memberId, dateFrom, dateTo } =
      parseSearchParams(request.url);

    const where: Prisma.PenaltyWhereInput = {};

    if (status) {
      where.status = status as Prisma.EnumPenaltyStatusFilter["equals"];
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [penalties, total] = await Promise.all([
      prisma.penalty.findMany({
        where,
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true, section: true },
          },
          penaltyRule: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.penalty.count({ where }),
    ]);

    return jsonResponse({
      penalties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List penalties error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canManagePenalties(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const parsed = penaltySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const data = parsed.data;

    const member = await prisma.member.findUnique({
      where: { id: data.memberId },
    });
    if (!member) {
      return errorResponse("Member not found", 404);
    }

    const penalty = await prisma.penalty.create({
      data: {
        memberId: data.memberId,
        penaltyType: data.penaltyType,
        amount: data.amount,
        balance: data.amount,
        reason: data.reason,
        notes: data.notes,
      },
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await createAuditLog({
      userId: session.userId,
      action: "CREATE",
      entity: "Penalty",
      entityId: penalty.id,
      details: `Manual penalty of ${data.amount} for ${member.firstName} ${member.lastName} (${data.penaltyType})`,
    });

    return jsonResponse({ penalty }, 201);
  } catch (error) {
    console.error("Create penalty error:", error);
    return errorResponse("Internal server error", 500);
  }
}
