import { NormalizedEvent, EventSource, EventType } from "@flare-aid/common";

/**
 * Base adapter interface for disaster data sources.
 */
export interface DisasterFeedAdapter {
  source: EventSource;
  fetch(): Promise<NormalizedEvent[]>;
}
