import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getSessionFromRequest } from "@/lib/auth";

// POST /api/allocations — set allocation splits for an event (admin only)
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { eventId, splits } = body;

    if (!eventId || !splits || !Array.isArray(splits) || splits.length === 0) {
      return NextResponse.json(
        { success: false, error: "eventId and splits array required" },
        { status: 400 }
      );
    }

    const totalBps = splits.reduce((sum: number, s: any) => sum + s.splitBps, 0);
    if (totalBps !== 10000) {
      return NextResponse.json(
        { success: false, error: "Splits must sum to 10000 (100%)" },
        { status: 400 }
      );
    }

    // Remove existing allocations for this event
    db.prepare("DELETE FROM allocations WHERE event_id = ?").run(eventId);

    // Insert new allocations
    const now = new Date().toISOString();
    const stmt = db.prepare(
      "INSERT INTO allocations (event_id, org_id, split_bps, approved_by, approved_at) VALUES (?, ?, ?, ?, ?)"
    );
    for (const split of splits) {
      stmt.run(eventId, split.orgId, split.splitBps, session.email, now);
    }

    return NextResponse.json({
      success: true,
      data: { eventId, splits, approvedBy: session.email },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
