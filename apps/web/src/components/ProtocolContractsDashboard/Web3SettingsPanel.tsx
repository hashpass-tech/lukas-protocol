/**
 * Web3 Settings Panel Component
 * 
 * Displays Web3 connection settings, network configuration, and contract interaction tools
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Contract } from '@/types/contracts';
import {
  Network,
  Globe,
  Zap,
  ExternalLink,
  Copy,
  Check,
  Settings,
  AlertCircle,
} from 'lucide-react';

interface Web3SettingsPanelProps {
  contract: Contract;
  onOpenWeb3Settings?: () => void;
}

// Mock network configuration - in production, this would come from Web3 settings
const NETWORK_CONFIG = {
  mainnet: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: 'ETH',
  },
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: 'ETH',
  },
  amoy: {
    name: 'Polygon Amoy',
    chainId: 80002,
    rpcUrl: 'https://polygon-amoy.g.alchemy.com/v2/',
    explorerUrl: 'https://amoy.polygonscan.com',
    nativeCurrency: 'MATIC',
  },
};

export default function Web3SettingsPanel({
  contract,
  onOpenWeb3Settings,
}: Web3SettingsPanelProps) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedValue(value);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  // Get network config based on contract deployment network
  const networkConfig = useMemo(() => {
    const network = contract.deployment.network.toLowerCase();
    return (
      NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG] ||
      NETWORK_CONFIG.mainnet
    );
  }, [contract.deployment.network]);

  const explorerUrl = `${networkConfig.explorerUrl}/address/${contract.deployment.address}`;

  return (
    <div className="space-y-6">
      {/* Network Configuration */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-400" />
          Network Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Network Name */}
          <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
            <p className="text-xs text-slate-400 mb-2">Network</p>
            <p className="text-lg font-semibold text-white">{networkConfig.name}</p>
            <p className="text-xs text-slate-400 mt-2">Chain ID: {networkConfig.chainId}</p>
          </div>

          {/* Native Currency */}
          <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
            <p className="text-xs text-slate-400 mb-2">Native Currency</p>
            <p className="text-lg font-semibold text-white">{networkConfig.nativeCurrency}</p>
          </div>
        </div>
      </div>

      {/* RPC Endpoint */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          RPC Endpoint
        </h3>
        <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-xs text-slate-400">RPC URL</p>
            <button
              onClick={() => handleCopy(networkConfig.rpcUrl)}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
              title="Copy RPC URL"
            >
              {copiedValue === networkConfig.rpcUrl ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
          <p className="text-sm font-mono text-slate-300 break-all">{networkConfig.rpcUrl}</p>
          <p className="text-xs text-slate-400 mt-3">
            Use this RPC endpoint to connect to the network for contract interactions
          </p>
        </div>
      </div>

      {/* Block Explorer */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-400" />
          Block Explorer
        </h3>
        <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-2">Explorer URL</p>
              <p className="text-sm font-mono text-slate-300 break-all">{networkConfig.explorerUrl}</p>
            </div>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
              title="View on block explorer"
            >
              <ExternalLink className="w-5 h-5 text-blue-400" />
            </a>
          </div>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View Contract on Explorer
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Contract Interaction Tools */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Contract Interaction Tools
        </h3>
        <div className="space-y-3">
          {/* Read Functions */}
          <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-white mb-1">Read Functions</p>
                <p className="text-xs text-slate-400">
                  Query contract state without spending gas
                </p>
              </div>
            </div>
            <a
              href={`${explorerUrl}#readContract`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Open Read Functions
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Write Functions */}
          <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-white mb-1">Write Functions</p>
                <p className="text-xs text-slate-400">
                  Execute contract functions (requires wallet connection)
                </p>
              </div>
            </div>
            <a
              href={`${explorerUrl}#writeContract`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Open Write Functions
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* ABI */}
          <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-white mb-1">Contract ABI</p>
                <p className="text-xs text-slate-400">
                  View the contract's Application Binary Interface
                </p>
              </div>
            </div>
            <a
              href={`${explorerUrl}#code`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View ABI
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Web3 Settings Link */}
      {onOpenWeb3Settings && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-400 font-semibold mb-2">Configure Web3 Settings</p>
              <p className="text-xs text-blue-300 mb-3">
                Manage network configuration, RPC endpoints, and wallet settings
              </p>
              <button
                onClick={onOpenWeb3Settings}
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                <Settings className="w-4 h-4" />
                Open Web3 Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
