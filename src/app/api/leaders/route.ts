import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(request: Request) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const leaders = await prisma.leader.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { member: { select: { id: true, firstName: true, lastName: true, profilePhoto: true } } },
  });

  return jsonResponse({ leaders });
}

export async function POST(request: Request) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  if (!body.position) return errorResponse("Position is required");
  if (!body.memberId && !body.name) return errorResponse("Please select a member or provide a name");

  let name = body.name;
  if (body.memberId) {
    const member = await prisma.member.findUnique({ where: { id: body.memberId } });
    if (!member) return errorResponse("Member not found");
    name = name || `${member.firstName} ${member.lastName}`;
  }

  const leader = await prisma.leader.create({
    data: {
      memberId: body.memberId || null,
      name,
      position: body.position,
      bio: body.bio || null,
      imageUrl: body.imageUrl || null,
      isPublished: body.isPublished !== false,
      sortOrder: body.sortOrder || 0,
    },
  });

  return jsonResponse({ leader }, 201);
}
