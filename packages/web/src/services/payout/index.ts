/**
 * Payout Orchestration Service
 *
 * Given an event, reads allocations from the DB, computes each org's share,
 * runs the off-ramp adapter, and records payout receipts.
 */
import { db } from "@/db";
import { MockOfframpAdapter, type IOfframpAdapter } from "./offramp";

const offramp: IOfframpAdapter = new MockOfframpAdapter();

interface PayoutExecResult {
  eventId: number;
  payouts: {
    orgId: number;
    orgName: string;
    amountWei: string;
    fiatAmount: string;
    fiatCurrency: string;
    referenceHash: string;
  }[];
  totalWei: string;
}

export async function executePayout(eventId: number): Promise<PayoutExecResult> {
  // 1. Get total donated for this event
  const donationRow = db
    .prepare(
      "SELECT COALESCE(SUM(CAST(amount_wei AS INTEGER)), 0) as total FROM donations WHERE event_id = ?"
    )
    .get(eventId) as { total: number };

  const totalWei = BigInt(donationRow.total);
  if (totalWei === 0n) {
    throw new Error("No donations for this event");
  }

  // 2. Get already paid out
  const paidRow = db
    .prepare(
      "SELECT COALESCE(SUM(CAST(amount_wei AS INTEGER)), 0) as total FROM payouts WHERE event_id = ? AND status = 'completed'"
    )
    .get(eventId) as { total: number };

  const paidWei = BigInt(paidRow.total);
  const remainingWei = totalWei - paidWei;

  if (remainingWei <= 0n) {
    throw new Error("All funds already paid out for this event");
  }

  // 3. Get allocations
  const allocations = db
    .prepare(
      `SELECT a.org_id, a.split_bps, o.name as org_name, o.country
       FROM allocations a
       JOIN organizations o ON o.id = a.org_id
       WHERE a.event_id = ?`
    )
    .all(eventId) as {
    org_id: number;
    split_bps: number;
    org_name: string;
    country: string;
  }[];

  if (allocations.length === 0) {
    throw new Error("No allocations set for this event");
  }

  // 4. Execute payouts per org
  const results: PayoutExecResult["payouts"] = [];

  const insertPayout = db.prepare(
    `INSERT INTO payouts (event_id, org_id, amount_wei, fiat_currency, fiat_amount, offramp_ref, tx_hash, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', datetime('now'))`
  );

  for (const alloc of allocations) {
    const orgWei = (remainingWei * BigInt(alloc.split_bps)) / 10000n;
    if (orgWei === 0n) continue;

    // Determine target currency based on org country (simplified)
    const currency = getCurrencyForCountry(alloc.country);

    const result = await offramp.execute(orgWei.toString(), currency, `org_${alloc.org_id}`);

    insertPayout.run(
      eventId,
      alloc.org_id,
      orgWei.toString(),
      result.fiatCurrency,
      result.fiatAmount,
      result.referenceHash,
      `mock_tx_${Date.now()}`
    );

    results.push({
      orgId: alloc.org_id,
      orgName: alloc.org_name,
      amountWei: orgWei.toString(),
      fiatAmount: result.fiatAmount,
      fiatCurrency: result.fiatCurrency,
      referenceHash: result.referenceHash,
    });
  }

  return {
    eventId,
    payouts: results,
    totalWei: remainingWei.toString(),
  };
}

function getCurrencyForCountry(country: string): string {
  const map: Record<string, string> = {
    Kenya: "KES",
    Nigeria: "NGN",
    Ghana: "GHS",
    "South Africa": "ZAR",
    Uganda: "UGX",
    Tanzania: "TZS",
    UK: "GBP",
    US: "USD",
    USA: "USD",
    Switzerland: "CHF",
    France: "EUR",
    Global: "USD",
    International: "USD",
  };
  return map[country] || "USD";
}
