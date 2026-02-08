import { NextRequest, NextResponse } from "next/server";
import { runIndexer } from "@/services/indexer";

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.CRON_API_KEY || "dev-cron-key";

  if (apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runIndexer();
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
