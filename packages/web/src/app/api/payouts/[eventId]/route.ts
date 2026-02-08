import { NextRequest, NextResponse } from "next/server";
import { db, ensureDb } from "@/db";
import { rowsToCamelCase } from "@/lib/utils";

// GET /api/payouts/[eventId] — list payouts for an event
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    await ensureDb();
    const eventId = parseInt(params.eventId);
    const result = await db.query(
      `SELECT p.*, o.name as "orgName" FROM payouts p
       LEFT JOIN organizations o ON o.id = p.org_id
       WHERE p.event_id = $1
       ORDER BY p.created_at DESC`,
      [eventId]
    );

    return NextResponse.json({ success: true, data: rowsToCamelCase(result.rows) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
