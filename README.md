# 🇱🇦 **$LUKAS – The First LatAm Basket-Stable Meme Coin**

[![Deploy to GitHub Pages](https://github.com/hashpass-tech/lukas-protocol/actions/workflows/deploy.yml/badge.svg)](https://github.com/hashpass-tech/lukas-protocol/actions/workflows/deploy.yml)
[![Publish Lukas SDK](https://github.com/hashpass-tech/lukas-protocol/actions/workflows/publish-sdk.yml/badge.svg)](https://github.com/hashpass-tech/lukas-protocol/actions/workflows/publish-sdk.yml)
[![Version](https://img.shields.io/badge/version-0.2.41-blue.svg)](./version.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![npm](https://img.shields.io/npm/v/@lukas-protocol/sdk)](https://www.npmjs.com/package/@lukas-protocol/sdk)

### **Open-Source Monorepo: Index Oracle • Uniswap v4 Hook • Adapters • Stabilizer Vault**

---

## 🌎 Overview

**$LUKAS** is an open, community-driven protocol that introduces the **world's first regional Latin American basket-stable meme coin**, pegged to a weighted index of **BRL, MXN, COP, CLP, and ARS** currencies:

| Currency | Weight |
| -------- | ------ |
| BRL      | 40%    |
| MXN      | 30%    |
| COP      | 15%    |
| CLP      | 10%    |
| ARS      | 5%     |

📌 **1 LUKAS ≈ 1 LatAm Peso Index (LPI)**

This repository provides the **on-chain infrastructure** that maintains the peg, using:

* **Uniswap v4 Hooks** (Polygon)
* **TWAP-based price adapters** from existing LatAm stablecoin pools
* **Cross-chain FX feeds** for MXN & ARS
* **CLP oracle integration**
* **Stabilizer vault module** for mint/burn and liquidity management
* **FHENIX encrypted stabilization** for privacy-preserving parameter management

The architecture is intentionally modular, censorship-resistant, and audit-friendly.

---

## 🏗 Repository Structure

This is a **Turborepo** monorepo containing:

```
.
├── apps/
│   ├── web/              # Next.js web app with Protocol Contracts Dashboard
│   │   └── src/components/ProtocolContractsDashboard/
│   │       ├── index.tsx                    # Main dashboard component
│   │       ├── ArchitectureVisualization.tsx # D3.js 2D / Three.js 3D visualization
│   │       ├── ContractCard.tsx             # Contract status cards
│   │       ├── RoadmapSection.tsx           # Development roadmap
│   │       └── ...
│   └── docs/             # Docusaurus documentation site
├── packages/
│   ├── contracts/        # Foundry smart contracts (LukasToken, oracles, hooks)
│   ├── lukas-sdk/        # TypeScript SDK (@lukas-protocol/sdk on npm)
│   └── legal-content/    # Single-source legal documents (Terms, Privacy)
├── scripts/
│   ├── version.js        # Automated versioning with changelog generation
│   └── archive-old-docs.sh # Documentation cleanup on release
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 📚 Documentation

### Live Documentation
- 🌐 **[lukas.lat](https://lukas.lat)** - Main web application
- 📖 **[lukas.lat/documentation](https://lukas.lat/documentation)** - Full documentation site

### Contract Documentation
- 📦 **[packages/contracts/README.md](./packages/contracts/README.md)** - Smart contracts overview
- 📊 **[packages/contracts/DEPLOYMENT_STATUS.md](./packages/contracts/DEPLOYMENT_STATUS.md)** - Live deployment tracking

### SDK Documentation
- 📘 **[packages/lukas-sdk/README.md](./packages/lukas-sdk/README.md)** - SDK usage guide
- 📦 **[@lukas-protocol/sdk on npm](https://www.npmjs.com/package/@lukas-protocol/sdk)** - Published package

### Version History
- 📋 **[CHANGELOG.md](./CHANGELOG.md)** - Release notes and changes
- 🔢 **[VERSIONING.md](./VERSIONING.md)** - Versioning strategy

---

## ✨ Recent Updates (v0.2.41)

### Protocol Contracts Dashboard
- **D3.js 2D Architecture Visualization** - Force-directed graph showing contract relationships
- **Three.js 3D Visualization** - Interactive 3D view with orbiting nodes and animated connections
- **2D/3D View Switcher** - Toggle between visualization modes (3D default)
- **Directional Connection Arrows** - Shows dependency direction, bidirectional communication, and data flow

### Infrastructure
- **Automated Documentation Cleanup** - Old docs archived on each release
- **Version Script Enhancements** - Auto-changelog generation from git commits

---

## ⚙️ Core Architecture

$LUKAS stabilization system is built from three components:

### 1️⃣ LatAmBasketIndex (Polygon)

A canonical on-chain oracle that calculates:

```
LatAm Index = Σ (Fiat/USD_i * weight_i)
```

**Inputs:** BRZAdapter, COPMAdapter, MXNRemoteFeed, ARSRemoteFeed, CLPOracle

**Outputs:** `getIndexUSD()` → index in 1e8, `getLukasFairPriceInUSDC()` → price in 1e18

### 2️⃣ Uniswap v4 Hook – LukasHook

Custom v4 hook attached to the **LUKAS/USDC Pool**:
- Reads pool mid-price and fair value from LatAmBasketIndex
- Emits peg deviation events
- Triggers StabilizerVault actions (mint/burn/LP management)

### 3️⃣ StabilizerVault

Controlled module for monetary actions:
- Mint/burn LUKAS based on peg deviation
- Hold USDC/BTC/ETH collateral
- Manage liquidity positions

---

## 🔌 Supported Price Feeds

| Currency | Source                       | Implementation    |
| -------- | ---------------------------- | ----------------- |
| BRL      | BRZ/USDT pool (Polygon)      | BRZAdapter.sol    |
| MXN      | MXNB/USDT pool (Ethereum)    | MXNRemoteFeed.sol |
| COP      | COPM/USDT pool (Polygon)     | COPMAdapter.sol   |
| ARS      | wARS/USDC pool (World Chain) | ARSRemoteFeed.sol |
| CLP      | Chainlink/Pyth/off-chain     | CLPOracle.sol     |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- pnpm 8+
- Foundry (for smart contracts)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

This starts:
- Web app at `http://localhost:3000`
- Docs at `http://localhost:3001`

### Build

```bash
pnpm build
```

### Smart Contracts

```bash
cd packages/contracts
forge install
forge build
forge test
```

---

## 🧪 Testing

Unit tests cover:
* TWAP oracle correctness
* Basket aggregation
* Hook deviation logic
* Cross-chain feed publishing
* Stabilizer signals

Integration tests simulate:
* Currency crashes and hyperinflation scenarios
* Multi-feed delays
* Off-peg liquidity drains

---

## 🔒 Security Philosophy

* **Immutable basket weights** after audit
* **Modular upgradeability** of feeds (not logic)
* **Cross-chain price publishers use 2-of-N multisig**
* **Optional timelock** for parameter changes
* **All state changes event-logged**
* **Hooks follow Uniswap v4 security constraints**

---

## 📜 Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | ✅ Complete | MVP – read-only peg awareness, all feeds connected |
| **Phase 2** | ✅ Complete | Peg Response – StabilizerVault, mint/burn thresholds |
| **Phase 3** | 🔄 In Progress | DAO & Multi-chain – governance, bridges |
| **Phase 4** | 📋 Planned | Full Regional Currency Layer – merchant plugins, POS, remittance |

---

## 🌐 Vision

> **$LUKAS is the first attempt to create a unified regional unit of account for Latin America.**
>
> Built openly, transparently, collaboratively — by developers across LATAM who believe in monetary independence, open finance, and meme-powered adoption.

---

## 🤝 Contributing

We welcome contributions from developers, researchers, economists, and FX specialists.

1. Fork + create a feature branch
2. Follow Foundry + Solidity style guides
3. Submit PR with clear motivation, tests, and gas report

**Areas looking for contributors:**
- Hook optimization
- Cross-chain FX publisher tooling
- MEV-resistant price sampling
- Formal verification

---

## 📄 License

MIT License — free for everyone to build and extend.

---

## 💬 Community & Support

* Twitter/X [@LUKAS_LATAM](https://twitter.com/LUKAS_LATAM)
* Discord (public)
* Telegram (engineers & researchers)
* HashPass Developer Portal: *coming soon*
