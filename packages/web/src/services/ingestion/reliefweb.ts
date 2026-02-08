import { DisasterFeedAdapter } from "./adapter";
import { NormalizedEvent, EventType } from "@flare-aid/common";

/**
 * ReliefWeb disasters API adapter.
 * JSON-based, 1000 calls/day limit, covers all disaster types.
 */
export class ReliefWebAdapter implements DisasterFeedAdapter {
  source = "RELIEFWEB" as const;

  private mapType(rwType: string): EventType {
    const t = (rwType || "").toLowerCase();
    if (t.includes("earthquake")) return "earthquake";
    if (t.includes("flood")) return "flood";
    if (t.includes("cyclone") || t.includes("hurricane") || t.includes("typhoon") || t.includes("storm")) return "cyclone";
    if (t.includes("volcano")) return "volcano";
    if (t.includes("wildfire") || t.includes("fire")) return "wildfire";
    if (t.includes("drought")) return "drought";
    return "other";
  }

  async fetch(): Promise<NormalizedEvent[]> {
    try {
      const url =
        "https://api.reliefweb.int/v1/disasters?appname=flareaid&limit=30&sort[]=date:desc&fields[include][]=name&fields[include][]=type&fields[include][]=country&fields[include][]=date&fields[include][]=description-html&fields[include][]=glide&fields[include][]=status";

      const res = await globalThis.fetch(url);
      if (!res.ok) throw new Error(`ReliefWeb API error: ${res.status}`);
      const data = await res.json();

      return (data.data || []).map((item: any) => {
        const fields = item.fields || {};
        const types = fields.type || [];
        const countries = fields.country || [];
        const primaryType = types[0]?.name || "Other";
        const countryName = countries[0]?.name || "Unknown";
        // ReliefWeb doesn't provide coordinates directly, approximate from country
        const lat = countries[0]?.location?.lat || 0;
        const lng = countries[0]?.location?.lon || 0;

        return {
          externalId: `rw-${item.id}`,
          source: "RELIEFWEB" as const,
          type: this.mapType(primaryType),
          title: fields.name || "ReliefWeb Disaster",
          description: `${primaryType} in ${countryName}. ${fields.status || ""}`,
          latitude: lat,
          longitude: lng,
          severityScore: 50, // ReliefWeb doesn't provide granular severity — default to medium
          rawPayload: fields,
          occurredAt: fields.date?.created ? new Date(fields.date.created).toISOString() : new Date().toISOString(),
        };
      });
    } catch (err) {
      console.error("ReliefWeb fetch error:", err);
      return [];
    }
  }
}
