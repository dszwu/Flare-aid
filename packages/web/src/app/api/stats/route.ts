import { NextResponse } from "next/server";
import { db } from "@/db";

// GET /api/stats — public aggregate stats for transparency
export async function GET() {
  try {
    const totalDonated = db
      .prepare("SELECT COALESCE(SUM(CAST(amount_wei AS REAL)), 0) as total FROM donations")
      .get() as any;

    const donationCount = db
      .prepare("SELECT COUNT(*) as count FROM donations")
      .get() as any;

    const activeEvents = db
      .prepare("SELECT COUNT(*) as count FROM disaster_events WHERE status = 'approved'")
      .get() as any;

    const completedPayouts = db
      .prepare("SELECT COUNT(*) as count FROM payouts WHERE status = 'completed'")
      .get() as any;

    const uniqueDonors = db
      .prepare("SELECT COUNT(DISTINCT donor_address) as count FROM donations")
      .get() as any;

    return NextResponse.json({
      success: true,
      data: {
        totalDonatedWei: totalDonated?.total?.toString() || "0",
        donationCount: donationCount?.count || 0,
        activeEvents: activeEvents?.count || 0,
        completedPayouts: completedPayouts?.count || 0,
        uniqueDonors: uniqueDonors?.count || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
