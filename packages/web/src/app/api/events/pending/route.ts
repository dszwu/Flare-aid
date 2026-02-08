import { NextRequest, NextResponse } from "next/server";
import { db, ensureDb } from "@/db";
import { getSessionFromRequest } from "@/lib/auth";
import { rowsToCamelCase } from "@/lib/utils";

// GET /api/events/pending — list pending events (admin only)
export async function GET(req: NextRequest) {
  console.log("[API] GET /api/events/pending");
  const session = await getSessionFromRequest(req);
  if (!session) {
    console.warn("[API] GET /api/events/pending => unauthorized");
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDb();
    const result = await db.query(
      "SELECT * FROM disaster_events WHERE status = 'pending' ORDER BY severity_score DESC"
    );

    console.log(`[API] GET /api/events/pending => ${result.rows.length} events`);
    return NextResponse.json({ success: true, data: rowsToCamelCase(result.rows) });
  } catch (error: any) {
    console.error("[API] GET /api/events/pending ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
