import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatWei(wei: string | bigint, decimals = 4): string {
  const value = typeof wei === "string" ? BigInt(wei) : wei;
  const eth = Number(value) / 1e18;
  return eth.toFixed(decimals);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Convert a snake_case DB row object to camelCase for frontend consumption.
 */
export function toCamelCase<T = any>(row: Record<string, any>): T {
  const result: Record<string, any> = {};
  for (const key of Object.keys(row)) {
    const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camel] = row[key];
  }
  return result as T;
}

/**
 * Convert an array of snake_case DB rows to camelCase.
 */
export function rowsToCamelCase<T = any>(rows: Record<string, any>[]): T[] {
  return rows.map((r) => toCamelCase<T>(r));
}
