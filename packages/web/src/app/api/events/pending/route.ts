import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getSessionFromRequest } from "@/lib/auth";
import { rowsToCamelCase } from "@/lib/utils";

// GET /api/events/pending — list pending events (admin only)
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = db
      .prepare("SELECT * FROM disaster_events WHERE status = 'pending' ORDER BY severity_score DESC")
      .all();

    return NextResponse.json({ success: true, data: rowsToCamelCase(events) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
