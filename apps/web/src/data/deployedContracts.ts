/**
 * Deployed Contracts Registry
 * Contains all deployed LUKAS protocol contracts with their addresses and metadata
 */

import { Contract, ContractRegistry } from '@/types/contracts';

export const deployedContracts: Contract[] = [
  // Polygon Amoy Contracts - FHENIX Phase 1
  {
    id: 'fhenix-encryption-manager-amoy',
    name: 'FhenixEncryptionManager',
    category: 'FHENIX',
    description: 'Core encryption infrastructure for FHENIX Phase 1. Manages encryption keys and lifecycle.',
    deployment: {
      address: '0xcafe3cfad5f4dd86dec1ad25b48382b3fa44cb97',
      block: 32003759,
      network: 'amoy',
      timestamp: '2026-01-09T11:32:02.539Z',
      deployer: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
    },
    state: {
      status: 'active',
      version: '0.2.42',
      owner: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
      variables: [
        {
          name: 'encryptionLevel',
          type: 'uint256',
          value: '192',
          description: 'Encryption level in bits',
          visibility: 'public',
        },
        {
          name: 'publicKey',
          type: 'bytes',
          value: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          description: 'FHENIX public key for encryption',
          visibility: 'public',
        },
        {
          name: 'initialized',
          type: 'bool',
          value: 'true',
          description: 'Encryption initialization status',
          visibility: 'public',
        },
      ],
      lastUpdate: '2026-01-09T11:32:02.539Z',
    },
    technical: {
      sourceCode: 'packages/contracts/src/fhenix/core/FhenixEncryptionManager.sol',
      size: 6144,
      gasEstimate: 1540606,
      interfaces: ['IFhenixEncryptionManager'],
      functions: [
        {
          name: 'initializeEncryption',
          signature: 'initializeEncryption(bytes,uint256)',
          visibility: 'public',
        },
        {
          name: 'getEncryptionLevel',
          signature: 'getEncryptionLevel()',
          visibility: 'public',
        },
        {
          name: 'getPublicKey',
          signature: 'getPublicKey()',
          visibility: 'public',
        },
        {
          name: 'isEncryptionActive',
          signature: 'isEncryptionActive()',
          visibility: 'public',
        },
      ],
      errors: [],
    },
  },
  // Polygon Amoy Contracts - LUKAS Protocol
  {
    id: 'lukas-token-amoy',
    name: 'LukasToken',
    category: 'Token',
    description: 'LUKAS protocol native token. ERC20 token with 1M initial supply.',
    deployment: {
      address: '0x63524b53983960231b7b86CDEdDf050Ceb9263Cb',
      block: 0,
      network: 'amoy',
      timestamp: '2025-12-17T20:10:24.158Z',
      deployer: '0x4f36dc378d1c78181b3f544a81e8951fb4838ad9',
    },
    state: {
      status: 'active',
      version: '1.0.0',
      owner: '0x4f36dc378d1c78181b3f544a81e8951fb4838ad9',
      variables: [
        {
          name: 'totalSupply',
          type: 'uint256',
          value: '1000000000000000000000000',
          description: 'Total supply of LUKAS tokens',
          visibility: 'public',
        },
      ],
      lastUpdate: '2025-12-17T20:10:24.158Z',
    },
    technical: {
      sourceCode: 'packages/contracts/src/tokens/LukasToken.sol',
      size: 4096,
      gasEstimate: 1200000,
      interfaces: ['IERC20'],
      functions: [
        {
          name: 'transfer',
          signature: 'transfer(address,uint256)',
          visibility: 'public',
        },
        {
          name: 'approve',
          signature: 'approve(address,uint256)',
          visibility: 'public',
        },
        {
          name: 'balanceOf',
          signature: 'balanceOf(address)',
          visibility: 'public',
        },
      ],
      errors: [],
    },
  },
  {
    id: 'lat-am-basket-index-amoy',
    name: 'LatAmBasketIndex',
    category: 'Oracle',
    description: 'Oracle contract providing fair price for LUKAS token based on basket composition.',
    deployment: {
      address: '0x1Dccf1fB82946a293E03036e85edc2139cba1541',
      block: 0,
      network: 'amoy',
      timestamp: '2025-12-18T16:45:00.000Z',
      deployer: '0x4f36dc378d1c78181b3f544a81e8951fb4838ad9',
    },
    state: {
      status: 'active',
      version: '1.1.0',
      owner: '0x4f36dc378d1c78181b3f544a81e8951fb4838ad9',
      variables: [],
      lastUpdate: '2025-12-18T16:45:00.000Z',
    },
    technical: {
      sourceCode: 'packages/contracts/src/oracle/LatAmBasketIndex.sol',
      size: 4608,
      gasEstimate: 1100000,
      interfaces: ['IOracle'],
      functions: [
        {
          name: 'getLukasFairPriceInUSDC',
          signature: 'getLukasFairPriceInUSDC()',
          visibility: 'public',
        },
        {
          name: 'getBasketComposition',
          signature: 'getBasketComposition()',
          visibility: 'public',
        },
      ],
      errors: [],
    },
  },
  {
    id: 'lukas-hook-amoy',
    name: 'LukasHook',
    category: 'Hooks',
    description: 'Uniswap V4 hook for peg stabilization integration.',
    deployment: {
      address: '0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519',
      block: 0,
      network: 'amoy',
      timestamp: '2025-12-18T18:30:00.000Z',
      deployer: '0x4f36dc378d1c78181b3f544a81e8951fb4838ad9',
    },
    state: {
      status: 'active',
      version: '1.0.0-simplified',
      owner: '0x4f36dc378d1c78181b3f544a81e8951fb4838ad9',
      variables: [],
      lastUpdate: '2025-12-18T18:30:00.000Z',
    },
    technical: {
      sourceCode: 'packages/contracts/src/hooks/LukasHook.sol',
      size: 3584,
      gasEstimate: 900000,
      interfaces: ['IHook'],
      functions: [
        {
          name: 'beforeSwap',
          signature: 'beforeSwap(address,address,uint256)',
          visibility: 'public',
        },
        {
          name: 'afterSwap',
          signature: 'afterSwap(address,address,uint256)',
          visibility: 'public',
        },
      ],
      errors: [],
    },
  },
  {
    id: 'usdc-amoy',
    name: 'USDC',
    category: 'Token',
    description: 'Circle USDC stablecoin on Polygon Amoy testnet.',
    deployment: {
      address: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
      block: 0,
      network: 'amoy',
      timestamp: '2025-12-17T00:00:00.000Z',
      deployer: '0x0000000000000000000000000000000000000000',
    },
    state: {
      status: 'active',
      version: 'external',
      owner: '0x0000000000000000000000000000000000000000',
      variables: [],
      lastUpdate: '2025-12-17T00:00:00.000Z',
    },
    technical: {
      sourceCode: 'external',
      size: 0,
      gasEstimate: 0,
      interfaces: ['IERC20'],
      functions: [],
      errors: [],
    },
  },
  // Sepolia Testnet Contracts
  {
    id: 'lukas-token-sepolia',
    name: 'LukasToken',
    category: 'Token',
    description: 'LUKAS protocol native token on Sepolia testnet.',
    deployment: {
      address: '0x63524b53983960231b7b86CDEdDf050Ceb9263Cb',
      block: 0,
      network: 'sepolia',
      timestamp: '2025-12-19T20:39:00.000Z',
      deployer: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
    },
    state: {
      status: 'active',
      version: '1.0.0',
      owner: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
      variables: [],
      lastUpdate: '2025-12-19T20:39:00.000Z',
    },
    technical: {
      sourceCode: 'packages/contracts/src/tokens/LukasToken.sol',
      size: 4096,
      gasEstimate: 1200000,
      interfaces: ['IERC20'],
      functions: [],
      errors: [],
    },
  },
  {
    id: 'lat-am-basket-index-sepolia',
    name: 'LatAmBasketIndex',
    category: 'Oracle',
    description: 'Oracle contract on Sepolia with mock price feeds for testing.',
    deployment: {
      address: '0x46D240633d70AB16654e0053D05B24Dfb3284A71',
      block: 0,
      network: 'sepolia',
      timestamp: '2025-12-19T20:39:00.000Z',
      deployer: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
    },
    state: {
      status: 'active',
      version: '1.1.0',
      owner: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
      variables: [],
      lastUpdate: '2025-12-19T20:39:00.000Z',
    },
    technical: {
      sourceCode: 'packages/contracts/src/oracle/LatAmBasketIndex.sol',
      size: 4608,
      gasEstimate: 1100000,
      interfaces: ['IOracle'],
      functions: [],
      errors: [],
    },
  },
  {
    id: 'stabilizer-vault-sepolia',
    name: 'StabilizerVault',
    category: 'Vault',
    description: 'Stabilizer vault on Sepolia testnet.',
    deployment: {
      address: '0x64540D50CD37BC94C2ED77766Cc86C4D6C3ec9cE',
      block: 0,
      network: 'sepolia',
      timestamp: '2025-12-19T20:39:00.000Z',
      deployer: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
    },
    state: {
      status: 'active',
      version: '1.0.0',
      owner: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
      variables: [],
      lastUpdate: '2025-12-19T20:39:00.000Z',
    },
    technical: {
      sourceCode: 'packages/contracts/src/vault/StabilizerVault.sol',
      size: 5120,
      gasEstimate: 1500000,
      interfaces: ['IStabilizerVault'],
      functions: [],
      errors: [],
    },
  },
  {
    id: 'lukas-hook-sepolia',
    name: 'LukasHook',
    category: 'Hooks',
    description: 'Uniswap V4 hook on Sepolia testnet.',
    deployment: {
      address: '0xB6EAA80E5446895a6d7136e90c97821550e51805',
      block: 0,
      network: 'sepolia',
      timestamp: '2025-12-19T20:39:00.000Z',
      deployer: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
    },
    state: {
      status: 'active',
      version: '1.0.0-simplified',
      owner: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
      variables: [],
      lastUpdate: '2025-12-19T20:39:00.000Z',
    },
    technical: {
      sourceCode: 'packages/contracts/src/hooks/LukasHook.sol',
      size: 3584,
      gasEstimate: 900000,
      interfaces: ['IHook'],
      functions: [],
      errors: [],
    },
  },
  // Ethereum Mainnet Contracts (Planned - Not Yet Deployed)
  {
    id: 'lukas-token-mainnet',
    name: 'LukasToken',
    category: 'Token',
    description: 'LUKAS protocol native token on Ethereum Mainnet.',
    deployment: {
      address: '0x0000000000000000000000000000000000000000',
      block: 0,
      network: 'mainnet',
      timestamp: '2026-01-09T00:00:00.000Z',
      deployer: '0x0000000000000000000000000000000000000000',
    },
    state: {
      status: 'testing',
      version: '1.0.0',
      owner: '0x0000000000000000000000000000000000000000',
      variables: [],
      lastUpdate: '2026-01-09T00:00:00.000Z',
    },
    technical: {
      sourceCode: 'packages/contracts/src/tokens/LukasToken.sol',
      size: 4096,
      gasEstimate: 1200000,
      interfaces: ['IERC20'],
      functions: [
        {
          name: 'transfer',
          signature: 'transfer(address,uint256)',
          visibility: 'public',
        },
        {
          name: 'approve',
          signature: 'approve(address,uint256)',
          visibility: 'public',
        },
        {
          name: 'balanceOf',
          signature: 'balanceOf(address)',
          visibility: 'public',
        },
      ],
      errors: [],
    },
  },
  {
    id: 'stabilizer-vault-mainnet',
    name: 'StabilizerVault',
    category: 'Vault',
    description: 'Manages peg stabilization through minting and buyback mechanisms on Ethereum Mainnet.',
    deployment: {
      address: '0x0000000000000000000000000000000000000000',
      block: 0,
      network: 'mainnet',
      timestamp: '2026-01-09T00:00:00.000Z',
      deployer: '0x0000000000000000000000000000000000000000',
    },
    state: {
      status: 'testing',
      version: '1.0.0',
      owner: '0x0000000000000000000000000000000000000000',
      variables: [],
      lastUpdate: '2026-01-09T00:00:00.000Z',
    },
    technical: {
      sourceCode: 'packages/contracts/src/vault/StabilizerVault.sol',
      size: 5120,
      gasEstimate: 1500000,
      interfaces: ['IStabilizerVault'],
      functions: [
        {
          name: 'mint',
          signature: 'mint(uint256)',
          visibility: 'public',
        },
        {
          name: 'buyback',
          signature: 'buyback(uint256)',
          visibility: 'public',
        },
      ],
      errors: [],
    },
  },
  {
    id: 'lat-am-basket-index-mainnet',
    name: 'LatAmBasketIndex',
    category: 'Oracle',
    description: 'Oracle contract providing fair price for LUKAS token based on basket composition on Ethereum Mainnet.',
    deployment: {
      address: '0x0000000000000000000000000000000000000000',
      block: 0,
      network: 'mainnet',
      timestamp: '2026-01-09T00:00:00.000Z',
      deployer: '0x0000000000000000000000000000000000000000',
    },
    state: {
      status: 'testing',
      version: '1.1.0',
      owner: '0x0000000000000000000000000000000000000000',
      variables: [],
      lastUpdate: '2026-01-09T00:00:00.000Z',
    },
    technical: {
      sourceCode: 'packages/contracts/src/oracle/LatAmBasketIndex.sol',
      size: 4608,
      gasEstimate: 1100000,
      interfaces: ['IOracle'],
      functions: [
        {
          name: 'getLukasFairPriceInUSDC',
          signature: 'getLukasFairPriceInUSDC()',
          visibility: 'public',
        },
        {
          name: 'getBasketComposition',
          signature: 'getBasketComposition()',
          visibility: 'public',
        },
      ],
      errors: [],
    },
  },
  {
    id: 'lukas-hook-mainnet',
    name: 'LukasHook',
    category: 'Hooks',
    description: 'Uniswap V4 hook for peg stabilization integration on Ethereum Mainnet.',
    deployment: {
      address: '0x0000000000000000000000000000000000000000',
      block: 0,
      network: 'mainnet',
      timestamp: '2026-01-09T00:00:00.000Z',
      deployer: '0x0000000000000000000000000000000000000000',
    },
    state: {
      status: 'testing',
      version: '1.0.0-simplified',
      owner: '0x0000000000000000000000000000000000000000',
      variables: [],
      lastUpdate: '2026-01-09T00:00:00.000Z',
    },
    technical: {
      sourceCode: 'packages/contracts/src/hooks/LukasHook.sol',
      size: 3584,
      gasEstimate: 900000,
      interfaces: ['IHook'],
      functions: [
        {
          name: 'beforeSwap',
          signature: 'beforeSwap(address,address,uint256)',
          visibility: 'public',
        },
        {
          name: 'afterSwap',
          signature: 'afterSwap(address,address,uint256)',
          visibility: 'public',
        },
      ],
      errors: [],
    },
  },
  {
    id: 'usdc-mainnet',
    name: 'USDC',
    category: 'Token',
    description: 'Circle USDC stablecoin on Ethereum Mainnet.',
    deployment: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      block: 0,
      network: 'mainnet',
      timestamp: '2026-01-09T00:00:00.000Z',
      deployer: '0x0000000000000000000000000000000000000000',
    },
    state: {
      status: 'active',
      version: 'external',
      owner: '0x0000000000000000000000000000000000000000',
      variables: [],
      lastUpdate: '2026-01-09T00:00:00.000Z',
    },
    technical: {
      sourceCode: 'external',
      size: 0,
      gasEstimate: 0,
      interfaces: ['IERC20'],
      functions: [],
      errors: [],
    },
  },
];

