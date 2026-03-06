import { NextResponse } from "next/server";
import { getSession, JWTPayload } from "./auth";
import type { Role } from "@/generated/prisma";

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireAuth(): Promise<JWTPayload | NextResponse> {
  const session = await getSession();
  if (!session) {
    return errorResponse("Unauthorized", 401);
  }
  return session;
}

export async function requireRole(roles: Role[]): Promise<JWTPayload | NextResponse> {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  if (!roles.includes(session.role)) {
    return errorResponse("Forbidden", 403);
  }
  return session;
}

export function parseSearchParams(url: string) {
  const { searchParams } = new URL(url);
  return {
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "20"),
    search: searchParams.get("search") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: (searchParams.get("sortOrder") || "desc") as "asc" | "desc",
    section: searchParams.get("section") || "",
    status: searchParams.get("status") || "",
    dateFrom: searchParams.get("dateFrom") || "",
    dateTo: searchParams.get("dateTo") || "",
    eventType: searchParams.get("eventType") || "",
    category: searchParams.get("category") || "",
    memberId: searchParams.get("memberId") || "",
  };
}
