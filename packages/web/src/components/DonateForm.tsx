"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useConnect, useSendTransaction, useSwitchChain, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { wagmiConfig, coston2 } from "@/lib/wagmi";
import { COSTON2_EXPLORER_URL, COSTON2_CHAIN_ID } from "@flare-aid/common";
import { shortenAddress } from "@/lib/utils";

interface DonateFormProps {
  eventId: number;
  orgId: number;
  orgName: string;
  walletAddress: string;
}

export function DonateForm({ eventId, orgId, orgName, walletAddress }: DonateFormProps) {
  const { isConnected, address: donorAddress, chainId } = useAccount();
  const { connect } = useConnect();
  const { switchChain } = useSwitchChain();
  const [amount, setAmount] = useState("");
  const recordedRef = useRef(false);

  const isWrongNetwork = isConnected && chainId !== COSTON2_CHAIN_ID;

  const { data: hash, sendTransaction, isPending, error } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Record donation in database after on-chain confirmation
  useEffect(() => {
    if (!isSuccess || !hash || !donorAddress || !amount || recordedRef.current) return;
    recordedRef.current = true;

    fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        txHash: hash,
        donorAddress,
        eventId,
        orgId,
        amountWei: parseEther(amount).toString(),
        blockNumber: 0,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) console.error("[DonateForm] Failed to record donation:", data.error);
      })
      .catch((err) => console.error("[DonateForm] Error recording donation:", err));
  }, [isSuccess, hash, donorAddress, amount, eventId, orgId]);

  const handleDonate = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    if (!walletAddress) return;

    sendTransaction({
      to: walletAddress as `0x${string}`,
      value: parseEther(amount),
      chainId: COSTON2_CHAIN_ID,
    });
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-600 mb-4">Connect your wallet to donate</p>
        <button
          onClick={() => connect({ connector: wagmiConfig.connectors[0] })}
          className="px-6 py-3 bg-flare-500 text-white rounded-lg font-medium hover:bg-flare-600 transition-colors"
        >
          Connect MetaMask
        </button>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h3 className="text-yellow-800 font-semibold text-lg mb-2">Wrong Network</h3>
        <p className="text-yellow-600 text-sm mb-4">
          Please switch to <strong>Flare Coston2 Testnet</strong> to donate.
        </p>
        <button
          onClick={() => switchChain({ chainId: COSTON2_CHAIN_ID })}
          className="px-6 py-3 bg-flare-500 text-white rounded-lg font-medium hover:bg-flare-600 transition-colors"
        >
          Switch to Coston2
        </button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-green-800 font-semibold text-lg mb-2">Donation Confirmed!</h3>
        <p className="text-green-600 text-sm mb-4">
          {amount} C2FLR donated to {orgName} for this disaster.
        </p>
        <a
          href={`${COSTON2_EXPLORER_URL}/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-flare-600 hover:text-flare-700 underline"
        >
          View on Flare Explorer →
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-1">Donate C2FLR</h3>
      <p className="text-sm text-gray-500 mb-1">To: {orgName}</p>
      <p className="text-xs text-gray-400 font-mono mb-4">Wallet: {shortenAddress(walletAddress)}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (C2FLR)</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flare-300 focus:border-flare-500 outline-none transition-all text-lg"
            />
            <span className="absolute right-4 top-3.5 text-gray-400 font-medium">C2FLR</span>
          </div>
        </div>

        {/* Quick amounts */}
        <div className="flex space-x-2">
          {["1", "5", "10", "50"].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {v} C2FLR
            </button>
          ))}
        </div>

        <button
          onClick={handleDonate}
          disabled={isPending || isConfirming || !amount || parseFloat(amount) <= 0}
          className="w-full py-3 bg-flare-500 text-white rounded-lg font-semibold hover:bg-flare-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending
            ? "Confirm in Wallet..."
            : isConfirming
            ? "Confirming..."
            : `Donate ${amount || "0"} C2FLR`}
        </button>

        {error && (
          <p className="text-red-500 text-sm">
            {(error as any)?.shortMessage || error.message}
          </p>
        )}
      </div>
    </div>
  );
}
