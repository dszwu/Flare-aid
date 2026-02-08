// ABI exports for the Flare-Aid contracts
// These are minimal ABIs containing only the functions the frontend needs

export const DonationVaultABI = [
  {
    type: "function",
    name: "donate",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "orgId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "eventTotals",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "eventOrgTotals",
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDonorHistory",
    inputs: [{ name: "donor", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "donor", type: "address" },
          { name: "eventId", type: "uint256" },
          { name: "orgId", type: "uint256" },
          { name: "amount", type: "uint256" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDonationCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBalance",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "orgId", type: "uint256" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "DonationReceived",
    inputs: [
      { name: "donor", type: "address", indexed: true },
      { name: "eventId", type: "uint256", indexed: true },
      { name: "orgId", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "FundsWithdrawn",
    inputs: [
      { name: "eventId", type: "uint256", indexed: true },
      { name: "orgId", type: "uint256", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

export const AllocationRegistryABI = [
  {
    type: "function",
    name: "setAllocation",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "orgIds", type: "uint256[]" },
      { name: "splitBps", type: "uint256[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAllocation",
    inputs: [{ name: "eventId", type: "uint256" }],
    outputs: [
      { name: "orgIds", type: "uint256[]" },
      { name: "splitBps", type: "uint256[]" },
      { name: "approvedBy", type: "address" },
      { name: "approvedAt", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasAllocation",
    inputs: [{ name: "eventId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AllocationSet",
    inputs: [
      { name: "eventId", type: "uint256", indexed: true },
      { name: "orgIds", type: "uint256[]", indexed: false },
      { name: "splitBps", type: "uint256[]", indexed: false },
      { name: "approvedBy", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export const PayoutReceiptABI = [
  {
    type: "function",
    name: "record",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "orgId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "fiatCurrency", type: "string" },
      { name: "fiatAmount", type: "uint256" },
      { name: "offrampRefHash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getEventReceipts",
    inputs: [{ name: "eventId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "eventId", type: "uint256" },
          { name: "orgId", type: "uint256" },
          { name: "amount", type: "uint256" },
          { name: "fiatCurrency", type: "string" },
          { name: "fiatAmount", type: "uint256" },
          { name: "offrampRefHash", type: "bytes32" },
          { name: "timestamp", type: "uint256" },
          { name: "recordedBy", type: "address" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getReceiptCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "PayoutRecorded",
    inputs: [
      { name: "eventId", type: "uint256", indexed: true },
      { name: "orgId", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "fiatCurrency", type: "string", indexed: false },
      { name: "fiatAmount", type: "uint256", indexed: false },
      { name: "offrampRefHash", type: "bytes32", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export const FTSOPriceFeedABI = [
  {
    type: "function",
    name: "getFlrUsdPrice",
    inputs: [],
    outputs: [
      { name: "value", type: "uint256" },
      { name: "decimals", type: "int8" },
      { name: "timestamp", type: "uint64" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "flrToUsd",
    inputs: [{ name: "flrAmount", type: "uint256" }],
    outputs: [{ name: "usdValue", type: "uint256" }],
    stateMutability: "view",
  },
] as const;