// Supported networks
export const SUPPORTED_NETWORKS = [
  { id: 'mainnet', name: 'Ethereum Mainnet', chainId: 1, icon: 'Ξ' },
  { id: 'amoy', name: 'Polygon Amoy', chainId: 80002, icon: '◆' },
  { id: 'sepolia', name: 'Sepolia Testnet', chainId: 11155111, icon: 'Ξ' },
];

export const contractRegistry: ContractRegistry = {
  version: '1.0.0',
  timestamp: '2026-01-09T11:36:55.877Z',
  contracts: deployedContracts,
};

/**
 * Get contracts for a specific network
 */
export function getContractsByNetwork(network: string): Contract[] {
  return deployedContracts.filter((c) => c.deployment.network === network);
}

/**
 * Get explorer URL for a contract
 */
export function getExplorerUrl(address: string, network: string): string {
  const explorers: Record<string, string> = {
    amoy: 'https://amoy.polygonscan.com/address',
    polygon: 'https://polygonscan.com/address',
    sepolia: 'https://sepolia.etherscan.io/address',
    mainnet: 'https://etherscan.io/address',
  };

  const baseUrl = explorers[network] || explorers.amoy;
  return `${baseUrl}/${address}`;
}

/**
 * Get network display name
 */
export function getNetworkName(network: string): string {
  const names: Record<string, string> = {
    amoy: 'Polygon Amoy Testnet',
    polygon: 'Polygon Mainnet',
    sepolia: 'Sepolia Testnet',
    mainnet: 'Ethereum Mainnet',
  };

  return names[network] || network;
}

/**
 * Get network chain ID
 */
export function getChainId(network: string): number {
  const chainIds: Record<string, number> = {
    amoy: 80002,
    polygon: 137,
    sepolia: 11155111,
    mainnet: 1,
  };

  return chainIds[network] || 80002;
}
