import { NextRequest, NextResponse } from "next/server";
import { db, ensureDb } from "@/db";
import { getSessionFromRequest } from "@/lib/auth";

// POST /api/events/[id]/approve — approve a pending event (admin only)
// Special case: POST /api/events/all/approve — bulk approve all pending events
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDb();

    // Bulk approve all pending events
    if (params.id === "all") {
      const result = await db.query(
        "UPDATE disaster_events SET status = 'approved', approved_by = $1, approved_at = $2 WHERE status = 'pending'",
        [session.email, new Date().toISOString()]
      );
      return NextResponse.json({ success: true, data: { approved: result.rowCount } });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const eventResult = await db.query("SELECT * FROM disaster_events WHERE id = $1", [id]);
    const event = eventResult.rows[0];
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }
    if (event.status !== "pending") {
      return NextResponse.json({ success: false, error: "Event is not pending" }, { status: 400 });
    }

    await db.query(
      "UPDATE disaster_events SET status = 'approved', approved_by = $1, approved_at = $2 WHERE id = $3",
      [session.email, new Date().toISOString(), id]
    );

    return NextResponse.json({ success: true, data: { id, status: "approved" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
