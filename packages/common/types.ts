// ─── Disaster Event Types ───
export type EventSource = "USGS" | "GDACS" | "RELIEFWEB" | "EONET";
export type EventType = "earthquake" | "flood" | "wildfire" | "cyclone" | "volcano" | "drought" | "storm" | "other";
export type EventStatus = "pending" | "approved" | "closed";

export interface DisasterEvent {
  id: number;
  externalId: string;
  source: EventSource;
  type: EventType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  severityScore: number; // 0-100
  rawPayload: string;    // JSON string
  status: EventStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
}

// ─── Organization Types ───
export type PayoutMethod = "bank" | "mobile_money";

export interface Organization {
  id: number;
  name: string;
  country: string;
  payoutMethod: PayoutMethod;
  payoutDetails: string; // encrypted JSON
  allowlisted: boolean;
  createdAt: string;
}

// ─── Donation Types ───
export interface Donation {
  id: number;
  txHash: string;
  donorAddress: string;
  eventId: number;
  orgId: number;
  amountWei: string;
  usdValue: number;
  blockNumber: number;
  timestamp: string;
}

// ─── Allocation Types ───
export interface Allocation {
  id: number;
  eventId: number;
  orgId: number;
  splitBps: number;
  approvedBy: string;
  approvedAt: string;
}

// ─── Payout Types ───
export type PayoutStatus = "pending" | "processing" | "completed" | "failed";

export interface Payout {
  id: number;
  orgId: number;
  eventId: number;
  amountWei: string;
  fiatAmount: number;
  fiatCurrency: string;
  offrampRef: string;
  offrampRefHash: string;
  status: PayoutStatus;
  txHash: string | null;
  createdAt: string;
}

// ─── Normalized Event from Ingestion ───
export interface NormalizedEvent {
  externalId: string;
  source: EventSource;
  type: EventType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  severityScore: number;
  rawPayload: object;
  occurredAt: string;
}

// ─── API Response Types ───
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}
