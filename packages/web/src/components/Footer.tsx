import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-flare-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FA</span>
              </div>
              <span className="font-bold text-xl text-white">
                Flare<span className="text-flare-400">Aid</span>
              </span>
            </div>
            <p className="text-sm">
              Transparent disaster relief powered by Flare Network.
              Every donation is tracked on-chain from donor to recipient.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/events" className="hover:text-white transition-colors">Active Disasters</Link></li>
              <li><Link href="/transparency" className="hover:text-white transition-colors">Transparency Ledger</Link></li>
              <li><Link href="/my-donations" className="hover:text-white transition-colors">My Donations</Link></li>
            </ul>
          </div>

          {/* Flare */}
          <div>
            <h3 className="text-white font-semibold mb-3">Built on Flare</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://dev.flare.network" target="_blank" rel="noopener noreferrer"
                  className="hover:text-white transition-colors">Flare Developer Hub</a>
              </li>
              <li>
                <a href="https://coston2-explorer.flare.network" target="_blank" rel="noopener noreferrer"
                  className="hover:text-white transition-colors">Coston2 Explorer</a>
              </li>
              <li>
                <a href="https://dev.flare.network/ftso/overview" target="_blank" rel="noopener noreferrer"
                  className="hover:text-white transition-colors">FTSO Price Oracle</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>
            Flare-Aid MVP &mdash; Coston2 Testnet &mdash; Built with Flare FTSO
          </p>
        </div>
      </div>
    </footer>
  );
}
