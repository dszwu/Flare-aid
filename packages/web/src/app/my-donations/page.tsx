"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { formatWei, timeAgo, shortenAddress } from "@/lib/utils";
import { COSTON2_EXPLORER_URL } from "@flare-aid/common";
import Link from "next/link";

export default function MyDonationsPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/donations/${address.toLowerCase()}`)
      .then((r) => r.json())
      .then((d) => {
        setDonations(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [address]);

  const totalDonated = donations.reduce(
    (sum, d) => sum + Number(d.amountWei),
    0
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Donations</h1>
          <p className="text-gray-500 mb-8">
            Track all your on-chain donations across disaster relief events.
          </p>

          {!isConnected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">🔗</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-500 mb-6">
                Connect your MetaMask wallet to view your donation history.
              </p>
              <button
                onClick={() => connect({ connector: wagmiConfig.connectors[0] })}
                className="px-6 py-3 bg-flare-500 text-white rounded-lg font-medium hover:bg-flare-600 transition-colors"
              >
                Connect MetaMask
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-20 text-gray-400">Loading your donations...</div>
          ) : donations.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">💝</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                No Donations Yet
              </h2>
              <p className="text-gray-500 mb-6">
                You haven&apos;t made any donations yet. Browse active disasters to get started.
              </p>
              <Link
                href="/events"
                className="px-6 py-3 bg-flare-500 text-white rounded-lg font-medium hover:bg-flare-600 transition-colors inline-block"
              >
                Browse Disasters
              </Link>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="text-sm text-gray-500">Total Donated</div>
                  <div className="text-2xl font-bold text-flare-600">
                    {formatWei(BigInt(Math.floor(totalDonated)).toString(), 4)} C2FLR
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="text-sm text-gray-500">Donations Made</div>
                  <div className="text-2xl font-bold text-gray-900">{donations.length}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="text-sm text-gray-500">Wallet</div>
                  <div className="text-lg font-mono text-gray-600 truncate">
                    {shortenAddress(address!, 6)}
                  </div>
                </div>
              </div>

              {/* Donations table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Event</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Org</th>
                        <th className="text-right px-6 py-3 text-gray-500 font-medium">Amount</th>
                        <th className="text-right px-6 py-3 text-gray-500 font-medium">When</th>
                        <th className="text-right px-6 py-3 text-gray-500 font-medium">Verify</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((d) => (
                        <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <Link href={`/events/${d.eventId}`} className="text-flare-600 hover:underline">
                              Event #{d.eventId}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-gray-600">Org #{d.orgId}</td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">
                            {formatWei(d.amountWei)} C2FLR
                          </td>
                          <td className="px-6 py-4 text-right text-gray-400">
                            {timeAgo(d.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <a
                              href={`${COSTON2_EXPLORER_URL}/tx/${d.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-flare-500 hover:text-flare-600"
                            >
                              Explorer →
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
