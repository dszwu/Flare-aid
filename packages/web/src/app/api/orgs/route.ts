import { NextRequest, NextResponse } from "next/server";
import { db, ensureDb } from "@/db";
import { getSessionFromRequest } from "@/lib/auth";
import { rowsToCamelCase } from "@/lib/utils";

// GET /api/orgs — list organizations (public: only allowlisted)
export async function GET() {
  console.log("[API] GET /api/orgs");
  try {
    await ensureDb();
    const result = await db.query(
      "SELECT * FROM organizations WHERE allowlisted = 1"
    );
    console.log(`[API] GET /api/orgs => ${result.rows.length} orgs`);
    return NextResponse.json({ success: true, data: rowsToCamelCase(result.rows) });
  } catch (error: any) {
    console.error("[API] GET /api/orgs ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/orgs — add organization (admin only)
export async function POST(req: NextRequest) {
  console.log("[API] POST /api/orgs");
  const session = await getSessionFromRequest(req);
  if (!session) {
    console.warn("[API] POST /api/orgs => unauthorized");
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDb();
    const body = await req.json();
    const { name, country, walletAddress, contactInfo, allowlisted } = body;

    if (!name || !country) {
      return NextResponse.json({ success: false, error: "Name and country required" }, { status: 400 });
    }

    await db.query(
      `INSERT INTO organizations (name, country, wallet_address, contact_info, payout_method, payout_details, allowlisted, created_at)
       VALUES ($1, $2, $3, $4, 'bank', '{}', $5, $6)`,
      [
        name,
        country,
        walletAddress || "",
        contactInfo || "",
        allowlisted ? 1 : 0,
        new Date().toISOString(),
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
