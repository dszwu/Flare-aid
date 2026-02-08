import { NextRequest, NextResponse } from "next/server";
import { runIndexer } from "@/services/indexer";

function isAuthorized(req: NextRequest): boolean {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) return true;

  // Legacy x-api-key support
  const apiKey = req.headers.get("x-api-key");
  const expectedKey = process.env.CRON_API_KEY || "dev-cron-key";
  if (apiKey === expectedKey) return true;

  return process.env.NODE_ENV !== "production";
}

// GET /api/cron/index — Vercel Cron triggers GET
export async function GET(req: NextRequest) {
  console.log("[API] GET /api/cron/index");

  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runIndexer();
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
