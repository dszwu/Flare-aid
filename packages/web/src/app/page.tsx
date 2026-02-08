import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-flare-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-flare-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-ocean-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 mb-6">
              <span className="px-3 py-1 bg-flare-500/20 border border-flare-500/30 rounded-full text-sm text-flare-300 font-medium">
                Powered by Flare FTSO
              </span>
              <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-sm text-green-300 font-medium">
                Coston2 Testnet
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Transparent Disaster Relief on{" "}
              <span className="text-flare-400">Flare</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Monitor global disasters in real-time. Donate with C2FLR directly to
              verified relief organizations. Track every donation from your wallet
              to the last mile — fully on-chain, fully transparent.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/events"
                className="px-8 py-4 bg-flare-500 text-white rounded-xl font-semibold text-lg hover:bg-flare-600 transition-colors shadow-lg shadow-flare-500/25 text-center"
              >
                View Active Disasters
              </Link>
              <Link
                href="/transparency"
                className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors text-center"
              >
                Transparency Ledger
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Flare-Aid Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              End-to-end transparency from disaster detection to aid distribution,
              powered by Flare&apos;s enshrined oracle (FTSO) for real-time pricing.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                icon: "🌍",
                title: "Monitor",
                desc: "Ingest real-time data from USGS, GDACS, ReliefWeb, and NASA EONET to detect global disasters.",
              },
              {
                step: "02",
                icon: "✅",
                title: "Verify",
                desc: "Admins review alerts, approve events, and assign relief organizations with allocation splits.",
              },
              {
                step: "03",
                icon: "💎",
                title: "Donate",
                desc: "Donors connect their wallet and send C2FLR directly to the on-chain DonationVault contract.",
              },
              {
                step: "04",
                icon: "📊",
                title: "Track",
                desc: "Every donation, allocation, and payout is recorded on Flare with FTSO pricing for full auditability.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-flare-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <div className="text-sm font-bold text-flare-500 mb-1">Step {item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flare Integration */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built on Flare&apos;s Data Protocols</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Flare-Aid leverages Flare&apos;s enshrined FTSO (Flare Time Series Oracle) — a decentralized
              oracle baked into the protocol with ~1.8s block-latency feeds and 100+ data providers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">FTSO Price Feeds</h3>
              <p className="text-sm text-gray-500">
                Real-time FLR/USD pricing from FTSOv2 displayed alongside every donation.
                ~100 independent data providers ensure accurate, manipulation-resistant prices.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="text-3xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">On-Chain Transparency</h3>
              <p className="text-sm text-gray-500">
                All donations, allocations, and payout receipts are recorded on Flare.
                Every transaction is verifiable on the Coston2 Explorer.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Finality</h3>
              <p className="text-sm text-gray-500">
                Flare&apos;s single-slot finality (~1.8s) means donations are confirmed
                almost instantly — no waiting for multiple block confirmations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-flare-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Make an Impact?</h2>
          <p className="text-flare-100 mb-8 text-lg">
            Connect your MetaMask wallet, browse active disasters, and make your first transparent donation.
          </p>
          <Link
            href="/events"
            className="inline-block px-8 py-4 bg-white text-flare-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Donating
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
