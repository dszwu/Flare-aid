import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rowsToCamelCase } from "@/lib/utils";

// GET /api/events — list approved events with donation totals
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const offset = (page - 1) * pageSize;

  try {
    let events: any[];
    if (type) {
      events = db
        .prepare(
          `SELECT e.*, COALESCE(SUM(CAST(d.amount_wei AS REAL)), 0) as totalDonatedWei
           FROM disaster_events e
           LEFT JOIN donations d ON d.event_id = e.id
           WHERE e.status = 'approved' AND e.type = ?
           GROUP BY e.id
           ORDER BY e.created_at DESC
           LIMIT ? OFFSET ?`
        )
        .all(type, pageSize, offset);
    } else {
      events = db
        .prepare(
          `SELECT e.*, COALESCE(SUM(CAST(d.amount_wei AS REAL)), 0) as totalDonatedWei
           FROM disaster_events e
           LEFT JOIN donations d ON d.event_id = e.id
           WHERE e.status = 'approved'
           GROUP BY e.id
           ORDER BY e.created_at DESC
           LIMIT ? OFFSET ?`
        )
        .all(pageSize, offset);
    }

    return NextResponse.json({ success: true, data: rowsToCamelCase(events) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
