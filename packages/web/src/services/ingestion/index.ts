import { NormalizedEvent } from "@flare-aid/common";
import { USGSAdapter } from "./usgs";
import { GDACSAdapter } from "./gdacs";
import { ReliefWebAdapter } from "./reliefweb";
import { EONETAdapter } from "./eonet";
import { DisasterFeedAdapter } from "./adapter";
import { db } from "@/db";

const adapters: DisasterFeedAdapter[] = [
  new USGSAdapter(),
  new GDACSAdapter(),
  new ReliefWebAdapter(),
  new EONETAdapter(),
];

/**
 * Deduplicates events by checking externalId + source in the database.
 */
function isDuplicate(event: NormalizedEvent): boolean {
  const existing = db
    .prepare("SELECT id FROM disaster_events WHERE external_id = ? AND source = ?")
    .get(event.externalId, event.source);
  return !!existing;
}

/**
 * Run ingestion from all disaster data sources.
 * Deduplicates, normalizes, and stores events in the database.
 * Returns count of new events added.
 */
export async function runIngestion(): Promise<{ total: number; new: number; sources: Record<string, number> }> {
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
    if (isDuplicate(event)) continue;

    db.prepare(
      `INSERT INTO disaster_events (external_id, source, type, title, description, latitude, longitude, severity_score, raw_payload, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
    ).run(
      event.externalId,
      event.source,
      event.type,
      event.title,
      event.description,
      event.latitude,
      event.longitude,
      event.severityScore,
      JSON.stringify(event.rawPayload),
      event.occurredAt || new Date().toISOString()
    );

    newCount++;

    // Create notification for high-severity events
    if (event.severityScore >= 50) {
      db.prepare(
        `INSERT INTO notifications (type, title, message, created_at)
         VALUES (?, ?, ?, ?)`
      ).run(
        event.severityScore >= 75 ? "high_severity" : "new_event",
        `New ${event.type}: ${event.title}`,
        `Severity: ${event.severityScore}/100. Source: ${event.source}`,
        new Date().toISOString()
      );
    }
  }

  console.log(`Ingestion complete: ${results.length} total, ${newCount} new events`);
  return { total: results.length, new: newCount, sources: sourceCounts };
}
