import { NextResponse } from "next/server";
import { db, ensureDb } from "@/db";

// GET /api/stats — public aggregate stats for transparency
export async function GET() {
  console.log("[API] GET /api/stats");
  try {
    await ensureDb();

    const totalDonated = await db.query(
      "SELECT COALESCE(SUM(CAST(amount_wei AS NUMERIC)), 0) as total FROM donations"
    );

    const donationCount = await db.query(
      "SELECT COUNT(*) as count FROM donations"
    );

    const activeEvents = await db.query(
      "SELECT COUNT(*) as count FROM disaster_events WHERE status = 'approved'"
    );

    const completedPayouts = await db.query(
      "SELECT COUNT(*) as count FROM payouts WHERE status = 'completed'"
    );

    const uniqueDonors = await db.query(
      "SELECT COUNT(DISTINCT donor_address) as count FROM donations"
    );

    const td = totalDonated.rows[0];
    const dc = donationCount.rows[0];
    const ae = activeEvents.rows[0];
    const cp = completedPayouts.rows[0];
    const ud = uniqueDonors.rows[0];

    console.log("[API] GET /api/stats =>", { totalDonated: td?.total, donationCount: dc?.count, activeEvents: ae?.count, completedPayouts: cp?.count, uniqueDonors: ud?.count });
    return NextResponse.json({
      success: true,
      data: {
        totalDonatedWei: td?.total?.toString() || "0",
        donationCount: parseInt(dc?.count) || 0,
        activeEvents: parseInt(ae?.count) || 0,
        completedPayouts: parseInt(cp?.count) || 0,
        uniqueDonors: parseInt(ud?.count) || 0,
      },
    });
  } catch (error: any) {
    console.error("[API] GET /api/stats ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
