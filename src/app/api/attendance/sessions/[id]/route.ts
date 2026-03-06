import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-utils";
import { canManageAttendance, canManagePenalties } from "@/lib/auth";
import { attendanceRecordSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;

    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, username: true } },
        sections: true,
        event: true,
        records: {
          include: {
            member: {
              include: { section: true },
            },
          },
          orderBy: [
            { member: { section: { sortOrder: "asc" } } },
            { member: { lastName: "asc" } },
          ],
        },
      },
    });

    if (!attendanceSession) {
      return errorResponse("Attendance session not found", 404);
    }

    return jsonResponse({ session: attendanceSession });
  } catch (error) {
    console.error("Get attendance session error:", error);
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

    if (!canManageAttendance(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;

    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: { id },
    });

    if (!attendanceSession) {
      return errorResponse("Attendance session not found", 404);
    }

    if (attendanceSession.isFinalized) {
      return errorResponse("Cannot update a finalized session");
    }

    const body = await request.json();
    const recordsSchema = z.array(attendanceRecordSchema);
    const parsed = recordsSchema.safeParse(body.records);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const records = parsed.data;

    // Update records in a transaction
    await prisma.$transaction(
      records.map((record) =>
        prisma.attendanceRecord.upsert({
          where: {
            sessionId_memberId: {
              sessionId: id,
              memberId: record.memberId,
            },
          },
          update: {
            status: record.status,
            checkInTime: record.checkInTime,
            minutesLate: record.minutesLate,
            notes: record.notes,
          },
          create: {
            sessionId: id,
            memberId: record.memberId,
            status: record.status,
            checkInTime: record.checkInTime,
            minutesLate: record.minutesLate,
            notes: record.notes,
          },
        })
      )
    );

    await createAuditLog({
      userId: session.userId,
      action: "UPDATE",
      entity: "AttendanceSession",
      entityId: id,
      details: `Updated ${records.length} attendance records`,
    });

    const updated = await prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        records: {
          include: {
            member: { include: { section: true } },
          },
        },
      },
    });

    return jsonResponse({ session: updated });
  } catch (error) {
    console.error("Update attendance records error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canManageAttendance(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;

    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        records: {
          include: { member: true },
        },
      },
    });

    if (!attendanceSession) {
      return errorResponse("Attendance session not found", 404);
    }

    if (attendanceSession.isFinalized) {
      return errorResponse("Session is already finalized");
    }

    // Get active penalty rules
    const penaltyRules = await prisma.penaltyRule.findMany({
      where: { isActive: true },
    });

    const lateRules = penaltyRules.filter((r) => r.penaltyType === "LATE_COMING");
    const absentRules = penaltyRules.filter((r) => r.penaltyType === "ABSENCE");

    const penaltiesToCreate: {
      memberId: string;
      penaltyRuleId: string;
      penaltyType: "LATE_COMING" | "ABSENCE";
      amount: number;
      balance: number;
      reason: string;
      sessionDate: Date;
    }[] = [];

    for (const record of attendanceSession.records) {
      if (record.status === "LATE") {
        for (const rule of lateRules) {
          const ruleAmount = Number(rule.amount);
          // Check grace period: only apply penalty if minutesLate exceeds grace period
          if (rule.applyAfterGrace && rule.gracePeriodMin > 0) {
            if ((record.minutesLate ?? 0) <= rule.gracePeriodMin) {
              continue;
            }
          }
          penaltiesToCreate.push({
            memberId: record.memberId,
            penaltyRuleId: rule.id,
            penaltyType: "LATE_COMING",
            amount: ruleAmount,
            balance: ruleAmount,
            reason: `Late for ${attendanceSession.eventType} on ${attendanceSession.date.toISOString().split("T")[0]}${record.minutesLate ? ` (${record.minutesLate} minutes late)` : ""}`,
            sessionDate: attendanceSession.date,
          });
        }
      } else if (record.status === "ABSENT") {
        for (const rule of absentRules) {
          const ruleAmount = Number(rule.amount);
          penaltiesToCreate.push({
            memberId: record.memberId,
            penaltyRuleId: rule.id,
            penaltyType: "ABSENCE",
            amount: ruleAmount,
            balance: ruleAmount,
            reason: `Absent from ${attendanceSession.eventType} on ${attendanceSession.date.toISOString().split("T")[0]}`,
            sessionDate: attendanceSession.date,
          });
        }
      }
    }

    // Create penalties and finalize session in a transaction
    await prisma.$transaction(async (tx) => {
      if (penaltiesToCreate.length > 0) {
        await tx.penalty.createMany({
          data: penaltiesToCreate,
        });
      }

      await tx.attendanceSession.update({
        where: { id },
        data: { isFinalized: true },
      });
    });

    await createAuditLog({
      userId: session.userId,
      action: "FINALIZE",
      entity: "AttendanceSession",
      entityId: id,
      details: `Finalized attendance session. ${penaltiesToCreate.length} penalties created.`,
    });

    return jsonResponse({
      message: "Session finalized successfully",
      penaltiesCreated: penaltiesToCreate.length,
    });
  } catch (error) {
    console.error("Finalize attendance session error:", error);
    return errorResponse("Internal server error", 500);
  }
}
