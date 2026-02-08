import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, signToken, COOKIE_NAME } from "@/lib/auth";

// POST /api/auth/login — admin login
export async function POST(req: NextRequest) {
  console.log("[API] POST /api/auth/login");
  try {
    const { email, password } = await req.json();
    console.log("[API] POST /api/auth/login attempt for:", email);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    const session = await authenticateAdmin(email, password);
    if (!session) {
      console.warn("[API] POST /api/auth/login FAILED for:", email);
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }
    console.log("[API] POST /api/auth/login SUCCESS for:", email);

    const token = await signToken(session);

    const response = NextResponse.json({ success: true, data: session });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 24 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[API] POST /api/auth/login ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
