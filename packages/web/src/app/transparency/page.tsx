"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { formatWei } from "@/lib/utils";
import { COSTON2_EXPLORER_URL } from "@flare-aid/common";

export default function TransparencyPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-r from-ocean-800 to-ocean-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-2">Transparency Ledger</h1>
            <p className="text-ocean-200 text-lg">
              Every donation, allocation, and payout is recorded on Flare. Nothing is hidden.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="h-8 bg-gray-100 rounded mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-3xl font-bold text-flare-600">
                  {formatWei(BigInt(Math.floor(Number(stats.totalDonatedWei))).toString(), 2)}
                </div>
                <div className="text-sm text-gray-500 mt-1">C2FLR Donated</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-3xl font-bold text-gray-900">{stats.donationCount}</div>
                <div className="text-sm text-gray-500 mt-1">Total Donations</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-3xl font-bold text-gray-900">{stats.uniqueDonors}</div>
                <div className="text-sm text-gray-500 mt-1">Unique Donors</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-3xl font-bold text-gray-900">{stats.activeEvents}</div>
                <div className="text-sm text-gray-500 mt-1">Active Events</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-3xl font-bold text-green-600">{stats.completedPayouts}</div>
                <div className="text-sm text-gray-500 mt-1">Payouts Done</div>
              </div>
            </div>
          ) : null}

          {/* How verification works */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">How On-Chain Verification Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="w-12 h-12 bg-flare-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">1️⃣</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Donation Recorded</h3>
                <p className="text-sm text-gray-500">
                  When you donate, the <code className="bg-gray-100 px-1 rounded">DonationVault</code> smart
                  contract emits a <code className="bg-gray-100 px-1 rounded">DonationReceived</code> event
                  with your address, amount, event ID, and org ID.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-flare-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">2️⃣</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Allocation On-Chain</h3>
                <p className="text-sm text-gray-500">
                  Admin-approved allocation splits are stored in the{" "}
                  <code className="bg-gray-100 px-1 rounded">AllocationRegistry</code> contract,
                  making fund distribution rules publicly verifiable.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-flare-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">3️⃣</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Payout Receipt</h3>
                <p className="text-sm text-gray-500">
                  When funds are converted to fiat and distributed, a{" "}
                  <code className="bg-gray-100 px-1 rounded">PayoutReceipt</code> is immutably recorded
                  on-chain with the off-ramp reference hash.
                </p>
              </div>
            </div>
          </div>

          {/* FTSO Integration */}
          <div className="bg-gradient-to-r from-flare-50 to-orange-50 rounded-xl border border-flare-200 p-8 mb-8">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">📈</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Powered by Flare FTSO
                </h2>
                <p className="text-gray-600 mb-4">
                  Flare-Aid uses Flare&apos;s enshrined <strong>FTSO (Flare Time Series Oracle)</strong> to
                  display real-time FLR/USD pricing alongside donations. The FTSO is a decentralized oracle
                  baked directly into Flare&apos;s protocol with:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>~1.8s block-latency feeds</strong> — price updates every block, for free</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>~100 independent data providers</strong> per feed, selected by stake-weighted VRF</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>Supported up to 1000 feeds</strong> across crypto, equities, and commodities</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>
                      Our <code className="bg-white px-1 rounded border">FTSOPriceFeed</code> contract reads
                      FLR/USD via <code className="bg-white px-1 rounded border">ContractRegistry.getFtsoV2()</code>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Explorer link */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Verify Everything Yourself</h2>
            <p className="text-gray-500 mb-6">
              All smart contracts are deployed on Flare&apos;s Coston2 testnet.
              Click below to inspect the contracts on the block explorer.
            </p>
            <a
              href={COSTON2_EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-ocean-600 text-white rounded-lg font-medium hover:bg-ocean-700 transition-colors"
            >
              Open Coston2 Explorer →
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
