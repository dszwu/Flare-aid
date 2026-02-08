import { NextRequest, NextResponse } from "next/server";
import { db, ensureDb } from "@/db";
import { toCamelCase, rowsToCamelCase } from "@/lib/utils";

// GET /api/events/[id] — event detail with allocations and donation total
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("[API] GET /api/events/[id]", { id: params.id });
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      console.warn("[API] GET /api/events/[id] invalid ID:", params.id);
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    await ensureDb();

    const eventResult = await db.query("SELECT * FROM disaster_events WHERE id = $1", [id]);
    const event = eventResult.rows[0];
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const allocsResult = await db.query(
      `SELECT a.*, o.name as org_name FROM allocations a
       LEFT JOIN organizations o ON o.id = a.org_id
       WHERE a.event_id = $1`,
      [id]
    );

    const donationTotal = await db.query(
      "SELECT COALESCE(SUM(CAST(amount_wei AS NUMERIC)), 0) as total, COUNT(*) as count FROM donations WHERE event_id = $1",
      [id]
    );

    const recentDonations = await db.query(
      "SELECT * FROM donations WHERE event_id = $1 ORDER BY block_number DESC LIMIT 20",
      [id]
    );

    const dt = donationTotal.rows[0];
    console.log(`[API] GET /api/events/${id} => found, ${allocsResult.rows.length} allocations, ${dt?.count || 0} donations`);
    return NextResponse.json({
      success: true,
      data: {
        ...toCamelCase(event),
        allocations: rowsToCamelCase(allocsResult.rows),
        totalDonatedWei: dt?.total?.toString() || "0",
        donationCount: parseInt(dt?.count) || 0,
        recentDonations: rowsToCamelCase(recentDonations.rows),
      },
    });
  } catch (error: any) {
    console.error("[API] GET /api/events/[id] ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
