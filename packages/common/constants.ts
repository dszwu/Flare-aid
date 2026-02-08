export const COSTON2_CHAIN_ID = 114;
export const FLARE_CHAIN_ID = 14;

export const COSTON2_RPC_URL = "https://coston2-api.flare.network/ext/C/rpc";
export const FLARE_RPC_URL = "https://flare-api.flare.network/ext/C/rpc";

export const COSTON2_EXPLORER_URL = "https://coston2-explorer.flare.network";
export const FLARE_EXPLORER_URL = "https://flare-explorer.flare.network";

// FlareContractRegistry — same on all Flare networks
export const FLARE_CONTRACT_REGISTRY = "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019";

// FTSO Feed IDs
export const FEED_IDS = {
  FLR_USD: "0x01464c522f55534400000000000000000000000000" as `0x${string}`,
} as const;

// Chain configuration for wagmi/viem
export const coston2Chain = {
  id: COSTON2_CHAIN_ID,
  name: "Flare Testnet Coston2",
  nativeCurrency: {
    name: "Coston2 Flare",
    symbol: "C2FLR",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [COSTON2_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "Coston2 Explorer", url: COSTON2_EXPLORER_URL },
  },
  testnet: true,
} as const;

// Disaster feed URLs
export const DISASTER_FEEDS = {
  USGS: "https://earthquake.usgs.gov/fdsnws/event/1/query",
  GDACS: "https://www.gdacs.org/xml/rss.xml",
  RELIEFWEB: "https://api.reliefweb.int/v1/disasters",
  EONET: "https://eonet.gsfc.nasa.gov/api/v3/events",
} as const;

// Event type icons / labels
export const EVENT_TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  earthquake: { icon: "🌍", label: "Earthquake", color: "#e74c3c" },
  flood:      { icon: "🌊", label: "Flood",      color: "#3498db" },
  wildfire:   { icon: "🔥", label: "Wildfire",   color: "#e67e22" },
  cyclone:    { icon: "🌀", label: "Cyclone",    color: "#9b59b6" },
  volcano:    { icon: "🌋", label: "Volcano",    color: "#c0392b" },
  drought:    { icon: "☀️",  label: "Drought",    color: "#f39c12" },
  storm:      { icon: "⛈️", label: "Storm",      color: "#2c3e50" },
  other:      { icon: "⚠️",  label: "Other",      color: "#7f8c8d" },
} as const;

// Severity thresholds
export const SEVERITY = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 90,
} as const;

export function getSeverityLabel(score: number): string {
  if (score >= SEVERITY.CRITICAL) return "Critical";
  if (score >= SEVERITY.HIGH) return "High";
  if (score >= SEVERITY.MEDIUM) return "Medium";
  return "Low";
}

export function getSeverityColor(score: number): string {
  if (score >= SEVERITY.CRITICAL) return "#e74c3c";
  if (score >= SEVERITY.HIGH) return "#e67e22";
  if (score >= SEVERITY.MEDIUM) return "#f1c40f";
  return "#27ae60";
}
