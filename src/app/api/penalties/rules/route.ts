import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-utils";
import { canManagePenalties } from "@/lib/auth";
import { penaltyRuleSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const rules = await prisma.penaltyRule.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { penalties: true } },
      },
    });

    return jsonResponse({ rules });
  } catch (error) {
    console.error("List penalty rules error:", error);
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
    const parsed = penaltyRuleSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const data = parsed.data;

    const rule = await prisma.penaltyRule.create({
      data: {
        name: data.name,
        penaltyType: data.penaltyType,
        amount: data.amount,
        gracePeriodMin: data.gracePeriodMin,
        applyAfterGrace: data.applyAfterGrace,
        isActive: data.isActive,
        description: data.description,
      },
    });

    await createAuditLog({
      userId: session.userId,
      action: "CREATE",
      entity: "PenaltyRule",
      entityId: rule.id,
      details: `Created penalty rule: ${rule.name} (${rule.penaltyType}, amount: ${rule.amount})`,
    });

    return jsonResponse({ rule }, 201);
  } catch (error) {
    console.error("Create penalty rule error:", error);
    return errorResponse("Internal server error", 500);
  }
}
