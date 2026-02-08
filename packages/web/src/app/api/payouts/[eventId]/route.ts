import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rowsToCamelCase } from "@/lib/utils";

// GET /api/payouts/[eventId] — list payouts for an event
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = parseInt(params.eventId);
    const results = db
      .prepare(
        `SELECT p.*, o.name as orgName FROM payouts p
         LEFT JOIN organizations o ON o.id = p.org_id
         WHERE p.event_id = ?
         ORDER BY p.created_at DESC`
      )
      .all(eventId);

    return NextResponse.json({ success: true, data: rowsToCamelCase(results) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
