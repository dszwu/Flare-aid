import { NextRequest, NextResponse } from "next/server";
import { runIngestion } from "@/services/ingestion";

function isAuthorized(req: NextRequest): boolean {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) return true;

  // Legacy x-api-key support
  const apiKey = req.headers.get("x-api-key");
  const expectedKey = process.env.CRON_API_KEY || "dev-key";
  if (apiKey === expectedKey) return true;

  // Allow in development
  return process.env.NODE_ENV !== "production";
}

// GET /api/cron/ingest — Vercel Cron triggers GET
export async function GET(req: NextRequest) {
  console.log("[API] GET /api/cron/ingest");

  if (!isAuthorized(req)) {
    console.warn("[API] GET /api/cron/ingest => unauthorized");
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runIngestion();
    console.log("[API] GET /api/cron/ingest =>", result);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[API] GET /api/cron/ingest ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
