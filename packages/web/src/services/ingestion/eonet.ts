import { DisasterFeedAdapter } from "./adapter";
import { NormalizedEvent, EventType } from "@flare-aid/common";

/**
 * NASA EONET v3 adapter.
 * Covers wildfires, severe storms, volcanoes, sea/lake ice, and more.
 */
export class EONETAdapter implements DisasterFeedAdapter {
  source = "EONET" as const;

  private mapCategory(catId: string): EventType {
    switch (catId) {
      case "wildfires": return "wildfire";
      case "severeStorms": return "storm";
      case "volcanoes": return "volcano";
      case "floods": return "flood";
      case "earthquakes": return "earthquake";
      case "drought": return "drought";
      default: return "other";
    }
  }

  async fetch(): Promise<NormalizedEvent[]> {
    try {
      const url = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=30";
      const res = await globalThis.fetch(url);
      if (!res.ok) throw new Error(`EONET API error: ${res.status}`);
      const data = await res.json();

      return (data.events || []).map((event: any) => {
        const category = event.categories?.[0]?.id || "other";
        // Get most recent geometry point
        const geo = event.geometry?.[event.geometry.length - 1];
        let lat = 0, lng = 0;
        if (geo?.coordinates) {
          [lng, lat] = geo.coordinates;
        }

        const magnitudeValue = geo?.magnitudeValue;
        let severity = 40; // default
        if (category === "wildfires") severity = 65;
        if (category === "severeStorms") severity = 70;
        if (category === "volcanoes") severity = 75;
        if (magnitudeValue && magnitudeValue > 5) severity = Math.min(100, magnitudeValue * 12);

        return {
          externalId: event.id,
          source: "EONET" as const,
          type: this.mapCategory(category),
          title: event.title || "NASA EONET Event",
          description: `${event.title}. Source: ${event.sources?.[0]?.id || "NASA"}`,
          latitude: lat,
          longitude: lng,
          severityScore: severity,
          rawPayload: event,
          occurredAt: geo?.date ? new Date(geo.date).toISOString() : new Date().toISOString(),
        };
      });
    } catch (err) {
      console.error("EONET fetch error:", err);
      return [];
    }
  }
}
