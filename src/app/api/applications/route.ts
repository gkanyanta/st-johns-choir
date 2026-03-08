import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, jsonResponse, parseSearchParams } from "@/lib/api-utils";

export async function GET(request: Request) {
  const session = await requireRole(["SUPER_ADMIN", "SECRETARY", "CHOIR_DIRECTOR"]);
  if (session instanceof NextResponse) return session;

  const { page, limit, status } = parseSearchParams(request.url);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [applications, total] = await Promise.all([
    prisma.memberApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.memberApplication.count({ where }),
  ]);

  return jsonResponse({
    applications,
    pagination: { total, page, totalPages: Math.ceil(total / limit) },
  });
}
