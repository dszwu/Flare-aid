import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getSessionFromRequest } from "@/lib/auth";

// PUT /api/orgs/[id] — update organization (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    const body = await req.json();

    const existing = db.prepare("SELECT id FROM organizations WHERE id = ?").get(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Org not found" }, { status: 404 });
    }

    // Build dynamic update
    const setClauses: string[] = [];
    const values: any[] = [];
    if (body.name !== undefined) { setClauses.push("name = ?"); values.push(body.name); }
    if (body.country !== undefined) { setClauses.push("country = ?"); values.push(body.country); }
    if (body.walletAddress !== undefined) { setClauses.push("wallet_address = ?"); values.push(body.walletAddress); }
    if (body.contactInfo !== undefined) { setClauses.push("contact_info = ?"); values.push(body.contactInfo); }
    if (body.allowlisted !== undefined) { setClauses.push("allowlisted = ?"); values.push(body.allowlisted ? 1 : 0); }

    if (setClauses.length > 0) {
      values.push(id);
      db.prepare(`UPDATE organizations SET ${setClauses.join(", ")} WHERE id = ?`).run(...values);
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
