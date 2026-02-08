/**
 * On-chain Indexer Service
 *
 * Polls DonationVault, AllocationRegistry, and PayoutReceipt contracts
 * for new events and indexes them into PostgreSQL for the API/frontend.
 */
import { createPublicClient, http, parseAbiItem, type Log } from "viem";
import { db, ensureDb } from "@/db";

// Coston2 config
const COSTON2_RPC = process.env.COSTON2_RPC_URL || "https://coston2-api.flare.network/ext/C/rpc";
const CHAIN_ID = 114;
const BLOCK_CHUNK = 500; // blocks per getLogs request

let deployments: { DonationVault: string; AllocationRegistry: string; PayoutReceipt: string };
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  deployments = require("@flare-aid/common/deployments/coston2.json");
} catch {
  deployments = {
    DonationVault: "0x0000000000000000000000000000000000000000",
    AllocationRegistry: "0x0000000000000000000000000000000000000000",
    PayoutReceipt: "0x0000000000000000000000000000000000000000",
  };
}

const client = createPublicClient({
  chain: {
    id: CHAIN_ID,
    name: "Coston2",
    nativeCurrency: { name: "Coston2 Flare", symbol: "C2FLR", decimals: 18 },
    rpcUrls: { default: { http: [COSTON2_RPC] } },
  },
  transport: http(COSTON2_RPC),
});

// ─── State ──────────────────────────────────────────────────────────
async function getLastBlock(): Promise<number> {
  const result = await db.query(
    "SELECT last_block_number FROM indexer_state WHERE id = 1"
  );
  return result.rows[0]?.last_block_number || 0;
}

async function setLastBlock(block: number) {
  await db.query(
    `INSERT INTO indexer_state (id, last_block_number, updated_at)
     VALUES (1, $1, NOW())
     ON CONFLICT (id) DO UPDATE SET last_block_number = $1, updated_at = NOW()`,
    [block]
  );
}

// ─── Event handlers ─────────────────────────────────────────────────
async function handleDonationReceived(log: Log & { args: Record<string, any> }) {
  const { donor, eventId, orgId, amount } = log.args;
  await db.query(
    `INSERT INTO donations (event_id, org_id, donor_address, amount_wei, tx_hash, block_number, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT DO NOTHING`,
    [
      Number(eventId),
      Number(orgId),
      donor as string,
      amount.toString(),
      log.transactionHash,
      Number(log.blockNumber),
    ]
  );
}

async function handleAllocationSet(log: Log & { args: Record<string, any> }) {
  const { eventId, orgIds, splitsBps } = log.args;
  const eid = Number(eventId);

  // Clear existing allocations for this event
  await db.query("DELETE FROM allocations WHERE event_id = $1", [eid]);

  for (let i = 0; i < (orgIds as bigint[]).length; i++) {
    await db.query(
      `INSERT INTO allocations (event_id, org_id, split_bps, tx_hash, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [eid, Number(orgIds[i]), Number(splitsBps[i]), log.transactionHash]
    );
  }
}

async function handlePayoutRecorded(log: Log & { args: Record<string, any> }) {
  const { eventId, orgId, amount, fiatCurrency, fiatAmount, offrampRefHash } = log.args;
  await db.query(
    `INSERT INTO payouts (event_id, org_id, amount_wei, fiat_currency, fiat_amount, offramp_ref, tx_hash, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed', NOW())
     ON CONFLICT DO NOTHING`,
    [
      Number(eventId),
      Number(orgId),
      amount.toString(),
      fiatCurrency,
      fiatAmount,
      offrampRefHash,
      log.transactionHash,
    ]
  );
}

// ─── ABI event signatures ──────────────────────────────────────────
const DONATION_EVENT = parseAbiItem(
  "event DonationReceived(address indexed donor, uint256 indexed eventId, uint256 orgId, uint256 amount)"
);
const ALLOCATION_EVENT = parseAbiItem(
  "event AllocationSet(uint256 indexed eventId, uint256[] orgIds, uint256[] splitsBps)"
);
const PAYOUT_EVENT = parseAbiItem(
  "event PayoutRecorded(uint256 indexed eventId, uint256 indexed orgId, uint256 amount, string fiatCurrency, string fiatAmount, string offrampRefHash)"
);

// ─── Main loop ──────────────────────────────────────────────────────
export async function runIndexer(): Promise<{ indexed: number; toBlock: number }> {
  await ensureDb();

  const fromBlock = BigInt(await getLastBlock() + 1);
  const latestBlock = await client.getBlockNumber();

  if (fromBlock > latestBlock) {
    return { indexed: 0, toBlock: Number(latestBlock) };
  }

  let totalIndexed = 0;
  let currentFrom = fromBlock;

  while (currentFrom <= latestBlock) {
    const currentTo =
      currentFrom + BigInt(BLOCK_CHUNK) > latestBlock
        ? latestBlock
        : currentFrom + BigInt(BLOCK_CHUNK);

    // Fetch all logs in parallel
    const [donationLogs, allocationLogs, payoutLogs] = await Promise.all([
      deployments.DonationVault !== "0x0000000000000000000000000000000000000000"
        ? client.getLogs({
            address: deployments.DonationVault as `0x${string}`,
            event: DONATION_EVENT,
            fromBlock: currentFrom,
            toBlock: currentTo,
          })
        : Promise.resolve([]),
      deployments.AllocationRegistry !== "0x0000000000000000000000000000000000000000"
        ? client.getLogs({
            address: deployments.AllocationRegistry as `0x${string}`,
            event: ALLOCATION_EVENT,
            fromBlock: currentFrom,
            toBlock: currentTo,
          })
        : Promise.resolve([]),
      deployments.PayoutReceipt !== "0x0000000000000000000000000000000000000000"
        ? client.getLogs({
            address: deployments.PayoutReceipt as `0x${string}`,
            event: PAYOUT_EVENT,
            fromBlock: currentFrom,
            toBlock: currentTo,
          })
        : Promise.resolve([]),
    ]);

    for (const log of donationLogs) await handleDonationReceived(log as any);
    for (const log of allocationLogs) await handleAllocationSet(log as any);
    for (const log of payoutLogs) await handlePayoutRecorded(log as any);

    totalIndexed += donationLogs.length + allocationLogs.length + payoutLogs.length;
    await setLastBlock(Number(currentTo));
    currentFrom = currentTo + 1n;
  }

  return { indexed: totalIndexed, toBlock: Number(latestBlock) };
}
