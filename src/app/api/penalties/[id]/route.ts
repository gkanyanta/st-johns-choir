import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-utils";
import { canManagePenalties } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const penaltyUpdateSchema = z.object({
  amount: z.number().positive().optional(),
  status: z.enum(["UNPAID", "PARTIALLY_PAID", "PAID", "WAIVED"]).optional(),
  waivedAmount: z.number().min(0).optional(),
  waiverReason: z.string().max(500).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  reason: z.string().max(500).optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;

    const penalty = await prisma.penalty.findUnique({
      where: { id },
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true, section: true },
        },
        penaltyRule: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!penalty) {
      return errorResponse("Penalty not found", 404);
    }

    return jsonResponse({ penalty });
  } catch (error) {
    console.error("Get penalty error:", error);
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

    if (!canManagePenalties(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;

    const existing = await prisma.penalty.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Penalty not found", 404);
    }

    const body = await request.json();
    const parsed = penaltyUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (data.amount !== undefined) {
      updateData.amount = data.amount;
      const amountPaid = Number(existing.amountPaid);
      const waivedAmount = data.waivedAmount !== undefined ? data.waivedAmount : Number(existing.waivedAmount);
      updateData.balance = data.amount - amountPaid - waivedAmount;
    }

    if (data.waivedAmount !== undefined) {
      updateData.waivedAmount = data.waivedAmount;
      const amount = data.amount !== undefined ? data.amount : Number(existing.amount);
      const amountPaid = Number(existing.amountPaid);
      updateData.balance = amount - amountPaid - data.waivedAmount;
    }

    if (data.waiverReason !== undefined) updateData.waiverReason = data.waiverReason;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.reason !== undefined) updateData.reason = data.reason;

    if (data.status === "WAIVED") {
      updateData.status = "WAIVED";
      updateData.waivedAmount = data.waivedAmount ?? Number(existing.balance);
      updateData.balance = 0;
    } else if (data.status !== undefined) {
      updateData.status = data.status;
    } else if (updateData.balance !== undefined) {
      const balance = Number(updateData.balance);
      if (balance <= 0) {
        updateData.balance = 0;
        updateData.status = "PAID";
      } else if (Number(existing.amountPaid) > 0 || (data.waivedAmount && data.waivedAmount > 0)) {
        updateData.status = "PARTIALLY_PAID";
      }
    }

    const penalty = await prisma.penalty.update({
      where: { id },
      data: updateData,
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await createAuditLog({
      userId: session.userId,
      action: "UPDATE",
      entity: "Penalty",
      entityId: id,
      details: `Updated penalty: ${JSON.stringify(data)}`,
    });

    return jsonResponse({ penalty });
  } catch (error) {
    console.error("Update penalty error:", error);
    return errorResponse("Internal server error", 500);
  }
}
