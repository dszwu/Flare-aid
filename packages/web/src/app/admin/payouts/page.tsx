"use client";

import { useEffect, useState } from "react";
import { formatWei, formatUsd, shortenAddress, timeAgo } from "@/lib/utils";

interface PayoutRow {
  id: number;
  eventId: number;
  orgId: number;
  orgName: string;
  amountWei: string;
  fiatCurrency: string;
  fiatAmount: string;
  offrampRef: string;
  txHash: string;
  status: string;
  createdAt: string;
}

export default function AdminPayoutsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((json) => {
        setEvents(json.data || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetch(`/api/payouts/${selectedEvent}`)
        .then((r) => r.json())
        .then((json) => setPayouts(json.data || []));
    } else {
      setPayouts([]);
    }
  }, [selectedEvent]);

  const executePayout = async (eventId: number) => {
    setExecuting(true);
    try {
      const res = await fetch(`/api/payouts/${eventId}/execute`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Payout failed");
      } else {
        alert("Payout executed successfully! (mock)");
        // Refresh
        setSelectedEvent(null);
        setTimeout(() => setSelectedEvent(eventId), 100);
      }
    } catch {
      alert("Payout request failed");
    }
    setExecuting(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payouts</h1>

      {/* Event Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
        <select
          value={selectedEvent || ""}
          onChange={(e) => setSelectedEvent(e.target.value ? Number(e.target.value) : null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-flare-500 focus:border-transparent"
        >
          <option value="">— Select an event —</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title} ({(Number(ev.totalDonatedWei || 0) / 1e18).toFixed(2)} C2FLR)
            </option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <>
          {/* Summary */}
          {(() => {
            const ev = events.find((e) => e.id === selectedEvent);
            if (!ev) return null;
            const totalDonated = Number(ev.totalDonatedWei || 0) / 1e18;
            const totalPaid = payouts.reduce(
              (s, p) => s + Number(p.amountWei || 0) / 1e18,
              0
            );
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Total Donated</div>
                  <div className="text-xl font-bold text-gray-900">
                    {totalDonated.toFixed(4)} C2FLR
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Total Paid Out</div>
                  <div className="text-xl font-bold text-green-600">
                    {totalPaid.toFixed(4)} C2FLR
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Remaining</div>
                  <div className="text-xl font-bold text-orange-500">
                    {(totalDonated - totalPaid).toFixed(4)} C2FLR
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Execute button */}
          <div className="mb-6">
            <button
              onClick={() => executePayout(selectedEvent)}
              disabled={executing}
              className="px-6 py-3 bg-flare-500 text-white rounded-lg font-medium hover:bg-flare-600 disabled:opacity-50 transition-colors"
            >
              {executing ? "Processing..." : "Execute Payout (Mock Off-ramp)"}
            </button>
            <p className="mt-2 text-xs text-gray-400">
              This triggers the mock off-ramp adapter. In production, this would convert C2FLR →
              fiat via Transak/bridge and distribute to orgs per allocation splits.
            </p>
          </div>

          {/* Payout history */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">
                Payout History ({payouts.length})
              </h3>
            </div>
            {payouts.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No payouts recorded for this event yet.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-500">Org</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-500">
                      Amount (C2FLR)
                    </th>
                    <th className="text-right px-4 py-2 font-medium text-gray-500">Fiat</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-500">Ref</th>
                    <th className="text-center px-4 py-2 font-medium text-gray-500">Status</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">{p.orgName || `Org #${p.orgId}`}</td>
                      <td className="px-4 py-2 text-right font-mono text-gray-700">
                        {(Number(p.amountWei) / 1e18).toFixed(4)}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-700">
                        {p.fiatAmount ? `${p.fiatAmount} ${p.fiatCurrency}` : "—"}
                      </td>
                      <td className="px-4 py-2 text-gray-500 font-mono text-xs">
                        {p.offrampRef ? shortenAddress(p.offrampRef) : "—"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            p.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : p.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-gray-400 text-xs">
                        {timeAgo(p.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {!selectedEvent && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          Select an event above to view and manage payouts.
        </div>
      )}
    </div>
  );
}
