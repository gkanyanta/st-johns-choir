import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth, parseSearchParams } from "@/lib/api-utils";
import { canManageMembers } from "@/lib/auth";
import { memberSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";
import { Prisma } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { page, limit, search, sortBy, sortOrder, section, status } =
      parseSearchParams(request.url);

    const where: Prisma.MemberWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (section) {
      where.sectionId = section;
    }

    if (status) {
      where.status = status as Prisma.EnumMemberStatusFilter["equals"];
    } else {
      where.status = { not: "ARCHIVED" };
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        include: { section: true },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.member.count({ where }),
    ]);

    return jsonResponse({
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List members error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canManageMembers(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const parsed = memberSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const data = parsed.data;

    const member = await prisma.member.create({
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
        dateJoined: data.dateJoined ? new Date(data.dateJoined) : new Date(),
        sectionId: data.sectionId,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation,
        baptismStatus: data.baptismStatus,
        churchName: data.churchName,
        status: data.status || "ACTIVE",
        notes: data.notes,
      },
      include: { section: true },
    });

    await createAuditLog({
      userId: session.userId,
      action: "CREATE",
      entity: "Member",
      entityId: member.id,
      details: `Created member: ${member.firstName} ${member.lastName}`,
    });

    return jsonResponse({ member }, 201);
  } catch (error) {
    console.error("Create member error:", error);
    return errorResponse("Internal server error", 500);
  }
}
