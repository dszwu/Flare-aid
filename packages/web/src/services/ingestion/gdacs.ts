import { DisasterFeedAdapter } from "./adapter";
import { NormalizedEvent, EventType } from "@flare-aid/common";
import { XMLParser } from "fast-xml-parser";

/**
 * GDACS RSS feed adapter.
 * Fetches earthquakes, cyclones, floods, volcanoes, wildfires, droughts.
 */
export class GDACSAdapter implements DisasterFeedAdapter {
  source = "GDACS" as const;

  private mapType(gdacsType: string): EventType {
    const t = gdacsType?.toUpperCase() || "";
    if (t.includes("EQ")) return "earthquake";
    if (t.includes("TC")) return "cyclone";
    if (t.includes("FL")) return "flood";
    if (t.includes("VO")) return "volcano";
    if (t.includes("WF") || t.includes("FR")) return "wildfire";
    if (t.includes("DR")) return "drought";
    return "other";
  }

  private alertToSeverity(alert: string): number {
    switch (alert?.toLowerCase()) {
      case "red": return 85;
      case "orange": return 60;
      case "green": return 30;
      default: return 40;
    }
  }

  async fetch(): Promise<NormalizedEvent[]> {
    try {
      const res = await globalThis.fetch("https://www.gdacs.org/xml/rss.xml");
      if (!res.ok) throw new Error(`GDACS RSS error: ${res.status}`);
      const xml = await res.text();

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      });
      const parsed = parser.parse(xml);
      const items = parsed?.rss?.channel?.item || [];
      const itemArr = Array.isArray(items) ? items : [items];

      return itemArr.map((item: any) => {
        const alert = item["gdacs:alertlevel"] || "";
        const eventType = item["gdacs:eventtype"] || "";
        const lat = parseFloat(item["geo:lat"] || item["gdacs:lat"] || "0");
        const lng = parseFloat(item["geo:long"] || item["gdacs:long"] || "0");

        return {
          externalId: `gdacs-${item["gdacs:eventid"] || item.guid || Math.random()}`,
          source: "GDACS" as const,
          type: this.mapType(eventType),
          title: item.title || "GDACS Alert",
          description: item.description || "",
          latitude: lat,
          longitude: lng,
          severityScore: this.alertToSeverity(alert),
          rawPayload: item,
          occurredAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        };
      });
    } catch (err) {
      console.error("GDACS fetch error:", err);
      return [];
    }
  }
}
