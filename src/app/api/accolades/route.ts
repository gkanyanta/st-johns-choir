import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(request: Request) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const accolades = await prisma.accolade.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return jsonResponse({ accolades });
}

export async function POST(request: Request) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  if (!body.title) return errorResponse("Title is required");

  const accolade = await prisma.accolade.create({
    data: {
      title: body.title,
      description: body.description || null,
      date: body.date ? new Date(body.date) : null,
      category: body.category || null,
      imageUrl: body.imageUrl || null,
      isPublished: body.isPublished !== false,
      sortOrder: body.sortOrder || 0,
    },
  });

  return jsonResponse({ accolade }, 201);
}
