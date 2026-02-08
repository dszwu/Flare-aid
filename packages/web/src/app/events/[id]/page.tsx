"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DonateForm } from "@/components/DonateForm";
import { EVENT_TYPE_CONFIG, getSeverityLabel, getSeverityColor, COSTON2_EXPLORER_URL } from "@flare-aid/common";
import { formatWei, timeAgo, shortenAddress } from "@/lib/utils";

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<any>(null);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${params.id}`).then((r) => r.json()),
      fetch("/api/orgs").then((r) => r.json()),
    ]).then(([eventRes, orgsRes]) => {
      setEvent(eventRes.data);
      setOrgs(orgsRes.data || []);
      if (orgsRes.data?.length > 0) setSelectedOrg(orgsRes.data[0].id);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading event...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-700">Event not found</h2>
          </div>
        </div>
      </div>
    );
  }

  const typeConfig = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.other;
  const sevColor = getSeverityColor(event.severityScore);
  const selectedOrgData = orgs.find((o: any) => o.id === selectedOrg);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero banner */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-3xl">{typeConfig.icon}</span>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: typeConfig.color }}
              >
                {typeConfig.label}
              </span>
              <span
                className="px-3 py-1 rounded-full text-sm font-bold"
                style={{ backgroundColor: `${sevColor}30`, color: sevColor }}
              >
                {getSeverityLabel(event.severityScore)} ({event.severityScore}/100)
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-white/10 text-gray-300">
                {event.source}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-gray-300">{event.description}</p>
            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-400">
              <span>📍 {event.latitude.toFixed(2)}, {event.longitude.toFixed(2)}</span>
              <span>🕐 {timeAgo(event.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Stats + Donations */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                  <div className="text-2xl font-bold text-flare-600">
                    {formatWei(event.totalDonatedWei || "0", 2)}
                  </div>
                  <div className="text-sm text-gray-500">C2FLR Donated</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {event.donationCount || 0}
                  </div>
                  <div className="text-sm text-gray-500">Donations</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {event.allocations?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Organizations</div>
                </div>
              </div>

              {/* Allocations */}
              {event.allocations?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Fund Allocation</h2>
                  <div className="space-y-3">
                    {event.allocations.map((a: any, i: number) => {
                      const org = orgs.find((o: any) => o.id === a.orgId);
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-flare-50 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-flare-600">{i + 1}</span>
                            </div>
                            <span className="text-gray-700">{org?.name || `Org #${a.orgId}`}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-flare-500 rounded-full"
                                style={{ width: `${(a.splitBps / 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-600 w-12 text-right">
                              {(a.splitBps / 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent donations table */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Recent Donations</h2>
                {event.recentDonations?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-2 text-gray-500 font-medium">Donor</th>
                          <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
                          <th className="text-right py-2 text-gray-500 font-medium">When</th>
                          <th className="text-right py-2 text-gray-500 font-medium">Tx</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.recentDonations.map((d: any) => (
                          <tr key={d.id} className="border-b border-gray-50">
                            <td className="py-3 font-mono text-gray-600">
                              {shortenAddress(d.donorAddress)}
                            </td>
                            <td className="py-3 text-right font-semibold text-gray-900">
                              {formatWei(d.amountWei)} C2FLR
                            </td>
                            <td className="py-3 text-right text-gray-400">
                              {timeAgo(d.createdAt)}
                            </td>
                            <td className="py-3 text-right">
                              <a
                                href={`${COSTON2_EXPLORER_URL}/tx/${d.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-flare-500 hover:text-flare-600"
                              >
                                View →
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No donations yet. Be the first!</p>
                )}
              </div>
            </div>

            {/* Right: Donate */}
            <div className="space-y-6">
              {/* Org selector */}
              {orgs.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Select Organization</h3>
                  <div className="space-y-2">
                    {orgs.map((org: any) => (
                      <button
                        key={org.id}
                        onClick={() => setSelectedOrg(org.id)}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          selectedOrg === org.id
                            ? "border-flare-500 bg-flare-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium text-gray-900">{org.name}</div>
                        <div className="text-xs text-gray-500">{org.country}</div>
                        {org.walletAddress && (
                          <div className="text-xs text-gray-400 font-mono mt-0.5">{shortenAddress(org.walletAddress)}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Donate form */}
              {selectedOrg > 0 && selectedOrgData?.walletAddress && (
                <DonateForm
                  eventId={event.id}
                  orgId={selectedOrg}
                  orgName={selectedOrgData?.name || "Organization"}
                  walletAddress={selectedOrgData.walletAddress}
                />
              )}

              {selectedOrg > 0 && !selectedOrgData?.walletAddress && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                  <p className="text-yellow-700 text-sm">This organization has not set up a wallet address yet.</p>
                </div>
              )}

              {/* On-chain info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">On-Chain Info</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Network</span>
                    <span className="font-mono">Coston2 (114)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer</span>
                    <span className="font-mono text-xs">Direct to Org</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currency</span>
                    <span>C2FLR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price Feed</span>
                    <span>FTSO FLR/USD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
