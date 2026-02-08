import { NextRequest, NextResponse } from "next/server";
import { db, ensureDb } from "@/db";
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

    await ensureDb();

    const existing = await db.query("SELECT id FROM organizations WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Org not found" }, { status: 404 });
    }

    // Build dynamic update
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;
    if (body.name !== undefined) { setClauses.push(`name = $${paramIdx++}`); values.push(body.name); }
    if (body.country !== undefined) { setClauses.push(`country = $${paramIdx++}`); values.push(body.country); }
    if (body.walletAddress !== undefined) { setClauses.push(`wallet_address = $${paramIdx++}`); values.push(body.walletAddress); }
    if (body.contactInfo !== undefined) { setClauses.push(`contact_info = $${paramIdx++}`); values.push(body.contactInfo); }
    if (body.allowlisted !== undefined) { setClauses.push(`allowlisted = $${paramIdx++}`); values.push(body.allowlisted ? 1 : 0); }

    if (setClauses.length > 0) {
      values.push(id);
      await db.query(`UPDATE organizations SET ${setClauses.join(", ")} WHERE id = $${paramIdx}`, values);
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
