import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(request: Request) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const leaders = await prisma.leader.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return jsonResponse({ leaders });
}

export async function POST(request: Request) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  if (!body.name) return errorResponse("Name is required");
  if (!body.position) return errorResponse("Position is required");

  const leader = await prisma.leader.create({
    data: {
      name: body.name,
      position: body.position,
      bio: body.bio || null,
      imageUrl: body.imageUrl || null,
      isPublished: body.isPublished !== false,
      sortOrder: body.sortOrder || 0,
    },
  });

  return jsonResponse({ leader }, 201);
}
