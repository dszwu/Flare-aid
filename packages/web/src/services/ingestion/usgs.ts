import { DisasterFeedAdapter } from "./adapter";
import { NormalizedEvent } from "@flare-aid/common";

/**
 * USGS Earthquake API adapter.
 * Fetches recent significant earthquakes (M5+).
 */
export class USGSAdapter implements DisasterFeedAdapter {
  source = "USGS" as const;

  async fetch(): Promise<NormalizedEvent[]> {
    const url =
      "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.5&orderby=time&limit=30";

    try {
      const res = await globalThis.fetch(url);
      if (!res.ok) throw new Error(`USGS API error: ${res.status}`);
      const data = await res.json();

      return (data.features || []).map((f: any) => {
        const props = f.properties;
        const [lng, lat] = f.geometry.coordinates;
        const mag = props.mag || 0;

        return {
          externalId: f.id,
          source: "USGS" as const,
          type: "earthquake" as const,
          title: props.title || `M${mag} Earthquake`,
          description: `Magnitude ${mag} earthquake. ${props.place || ""}. Depth: ${f.geometry.coordinates[2]?.toFixed(1) || "?"}km`,
          latitude: lat,
          longitude: lng,
          severityScore: Math.min(100, Math.round(mag * 12)),
          rawPayload: props,
          occurredAt: new Date(props.time).toISOString(),
        };
      });
    } catch (err) {
      console.error("USGS fetch error:", err);
      return [];
    }
  }
}
