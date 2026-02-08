# Flare-Aid 🔥🤝

**Disaster relief powered by Flare Network's enshrined data protocols.**

Flare-Aid is a decentralized disaster-relief platform that monitors global disaster feeds, flags critical events, enables donors to contribute C2FLR on Flare's Coston2 testnet, and distributes funds to a curated allowlist of relief organizations — with full on-chain transparency.

> Built for the Flare Hackathon — using **FTSO v2** (Flare Time Series Oracle) for real-time FLR/USD price conversion, ensuring every donation amount is transparently valued.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Multi-source Disaster Ingestion** | Aggregates USGS, GDACS, ReliefWeb & NASA EONET feeds into a unified severity-scored event stream |
| **FTSO v2 Price Feeds** | On-chain FLR/USD conversion via Flare's enshrined oracle — no third-party dependency |
| **DonationVault** | Solidity smart contract accepting C2FLR with per-event, per-org accounting |
| **Allocation Registry** | Admin-controlled fund splits with on-chain 10,000 bps (basis points) invariant |
| **Payout Receipts** | Immutable on-chain record of every off-ramp distribution |
| **On-chain Indexer** | Lightweight block poller syncing contract events to PostgreSQL for fast API queries |
| **Donor Dashboard** | Wallet-connected donation history and impact tracking |
| **Transparency Page** | Public ledger view with FTSO integration showcase |
| **Admin Panel** | Event review/approval, org management, allocation setting, payout execution |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js 14)             │
│  Home · Events · Donate · My Donations · Transparency │
│  Admin: Dashboard · Events · Orgs · Payouts         │
├─────────────────────┬──────────────┬────────────────┤
│     wagmi + viem    │  REST API    │  JWT Auth       │
├─────────────────────┴──────────────┴────────────────┤
│                 Coston2 Testnet (Chain 114)          │
│  DonationVault · AllocationRegistry · PayoutReceipt │
│  FTSOPriceFeed (→ FlareContractRegistry → FTSO v2)  │
├─────────────────────────────────────────────────────┤
│          Ingestion Service (4 Disaster Feeds)       │
│          On-chain Indexer (Block Poller)             │
│          Payout Service (Mock Off-ramp Adapter)      │
├─────────────────────────────────────────────────────┤
│              PostgreSQL (pg driver)                   │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (workspaces support)
- **MetaMask** browser extension (for donor interactions)
- C2FLR testnet tokens from [Coston2 Faucet](https://faucet.flare.network/coston2)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/flare-aid.git
cd flare-aid
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|---|---|
| `COSTON2_RPC_URL` | Coston2 RPC endpoint (default provided) |
| `DEPLOYER_PRIVATE_KEY` | Wallet private key for contract deployment |
| `ADMIN_JWT_SECRET` | Secret for admin JWT tokens |
| `CRON_API_KEY` | API key for cron/ingestion endpoints |

### 3. Compile & Deploy Contracts

```bash
# Compile Solidity
npm run compile

# Run contract tests
npm test

# Deploy to Coston2
npm run deploy
```

Deployment addresses are written to `packages/common/deployments/coston2.json`.

### 4. Seed Database & Start

```bash
# Seed admin user + sample orgs
npm run seed

# Run disaster feed ingestion
npm run ingest

# Start development server
npm run dev
```

Visit **https://flare-aid.vercel.app/** — connect MetaMask (Coston2 network) and start donating!

### Default Admin Credentials

- **Email:** admin@flareaid.org
- **Password:** admin123

---

## 📁 Project Structure

```
flare-aid/
├── packages/
│   ├── contracts/          # Hardhat project
│   │   ├── contracts/      # Solidity sources
│   │   │   ├── DonationVault.sol
│   │   │   ├── AllocationRegistry.sol
│   │   │   ├── PayoutReceipt.sol
│   │   │   └── FTSOPriceFeed.sol
│   │   ├── test/           # Hardhat tests
│   │   └── scripts/        # Deploy script
│   ├── common/             # Shared types, constants, ABIs
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── deployments/    # Contract addresses per network
│   └── web/                # Next.js 14 application
│       └── src/
│           ├── app/        # App Router pages & API routes
│           ├── components/ # React components
│           ├── db/         # PostgreSQL schema & seed
│           ├── lib/        # Utils, auth, wagmi config, ABIs
│           └── services/   # Ingestion, indexer, payout
├── .env.example
├── package.json            # Monorepo root with workspaces
└── README.md
```

---

## 🔥 Flare Integration Deep Dive

### FTSO v2 — Enshrined Price Oracle

Flare-Aid uses the **Flare Time Series Oracle (FTSO v2)** to convert FLR donation amounts to USD values in real time. This is critical for:

1. **Transparency** — Donors and auditors see the USD equivalent at time of donation
2. **Payout calculations** — Off-ramp conversions reference the FTSO rate
3. **Dashboard stats** — Aggregate impact metrics denominated in USD

**How it works on-chain:**

```solidity
// FTSOPriceFeed.sol
IFlareContractRegistry registry = IFlareContractRegistry(0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019);
ITestFtsoV2 ftso = ITestFtsoV2(registry.getContractAddressByName("FtsoV2"));

(uint256 price, int8 decimals, uint64 timestamp) = ftso.getFeedById(FLR_USD_FEED_ID);
```

- **Feed ID:** `0x01464c522f55534400000000000000000000000000` (FLR/USD)
- **Contract Registry:** Fixed address across all Flare networks
- **Testnet note:** Coston2 uses `ITestFtsoV2` (view function) vs mainnet's `IFtsoV2` (payable)

### Why Flare's Enshrined Protocols Matter for Disaster Relief

Traditional disaster-relief platforms suffer from:
- **Opaque fund tracking** — donors can't verify where money went
- **Slow, expensive cross-border transfers** — intermediary fees eat into donations
- **No real-time pricing** — conversion rates are opaque or delayed

Flare's enshrined data protocols solve these by providing:
- **Built-in, manipulation-resistant price feeds** — no reliance on centralized oracles
- **Sub-second finality** — donations confirm in ~1.8 seconds
- **Native EVM compatibility** — standard Solidity tooling works out of the box

---

## 🧪 Smart Contract Details

### DonationVault

Accepts native C2FLR via `donate(eventId, orgId)`. Tracks:
- `eventTotals[eventId]` — total donated per event
- `eventOrgTotals[eventId][orgId]` — per-org breakdown
- `donorHistory[donor]` — array of all donations by address

### AllocationRegistry

Admin sets `setAllocation(eventId, orgIds[], splitBps[])`:
- Split percentages in basis points (1 bps = 0.01%)
- Contract enforces `sum(splitBps) == 10000` invariant
- Uses OpenZeppelin AccessControl with `ADMIN_ROLE`

### PayoutReceipt

Immutable receipt: `record(eventId, orgId, amount, fiatCurrency, fiatAmount, offrampRefHash)`:
- Records off-ramp reference hash on-chain
- Indexed by event and org for efficient querying
- One-way append — receipts cannot be modified

### FTSOPriceFeed

Reads FLR/USD from Flare's contract registry → FTSO v2:
- `getFlrUsdPrice()` — returns `(price, decimals, timestamp)`
- `flrToUsd(flrAmount)` — converts wei to USD with proper decimal handling
- Handles testnet (`ITestFtsoV2`) vs mainnet (`IFtsoV2`) interfaces

---

## 🌍 Disaster Data Sources

| Source | Endpoint | Data |
|---|---|---|
| USGS | earthquake.usgs.gov | Earthquakes M4.5+ |
| GDACS | gdacs.org RSS | Multi-hazard alerts |
| ReliefWeb | api.reliefweb.int | Humanitarian reports |
| NASA EONET | eonet.gsfc.nasa.gov | Earth observation events |

The ingestion service normalizes all feeds into a common `NormalizedEvent` schema with severity scoring (0–100), deduplicates by `externalId + source`, and creates admin notifications for events scoring ≥ 50.

---

## 🔐 Security

- **Admin auth:** JWT (HS256) in httpOnly cookies, 24h expiry, bcrypt password hashing
- **Smart contracts:** OpenZeppelin Ownable, ReentrancyGuard, AccessControl
- **API protection:** Admin routes verify JWT session; cron routes require API key
- **On-chain safety:** `nonReentrant` on all payable functions, input validation in all setters

---

## 📝 Feedback: Building on Flare

### What Worked Well

1. **FlareContractRegistry is brilliant** — Having a single, fixed-address registry (`0xaD67...`) across all networks (Coston, Coston2, Songbird, Flare) makes integration trivially portable. We never had to manage different FTSO addresses per network; just call `getContractAddressByName("FtsoV2")` and it works everywhere.

2. **FTSO v2 feed design** — The `getFeedById()` interface with structured 21-byte feed IDs is well-designed. The `(value, decimals, timestamp)` return tuple gives you everything needed for price calculations in a single call. No need for auxiliary queries to get decimals or stale checks.

3. **Coston2 testnet stability** — The testnet was reliable throughout development with consistent ~1.8s block times. The faucet at `faucet.flare.network/coston2` was straightforward.

4. **EVM compatibility** — Standard Hardhat/Solidity/viem/wagmi tooling just works. There were no surprises — Flare truly is a standard EVM chain with added data superpowers.

5. **Periphery contracts package** — `@flarenetwork/flare-periphery-contracts` providing typed Solidity interfaces for FTSO, registry, etc. saved significant time vs manually defining ABIs.

### Challenges & Suggestions

1. **Testnet vs Mainnet FTSO interface difference** — `ITestFtsoV2` uses `view` functions while mainnet `IFtsoV2` uses `payable` (for fee-based access). This required conditional logic in our contract. It would be helpful if the docs had a clearer migration guide or a unified interface that abstracts this difference.

2. **Documentation migration** — During development, the docs site migrated from `docs.flare.network` to `dev.flare.network`. Many community resources and tutorials still link to the old domain. Updating community examples and adding redirects would help.

3. **Limited stablecoin ecosystem** — At the time of building, there was no native F-USD or widely-available stablecoin on Coston2. For a disaster-relief app, accepting a volatile native token adds UX friction (donors worry about price movement between donation and distribution). A native stablecoin on Flare would unlock far more real-world use cases.

4. **Off-ramp ecosystem** — Finding off-ramp partners that natively support Flare/C2FLR was challenging. Most fiat on/off-ramp providers (Transak, MoonPay) don't list Flare yet. A bridge-first approach (Flare → stablecoin on a supported chain → fiat) is possible but adds complexity. Flare partnerships with off-ramp providers would be transformative for last-mile delivery applications.

5. **Feed ID encoding** — While the 21-byte feed ID structure is logical (category + symbol), discovering the correct feed ID for a given pair required digging through docs. A simple feed ID registry/lookup tool (or a Solidity library mapping common pairs to their IDs) would improve DX.

### Overall

Building on Flare was a genuinely positive experience. The network's focus on **enshrined data protocols** as a first-class primitive — rather than bolting oracles on as an afterthought — aligns perfectly with real-world applications like disaster relief where data integrity is non-negotiable. The FTSO price feed integration was the smoothest oracle integration we've done across any EVM chain.

The main feedback is around **ecosystem maturity** — stablecoin availability, off-ramp partnerships, and documentation polish. These are solvable and likely already on the roadmap. The core protocol is solid, performant, and well-designed for the use cases Flare targets.

---

## 📄 License

MIT

---

Built with ❤️ on [Flare Network](https://flare.network)
