import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getSessionFromRequest } from "@/lib/auth";
import { rowsToCamelCase } from "@/lib/utils";

// GET /api/orgs/all — list ALL organizations including non-allowlisted (admin only)
export async function GET(req: NextRequest) {
  console.log("[API] GET /api/orgs/all");
  const session = await getSessionFromRequest(req);
  if (!session) {
    console.warn("[API] GET /api/orgs/all => unauthorized");
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orgs = db.prepare("SELECT * FROM organizations").all();
    console.log(`[API] GET /api/orgs/all => ${orgs.length} orgs`);
    return NextResponse.json({ success: true, data: rowsToCamelCase(orgs) });
  } catch (error: any) {
    console.error("[API] GET /api/orgs/all ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
