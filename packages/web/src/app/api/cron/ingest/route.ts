import { NextRequest, NextResponse } from "next/server";
import { runIngestion } from "@/services/ingestion";

// POST /api/cron/ingest — trigger event ingestion
export async function POST(req: NextRequest) {
  // Simple API key auth for cron
  const apiKey = req.headers.get("x-api-key");
  const expectedKey = process.env.CRON_API_KEY || "dev-key";

  if (apiKey !== expectedKey && process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runIngestion();
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Also allow GET for easy browser testing in dev
export async function GET(req: NextRequest) {
  return POST(req);
}
