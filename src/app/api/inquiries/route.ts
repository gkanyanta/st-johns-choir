import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, jsonResponse, errorResponse, parseSearchParams } from "@/lib/api-utils";

export async function GET(request: Request) {
  const session = await requireRole(["SUPER_ADMIN", "SECRETARY", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const { page, limit, status } = parseSearchParams(request.url);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.inquiry.count({ where }),
  ]);

  return jsonResponse({
    inquiries,
    pagination: { total, page, totalPages: Math.ceil(total / limit) },
  });
}
