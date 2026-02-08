import { NextRequest, NextResponse } from "next/server";
import { db, ensureDb } from "@/db";

// POST /api/donations — record a new donation after on-chain confirmation
export async function POST(req: NextRequest) {
  try {
    await ensureDb();
    const body = await req.json();
    const { txHash, donorAddress, eventId, orgId, amountWei, blockNumber } = body;

    if (!txHash || !donorAddress || !eventId || !orgId || !amountWei) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert donation, ignore duplicates (tx_hash is UNIQUE)
    const result = await db.query(
      `INSERT INTO donations (tx_hash, donor_address, event_id, org_id, amount_wei, block_number, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (tx_hash) DO NOTHING
       RETURNING id`,
      [
        txHash,
        donorAddress.toLowerCase(),
        eventId,
        orgId,
        amountWei,
        blockNumber || 0,
        new Date().toISOString(),
      ]
    );

    if (result.rows.length === 0) {
      // Already recorded (duplicate tx_hash)
      return NextResponse.json({ success: true, duplicate: true });
    }

    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    console.error("[API] Error recording donation:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
