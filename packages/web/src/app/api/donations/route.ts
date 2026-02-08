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

    // Auto-create/update allocation for this event+org
    // Recompute splits proportionally based on actual donations
    try {
      const donationsByOrg = await db.query(
        `SELECT org_id, SUM(CAST(amount_wei AS NUMERIC)) as total
         FROM donations WHERE event_id = $1 GROUP BY org_id`,
        [eventId]
      );

      const grandTotal = donationsByOrg.rows.reduce(
        (s: number, r: any) => s + Number(r.total), 0
      );

      if (grandTotal > 0) {
        // Delete existing auto-generated allocations and recreate
        await db.query("DELETE FROM allocations WHERE event_id = $1", [eventId]);

        let usedBps = 0;
        for (let i = 0; i < donationsByOrg.rows.length; i++) {
          const row = donationsByOrg.rows[i];
          const isLast = i === donationsByOrg.rows.length - 1;
          const bps = isLast
            ? 10000 - usedBps
            : Math.round((Number(row.total) / grandTotal) * 10000);
          usedBps += bps;

          await db.query(
            `INSERT INTO allocations (event_id, org_id, split_bps, approved_by, approved_at, created_at)
             VALUES ($1, $2, $3, 'system', $4, $4)`,
            [eventId, row.org_id, bps, new Date().toISOString()]
          );
        }
      }
    } catch (allocErr: any) {
      console.error("[API] Error auto-creating allocation:", allocErr);
      // Non-fatal — donation is already recorded
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
