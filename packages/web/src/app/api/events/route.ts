import { NextRequest, NextResponse } from "next/server";
import { db, ensureDb } from "@/db";
import { rowsToCamelCase } from "@/lib/utils";

// GET /api/events — list approved events with donation totals
export async function GET(req: NextRequest) {
  console.log("[API] GET /api/events", { url: req.url });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const offset = (page - 1) * pageSize;
  console.log("[API] GET /api/events params:", { type, page, pageSize, offset });

  try {
    await ensureDb();
    let result;
    if (type) {
      result = await db.query(
        `SELECT e.*, COALESCE(SUM(CAST(d.amount_wei AS NUMERIC)), 0) as "totalDonatedWei"
         FROM disaster_events e
         LEFT JOIN donations d ON d.event_id = e.id
         WHERE e.status = 'approved' AND e.type = $1
         GROUP BY e.id
         ORDER BY e.created_at DESC
         LIMIT $2 OFFSET $3`,
        [type, pageSize, offset]
      );
    } else {
      result = await db.query(
        `SELECT e.*, COALESCE(SUM(CAST(d.amount_wei AS NUMERIC)), 0) as "totalDonatedWei"
         FROM disaster_events e
         LEFT JOIN donations d ON d.event_id = e.id
         WHERE e.status = 'approved'
         GROUP BY e.id
         ORDER BY e.created_at DESC
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );
    }

    console.log(`[API] GET /api/events => ${result.rows.length} events`);
    return NextResponse.json({ success: true, data: rowsToCamelCase(result.rows) });
  } catch (error: any) {
    console.error("[API] GET /api/events ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
