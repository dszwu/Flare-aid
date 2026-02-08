"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/events/pending").then((r) => r.json()),
    ]).then(([statsRes, pendingRes]) => {
      setStats(statsRes.data);
      setPendingEvents(pendingRes.data || []);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Pending Events</div>
          <div className="text-3xl font-bold text-orange-500">{pendingEvents.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Active Events</div>
          <div className="text-3xl font-bold text-gray-900">{stats?.activeEvents || 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Total Donated</div>
          <div className="text-3xl font-bold text-flare-600">
            {stats?.totalDonatedWei
              ? (Number(stats.totalDonatedWei) / 1e18).toFixed(2)
              : "0"}{" "}
            <span className="text-base font-medium text-gray-400">C2FLR</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">{stats?.donationCount || 0} donations</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Payouts Completed</div>
          <div className="text-3xl font-bold text-green-600">{stats?.completedPayouts || 0}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/events"
              className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <span className="text-orange-800 font-medium">
                Review {pendingEvents.length} pending events
              </span>
              <span>→</span>
            </Link>
            <button
              onClick={async () => {
                const res = await fetch("/api/cron/ingest", { method: "POST" });
                const data = await res.json();
                alert(`Ingestion complete: ${data.data?.new || 0} new events`);
                window.location.reload();
              }}
              className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-blue-800 font-medium">Trigger Data Ingestion</span>
              <span>🔄</span>
            </button>
            <Link
              href="/admin/orgs"
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-800 font-medium">Manage Organizations</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Recent pending events */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Pending Events</h2>
          {pendingEvents.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No pending events</p>
          ) : (
            <div className="space-y-3">
              {pendingEvents.slice(0, 5).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                      {e.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {e.source} · Severity: {e.severityScore}
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: e.severityScore >= 75 ? "#fee2e2" : "#fef3c7",
                      color: e.severityScore >= 75 ? "#b91c1c" : "#92400e",
                    }}
                  >
                    {e.severityScore}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
