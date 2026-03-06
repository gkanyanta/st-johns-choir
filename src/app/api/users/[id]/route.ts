import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-utils";
import { canManageUsers, hashPassword } from "@/lib/auth";
import { userSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canManageUsers(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        memberId: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        member: {
          select: { id: true, firstName: true, lastName: true, section: true },
        },
      },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return jsonResponse({ user });
  } catch (error) {
    console.error("Get user error:", error);
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

    if (!canManageUsers(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("User not found", 404);
    }

    const body = await request.json();
    const parsed = userSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const data = parsed.data;

    // Check for duplicate email (excluding current user)
    if (data.email !== existing.email) {
      const emailTaken = await prisma.user.findFirst({
        where: { email: data.email, id: { not: id } },
      });
      if (emailTaken) {
        return errorResponse("Email already in use");
      }
    }

    // Check for duplicate username (excluding current user)
    if (data.username !== existing.username) {
      const usernameTaken = await prisma.user.findFirst({
        where: { username: data.username, id: { not: id } },
      });
      if (usernameTaken) {
        return errorResponse("Username already in use");
      }
    }

    // Check memberId uniqueness
    if (data.memberId && data.memberId !== existing.memberId) {
      const memberTaken = await prisma.user.findFirst({
        where: { memberId: data.memberId, id: { not: id } },
      });
      if (memberTaken) {
        return errorResponse("This member already has a user account");
      }
    }

    const updateData: Record<string, unknown> = {
      email: data.email,
      username: data.username,
      role: data.role,
      memberId: data.memberId || null,
      isActive: data.isActive,
    };

    // Only update password if provided
    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        memberId: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        member: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await createAuditLog({
      userId: session.userId,
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      details: `Updated user: ${user.username}${data.password ? " (password changed)" : ""}`,
    });

    return jsonResponse({ user });
  } catch (error) {
    console.error("Update user error:", error);
    return errorResponse("Internal server error", 500);
  }
}
