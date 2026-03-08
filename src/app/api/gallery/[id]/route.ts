import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, jsonResponse, errorResponse } from "@/lib/api-utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const body = await request.json();

  try {
    const photo = await prisma.galleryPhoto.update({
      where: { id },
      data: {
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.caption !== undefined && { caption: body.caption || null }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });
    return jsonResponse({ photo });
  } catch {
    return errorResponse("Photo not found", 404);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["SUPER_ADMIN", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  try {
    await prisma.galleryPhoto.delete({ where: { id } });
    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Photo not found", 404);
  }
}
