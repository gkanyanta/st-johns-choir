import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-utils";
import { canManageUsers, hashPassword } from "@/lib/auth";
import { userSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canManageUsers(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        memberId: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        member: {
          select: { id: true, firstName: true, lastName: true, section: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonResponse({ users });
  } catch (error) {
    console.error("List users error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canManageUsers(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const parsed = userSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const data = parsed.data;

    if (!data.password) {
      return errorResponse("Password is required for new users");
    }

    // Check for existing email or username
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      return errorResponse("Email already in use");
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUsername) {
      return errorResponse("Username already in use");
    }

    if (data.memberId) {
      const existingMemberUser = await prisma.user.findUnique({
        where: { memberId: data.memberId },
      });
      if (existingMemberUser) {
        return errorResponse("This member already has a user account");
      }
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        role: data.role,
        memberId: data.memberId || null,
        isActive: data.isActive,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        memberId: true,
        isActive: true,
        createdAt: true,
        member: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await createAuditLog({
      userId: session.userId,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      details: `Created user: ${user.username} (${user.role})`,
    });

    return jsonResponse({ user }, 201);
  } catch (error) {
    console.error("Create user error:", error);
    return errorResponse("Internal server error", 500);
  }
}
