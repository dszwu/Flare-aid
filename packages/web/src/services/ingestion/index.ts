import { NormalizedEvent } from "@flare-aid/common";
import { USGSAdapter } from "./usgs";
import { GDACSAdapter } from "./gdacs";
import { ReliefWebAdapter } from "./reliefweb";
import { EONETAdapter } from "./eonet";
import { DisasterFeedAdapter } from "./adapter";
import { db, ensureDb } from "@/db";

const adapters: DisasterFeedAdapter[] = [
  new USGSAdapter(),
  new GDACSAdapter(),
  new ReliefWebAdapter(),
  new EONETAdapter(),
];

/**
 * Deduplicates events by checking externalId + source in the database.
 */
async function isDuplicate(event: NormalizedEvent): Promise<boolean> {
  const result = await db.query(
    "SELECT id FROM disaster_events WHERE external_id = $1 AND source = $2",
    [event.externalId, event.source]
  );
  return result.rows.length > 0;
}

/**
 * Run ingestion from all disaster data sources.
 * Deduplicates, normalizes, and stores events in the database.
 * Returns count of new events added.
 */
export async function runIngestion(): Promise<{ total: number; new: number; sources: Record<string, number> }> {
  await ensureDb();

  const results: NormalizedEvent[] = [];
  const sourceCounts: Record<string, number> = {};

  // Fetch from all adapters in parallel
  const fetched = await Promise.allSettled(
    adapters.map((a) => a.fetch())
  );

  for (let i = 0; i < adapters.length; i++) {
    const result = fetched[i];
    const source = adapters[i].source;
    if (result.status === "fulfilled") {
      sourceCounts[source] = result.value.length;
      results.push(...result.value);
    } else {
      sourceCounts[source] = 0;
      console.error(`Failed to fetch from ${source}:`, result.reason);
    }
  }

  let newCount = 0;

  for (const event of results) {
    if (await isDuplicate(event)) continue;

    // Auto-approve events with meaningful severity; low-severity ones go to pending review
    const autoStatus = event.severityScore >= 25 ? 'approved' : 'pending';

    await db.query(
      `INSERT INTO disaster_events (external_id, source, type, title, description, latitude, longitude, severity_score, raw_payload, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        event.externalId,
        event.source,
        event.type,
        event.title,
        event.description,
        event.latitude,
        event.longitude,
        event.severityScore,
        JSON.stringify(event.rawPayload),
        autoStatus,
        event.occurredAt || new Date().toISOString(),
      ]
    );

    newCount++;

    // Create notification for high-severity events
    if (event.severityScore >= 50) {
      await db.query(
        `INSERT INTO notifications (type, title, message, created_at)
         VALUES ($1, $2, $3, $4)`,
        [
          event.severityScore >= 75 ? "high_severity" : "new_event",
          `New ${event.type}: ${event.title}`,
          `Severity: ${event.severityScore}/100. Source: ${event.source}`,
          new Date().toISOString(),
        ]
      );
    }
  }

  console.log(`Ingestion complete: ${results.length} total, ${newCount} new events`);
  return { total: results.length, new: newCount, sources: sourceCounts };
}
