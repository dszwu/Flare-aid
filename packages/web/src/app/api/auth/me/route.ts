import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, COOKIE_NAME } from "@/lib/auth";

// GET /api/auth/me — current admin session
export async function GET(req: NextRequest) {
  console.log("[API] GET /api/auth/me");
  const session = await getSessionFromRequest(req);
  if (!session) {
    console.log("[API] GET /api/auth/me => not authenticated");
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }
  console.log("[API] GET /api/auth/me => authenticated as:", session.email);
  return NextResponse.json({ success: true, data: session });
}

// POST /api/auth/logout
export async function POST() {
  console.log("[API] POST /api/auth/me (logout)");
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}
