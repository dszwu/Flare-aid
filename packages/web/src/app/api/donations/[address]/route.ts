import { NextRequest, NextResponse } from "next/server";
import { db, ensureDb } from "@/db";
import { rowsToCamelCase } from "@/lib/utils";

// GET /api/donations/[address] — donor's donation history
export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    await ensureDb();
    const address = params.address.toLowerCase();
    const result = await db.query(
      "SELECT * FROM donations WHERE LOWER(donor_address) = $1 ORDER BY block_number DESC",
      [address]
    );

    return NextResponse.json({ success: true, data: rowsToCamelCase(result.rows) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
