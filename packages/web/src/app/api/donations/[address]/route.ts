import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rowsToCamelCase } from "@/lib/utils";

// GET /api/donations/[address] — donor's donation history
export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address.toLowerCase();
    const history = db
      .prepare("SELECT * FROM donations WHERE LOWER(donor_address) = ? ORDER BY block_number DESC")
      .all(address);

    return NextResponse.json({ success: true, data: rowsToCamelCase(history) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
