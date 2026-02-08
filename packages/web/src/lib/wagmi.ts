import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";
import { COSTON2_CHAIN_ID, COSTON2_RPC_URL, COSTON2_EXPLORER_URL } from "@flare-aid/common";

export const coston2 = defineChain({
  id: COSTON2_CHAIN_ID,
  name: "Flare Testnet Coston2",
  nativeCurrency: {
    name: "Coston2 Flare",
    symbol: "C2FLR",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [COSTON2_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "Coston2 Explorer", url: COSTON2_EXPLORER_URL },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [coston2],
  connectors: [injected()],
  transports: {
    [coston2.id]: http(COSTON2_RPC_URL),
  },
  ssr: true,
});

// Contract addresses — loaded from deployment
import deployment from "@flare-aid/common/deployments/coston2.json";

export const CONTRACT_ADDRESSES = {
  DonationVault: deployment.contracts.DonationVault as `0x${string}`,
  AllocationRegistry: deployment.contracts.AllocationRegistry as `0x${string}`,
  PayoutReceipt: deployment.contracts.PayoutReceipt as `0x${string}`,
  FTSOPriceFeed: deployment.contracts.FTSOPriceFeed as `0x${string}`,
};
