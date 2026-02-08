"use client";

import { useEffect, useState } from "react";
import { EVENT_TYPE_CONFIG, getSeverityLabel, getSeverityColor } from "@flare-aid/common";
import { timeAgo } from "@/lib/utils";

export default function AdminEventsPage() {
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allocModal, setAllocModal] = useState<any>(null);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [splits, setSplits] = useState<{ orgId: number; splitBps: number }[]>([]);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/events/pending").then((r) => r.json()),
      fetch("/api/events").then((r) => r.json()),
      fetch("/api/orgs").then((r) => r.json()),
    ]).then(([pending, approved, orgsRes]) => {
      setPendingEvents(pending.data || []);
      setApprovedEvents(approved.data || []);
      setOrgs(orgsRes.data || []);
      setLoading(false);
    });
  };

  useEffect(loadData, []);

  const approveEvent = async (id: number) => {
    await fetch(`/api/events/${id}/approve`, { method: "POST" });
    loadData();
  };

  const openAllocModal = (event: any) => {
    setAllocModal(event);
    // Initialize with equal splits across all orgs
    if (orgs.length > 0) {
      const perOrg = Math.floor(10000 / orgs.length);
      const remainder = 10000 - perOrg * orgs.length;
      setSplits(
        orgs.map((o, i) => ({
          orgId: o.id,
          splitBps: perOrg + (i === 0 ? remainder : 0),
        }))
      );
    }
  };

  const saveAllocation = async () => {
    const total = splits.reduce((s, sp) => s + sp.splitBps, 0);
    if (total !== 10000) {
      alert("Splits must sum to 100% (10000 bps)");
      return;
    }

    await fetch("/api/allocations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: allocModal.id, splits }),
    });
    setAllocModal(null);
    loadData();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Event Management</h1>

      {/* Pending events */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pending Review ({pendingEvents.length})
        </h2>

        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : pendingEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            No pending events. Trigger ingestion from the dashboard.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingEvents.map((e) => {
              const tc = EVENT_TYPE_CONFIG[e.type] || EVENT_TYPE_CONFIG.other;
              return (
                <div
                  key={e.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <span className="text-2xl">{tc.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{e.title}</div>
                      <div className="text-sm text-gray-400">
                        {e.source} · {e.type} · {timeAgo(e.createdAt)}
                      </div>
                    </div>
                    <div
                      className="px-2 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: `${getSeverityColor(e.severityScore)}20`,
                        color: getSeverityColor(e.severityScore),
                      }}
                    >
                      {getSeverityLabel(e.severityScore)} ({e.severityScore})
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => approveEvent(e.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approved events */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Approved Events ({approvedEvents.length})
        </h2>
        {approvedEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            No approved events yet.
          </div>
        ) : (
          <div className="space-y-3">
            {approvedEvents.map((e) => {
              const tc = EVENT_TYPE_CONFIG[e.type] || EVENT_TYPE_CONFIG.other;
              return (
                <div
                  key={e.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <span className="text-2xl">{tc.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{e.title}</div>
                      <div className="text-sm text-gray-400">
                        {e.source} · Donated: {(Number(e.totalDonatedWei || 0) / 1e18).toFixed(2)} C2FLR
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openAllocModal(e)}
                    className="px-4 py-2 bg-ocean-600 text-white rounded-lg text-sm font-medium hover:bg-ocean-700 transition-colors ml-4"
                  >
                    Set Allocation
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Allocation Modal */}
      {allocModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Set Allocation</h3>
            <p className="text-sm text-gray-500 mb-4">{allocModal.title}</p>

            <div className="space-y-3 mb-6">
              {splits.map((split, i) => {
                const org = orgs.find((o) => o.id === split.orgId);
                return (
                  <div key={split.orgId} className="flex items-center space-x-3">
                    <div className="flex-1 text-sm font-medium text-gray-700">
                      {org?.name || `Org #${split.orgId}`}
                    </div>
                    <input
                      type="number"
                      value={split.splitBps / 100}
                      onChange={(e) => {
                        const bps = Math.round(parseFloat(e.target.value) * 100);
                        setSplits((prev) =>
                          prev.map((s, j) => (j === i ? { ...s, splitBps: bps } : s))
                        );
                      }}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                      min={0}
                      max={100}
                      step={1}
                    />
                    <span className="text-sm text-gray-400">%</span>
                  </div>
                );
              })}
            </div>

            <div className="text-sm text-gray-500 mb-4">
              Total: {(splits.reduce((s, sp) => s + sp.splitBps, 0) / 100).toFixed(0)}%
              {splits.reduce((s, sp) => s + sp.splitBps, 0) !== 10000 && (
                <span className="text-red-500 ml-2">(must be 100%)</span>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setAllocModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveAllocation}
                disabled={splits.reduce((s, sp) => s + sp.splitBps, 0) !== 10000}
                className="px-4 py-2 bg-flare-500 text-white rounded-lg text-sm font-medium hover:bg-flare-600 disabled:opacity-50"
              >
                Save Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
