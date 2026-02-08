import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, COOKIE_NAME } from "@/lib/auth";

// GET /api/auth/me — current admin session
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ success: true, data: session });
}

// POST /api/auth/logout
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}
