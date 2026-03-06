import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clearTokenCookie, getSession } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (session) {
      await createAuditLog({
        userId: session.userId,
        action: "LOGOUT",
        entity: "User",
        entityId: session.userId,
      });
    }

    const cookieHeader = clearTokenCookie();
    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200, headers: cookieHeader }
    );
  } catch (error) {
    console.error("Logout error:", error);
    const cookieHeader = clearTokenCookie();
    return NextResponse.json(
      { message: "Logged out" },
      { status: 200, headers: cookieHeader }
    );
  }
}
