import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-utils";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
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
          include: {
            section: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return errorResponse("User not found or inactive", 401);
    }

    return jsonResponse({ user });
  } catch (error) {
    console.error("Get session error:", error);
    return errorResponse("Internal server error", 500);
  }
}
