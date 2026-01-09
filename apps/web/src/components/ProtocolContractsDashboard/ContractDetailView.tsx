/**
 * Contract Detail View Component
 * 
 * Displays comprehensive information about a single contract
 */

'use client';

import React, { useState } from 'react';
import { Contract } from '@/types/contracts';
import { ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react';
import ContractStateTab from './tabs/ContractStateTab';
import ContractTechnicalTab from './tabs/ContractTechnicalTab';
import ContractInteractionsTab from './tabs/ContractInteractionsTab';
import ContractWeb3Tab from './tabs/ContractWeb3Tab';
import { getExplorerUrl, getNetworkName } from '@/data/deployedContracts';

interface ContractDetailViewProps {
  contract: Contract;
  onBack: () => void;
  onOpenWeb3Settings?: () => void;
}

type TabType = 'state' | 'technical' | 'interactions' | 'web3';

export default function ContractDetailView({ contract, onBack, onOpenWeb3Settings }: ContractDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('state');
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(contract.deployment.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const explorerUrl = getExplorerUrl(contract.deployment.address, contract.deployment.network);
  const networkName = getNetworkName(contract.deployment.network);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'state', label: 'State' },
    { id: 'technical', label: 'Technical' },
    { id: 'interactions', label: 'Interactions' },
    { id: 'web3', label: 'Web3' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Registry
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white dark:text-white mb-2">{contract.name}</h1>
            <p className="text-muted-foreground">{contract.description}</p>
          </div>
          <span className="px-4 py-2 bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30 rounded-lg text-sm font-medium capitalize">
            {contract.state.status}
          </span>
        </div>

        {/* Address Section with Explorer Link */}
        <div className="bg-muted rounded border border-border p-4 mb-6">
          <p className="text-xs text-muted-foreground mb-2">Contract Address ({networkName})</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-mono text-white dark:text-white break-all">{contract.deployment.address}</p>
            <div className="flex gap-2">
              <button
                onClick={handleCopyAddress}
                className="p-2 hover:bg-accent rounded transition-colors flex-shrink-0"
                title="Copy address"
              >
                {copiedAddress ? (
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-accent rounded transition-colors flex-shrink-0"
                title="View on block explorer"
              >
                <ExternalLink className="w-4 h-4 text-primary" />
              </a>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Version</p>
            <p className="text-lg font-semibold text-white dark:text-white">{contract.state.version}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Network</p>
            <p className="text-lg font-semibold text-white dark:text-white capitalize">{networkName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="text-lg font-semibold text-white dark:text-white">{contract.category}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Deployment Block</p>
            <p className="text-lg font-semibold text-white dark:text-white">{contract.deployment.block}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'state' && <ContractStateTab contract={contract} />}
          {activeTab === 'technical' && <ContractTechnicalTab contract={contract} />}
          {activeTab === 'interactions' && <ContractInteractionsTab contract={contract} />}
          {activeTab === 'web3' && <ContractWeb3Tab contract={contract} onOpenWeb3Settings={onOpenWeb3Settings} />}
        </div>
      </div>
    </div>
  );
}
