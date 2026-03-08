import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, jsonResponse, errorResponse } from "@/lib/api-utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const body = await request.json();

  try {
    const accolade = await prisma.accolade.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.date !== undefined && { date: body.date ? new Date(body.date) : null }),
        ...(body.category !== undefined && { category: body.category || null }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl || null }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });
    return jsonResponse({ accolade });
  } catch {
    return errorResponse("Accolade not found", 404);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  try {
    await prisma.accolade.delete({ where: { id } });
    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Accolade not found", 404);
  }
}
