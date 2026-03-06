import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-utils";
import { canManageSettings } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const settingsUpdateSchema = z.record(z.string(), z.string());

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const settings = await prisma.setting.findMany({
      orderBy: { key: "asc" },
    });

    const settingsMap: Record<string, string> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return jsonResponse({ settings: settingsMap });
  } catch (error) {
    console.error("Get settings error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!canManageSettings(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const parsed = settingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid settings format. Expected key-value pairs.");
    }

    const settings = parsed.data;
    const keys = Object.keys(settings);

    await prisma.$transaction(
      keys.map((key) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: settings[key] },
          create: { key, value: settings[key] },
        })
      )
    );

    await createAuditLog({
      userId: session.userId,
      action: "UPDATE",
      entity: "Setting",
      details: `Updated settings: ${keys.join(", ")}`,
    });

    // Return updated settings
    const allSettings = await prisma.setting.findMany({
      orderBy: { key: "asc" },
    });

    const settingsMap: Record<string, string> = {};
    for (const setting of allSettings) {
      settingsMap[setting.key] = setting.value;
    }

    return jsonResponse({ settings: settingsMap });
  } catch (error) {
    console.error("Update settings error:", error);
    return errorResponse("Internal server error", 500);
  }
}
