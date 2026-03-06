import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-utils";
import { canManageMembers } from "@/lib/auth";
import { memberSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        section: true,
        user: {
          select: { id: true, email: true, username: true, role: true },
        },
        attendanceRecords: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { session: true },
        },
        penalties: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        payments: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!member) {
      return errorResponse("Member not found", 404);
    }

    return jsonResponse({ member });
  } catch (error) {
    console.error("Get member error:", error);
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

    if (!canManageMembers(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;

    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Member not found", 404);
    }

    const body = await request.json();
    const parsed = memberSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const data = parsed.data;

    const member = await prisma.member.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        otherNames: data.otherNames,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        phone: data.phone,
        altPhone: data.altPhone,
        email: data.email || null,
        residentialAddress: data.residentialAddress,
        nrcIdNumber: data.nrcIdNumber,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        dateJoined: data.dateJoined ? new Date(data.dateJoined) : undefined,
        sectionId: data.sectionId,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation,
        baptismStatus: data.baptismStatus,
        churchName: data.churchName,
        status: data.status,
        notes: data.notes,
      },
      include: { section: true },
    });

    await createAuditLog({
      userId: session.userId,
      action: "UPDATE",
      entity: "Member",
      entityId: member.id,
      details: `Updated member: ${member.firstName} ${member.lastName}`,
    });

    return jsonResponse({ member });
  } catch (error) {
    console.error("Update member error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canManageMembers(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;

    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Member not found", 404);
    }

    const member = await prisma.member.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    await createAuditLog({
      userId: session.userId,
      action: "ARCHIVE",
      entity: "Member",
      entityId: member.id,
      details: `Archived member: ${existing.firstName} ${existing.lastName}`,
    });

    return jsonResponse({ message: "Member archived successfully" });
  } catch (error) {
    console.error("Delete member error:", error);
    return errorResponse("Internal server error", 500);
  }
}
