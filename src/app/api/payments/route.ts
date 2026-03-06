import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth, parseSearchParams } from "@/lib/api-utils";
import { canManagePayments } from "@/lib/auth";
import { paymentSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";
import { Prisma } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { page, limit, sortOrder, memberId, category, dateFrom, dateTo } =
      parseSearchParams(request.url);

    const where: Prisma.PaymentWhereInput = {};

    if (memberId) {
      where.memberId = memberId;
    }

    if (category) {
      where.category = category as Prisma.EnumPaymentCategoryFilter["equals"];
    }

    if (dateFrom || dateTo) {
      where.paymentDate = {};
      if (dateFrom) where.paymentDate.gte = new Date(dateFrom);
      if (dateTo) where.paymentDate.lte = new Date(dateTo);
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true, section: true },
          },
          penalty: { select: { id: true, penaltyType: true, amount: true } },
          recordedBy: { select: { id: true, username: true } },
        },
        orderBy: { paymentDate: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return jsonResponse({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List payments error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canManagePayments(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const parsed = paymentSchema.safeParse(body);
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

    // If linked to a penalty, validate it exists
    if (data.penaltyId) {
      const penalty = await prisma.penalty.findUnique({
        where: { id: data.penaltyId },
      });
      if (!penalty) {
        return errorResponse("Penalty not found", 404);
      }
      if (penalty.memberId !== data.memberId) {
        return errorResponse("Penalty does not belong to this member");
      }
    }

    const paymentBalance = data.amountDue - data.amountPaid;

    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          memberId: data.memberId,
          category: data.category,
          penaltyId: data.penaltyId || null,
          amountDue: data.amountDue,
          amountPaid: data.amountPaid,
          balance: paymentBalance > 0 ? paymentBalance : 0,
          paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
          paymentMethod: data.paymentMethod,
          reference: data.reference,
          notes: data.notes,
          recordedById: session.userId,
        },
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true },
          },
          penalty: true,
          recordedBy: { select: { id: true, username: true } },
        },
      });

      // Update linked penalty if applicable
      if (data.penaltyId) {
        const penalty = await tx.penalty.findUnique({
          where: { id: data.penaltyId },
        });

        if (penalty) {
          const newAmountPaid = Number(penalty.amountPaid) + data.amountPaid;
          const newBalance = Number(penalty.amount) - newAmountPaid - Number(penalty.waivedAmount);
          const finalBalance = newBalance > 0 ? newBalance : 0;

          let newStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "WAIVED" = "UNPAID";
          if (finalBalance <= 0) {
            newStatus = "PAID";
          } else if (newAmountPaid > 0) {
            newStatus = "PARTIALLY_PAID";
          }

          await tx.penalty.update({
            where: { id: data.penaltyId },
            data: {
              amountPaid: newAmountPaid,
              balance: finalBalance,
              status: newStatus,
            },
          });
        }
      }

      return newPayment;
    });

    await createAuditLog({
      userId: session.userId,
      action: "CREATE",
      entity: "Payment",
      entityId: payment.id,
      details: `Payment of ${data.amountPaid} recorded for ${member.firstName} ${member.lastName} (${data.category})${data.penaltyId ? ` linked to penalty ${data.penaltyId}` : ""}`,
    });

    return jsonResponse({ payment }, 201);
  } catch (error) {
    console.error("Create payment error:", error);
    return errorResponse("Internal server error", 500);
  }
}
