import { NextRequest, NextResponse } from "next/server";
import { db, ensureDb } from "@/db";
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
    await ensureDb();
    const result = await db.query("SELECT * FROM organizations");
    console.log(`[API] GET /api/orgs/all => ${result.rows.length} orgs`);
    return NextResponse.json({ success: true, data: rowsToCamelCase(result.rows) });
  } catch (error: any) {
    console.error("[API] GET /api/orgs/all ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
