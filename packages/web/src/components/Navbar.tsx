"use client";

import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { shortenAddress } from "@/lib/utils";
import { useState } from "react";

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + Nav */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-flare-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FA</span>
              </div>
              <span className="font-bold text-xl text-gray-900">
                Flare<span className="text-flare-500">Aid</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/events"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Disasters
              </Link>
              <Link
                href="/transparency"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Transparency
              </Link>
              {isConnected && (
                <Link
                  href="/my-donations"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  My Donations
                </Link>
              )}
            </div>
          </div>

          {/* Wallet */}
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/login"
              className="hidden md:block text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Admin
            </Link>

            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-mono text-green-700">
                    {shortenAddress(address!)}
                  </span>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => connect({ connector: wagmiConfig.connectors[0] })}
                className="px-4 py-2 bg-flare-500 text-white rounded-lg font-medium hover:bg-flare-600 transition-colors shadow-sm"
              >
                Connect Wallet
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white pb-4">
          <div className="flex flex-col space-y-2 px-4 pt-3">
            <Link href="/events" className="py-2 text-gray-700" onClick={() => setMobileOpen(false)}>
              Disasters
            </Link>
            <Link href="/transparency" className="py-2 text-gray-700" onClick={() => setMobileOpen(false)}>
              Transparency
            </Link>
            {isConnected && (
              <Link href="/my-donations" className="py-2 text-gray-700" onClick={() => setMobileOpen(false)}>
                My Donations
              </Link>
            )}
            <Link href="/admin/login" className="py-2 text-gray-400" onClick={() => setMobileOpen(false)}>
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
