import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { toCamelCase, rowsToCamelCase } from "@/lib/utils";

// GET /api/events/[id] — event detail with allocations and donation total
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const event = db.prepare("SELECT * FROM disaster_events WHERE id = ?").get(id) as any;
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const allocs = db
      .prepare(
        `SELECT a.*, o.name as org_name FROM allocations a
         LEFT JOIN organizations o ON o.id = a.org_id
         WHERE a.event_id = ?`
      )
      .all(id);

    const donationTotal = db
      .prepare(
        "SELECT COALESCE(SUM(CAST(amount_wei AS REAL)), 0) as total, COUNT(*) as count FROM donations WHERE event_id = ?"
      )
      .get(id) as any;

    const recentDonations = db
      .prepare("SELECT * FROM donations WHERE event_id = ? ORDER BY block_number DESC LIMIT 20")
      .all(id);

    return NextResponse.json({
      success: true,
      data: {
        ...toCamelCase(event),
        allocations: rowsToCamelCase(allocs),
        totalDonatedWei: donationTotal?.total?.toString() || "0",
        donationCount: donationTotal?.count || 0,
        recentDonations: rowsToCamelCase(recentDonations),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
