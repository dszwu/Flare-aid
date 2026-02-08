import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { executePayout } from "@/services/payout";

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eventId = parseInt(params.eventId);
  if (isNaN(eventId)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  try {
    const result = await executePayout(eventId);
    return NextResponse.json({ ok: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
