import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-utils";
import { canManageSettings } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const sectionSchema = z.object({
  name: z.string().min(1, "Section name is required").max(100),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const sections = await prisma.section.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { members: { where: { status: "ACTIVE" } } },
        },
      },
    });

    return jsonResponse({ sections });
  } catch (error) {
    console.error("List sections error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canManageSettings(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const parsed = sectionSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const existing = await prisma.section.findUnique({
      where: { name: parsed.data.name },
    });
    if (existing) {
      return errorResponse("Section with this name already exists");
    }

    const section = await prisma.section.create({
      data: {
        name: parsed.data.name,
        sortOrder: parsed.data.sortOrder ?? 0,
        isActive: parsed.data.isActive ?? true,
      },
    });

    await createAuditLog({
      userId: session.userId,
      action: "CREATE",
      entity: "Section",
      entityId: section.id,
      details: `Created section: ${section.name}`,
    });

    return jsonResponse({ section }, 201);
  } catch (error) {
    console.error("Create section error:", error);
    return errorResponse("Internal server error", 500);
  }
}
