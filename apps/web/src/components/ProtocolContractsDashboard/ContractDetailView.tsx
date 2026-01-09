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
import ContractVersionTab from './tabs/ContractVersionTab';
import ContractWeb3Tab from './tabs/ContractWeb3Tab';
import ContractDocumentationTab from './tabs/ContractDocumentationTab';

interface ContractDetailViewProps {
  contract: Contract;
  onBack: () => void;
  onOpenWeb3Settings?: () => void;
}

type TabType = 'state' | 'technical' | 'interactions' | 'version' | 'web3' | 'documentation';

export default function ContractDetailView({ contract, onBack, onOpenWeb3Settings }: ContractDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('state');
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(contract.deployment.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'state', label: 'State' },
    { id: 'technical', label: 'Technical' },
    { id: 'interactions', label: 'Interactions' },
    { id: 'version', label: 'Version' },
    { id: 'web3', label: 'Web3' },
    { id: 'documentation', label: 'Documentation' },
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
            <h1 className="text-3xl font-bold text-white mb-2">{contract.name}</h1>
            <p className="text-muted-foreground">{contract.description}</p>
          </div>
          <span className="px-4 py-2 bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30 rounded-lg text-sm font-medium capitalize">
            {contract.state.status}
          </span>
        </div>

        {/* Address Section */}
        <div className="bg-muted rounded border border-border p-4">
          <p className="text-xs text-muted-foreground mb-2">Contract Address</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono text-white">{contract.deployment.address}</p>
            <button
              onClick={handleCopyAddress}
              className="p-2 hover:bg-accent rounded transition-colors"
              title="Copy address"
            >
              {copiedAddress ? (
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-xs text-muted-foreground">Version</p>
            <p className="text-lg font-semibold text-white">{contract.state.version}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Network</p>
            <p className="text-lg font-semibold text-white capitalize">{contract.deployment.network}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="text-lg font-semibold text-white">{contract.category}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Deployment Block</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{contract.deployment.block}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
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
          {activeTab === 'version' && <ContractVersionTab contract={contract} />}
          {activeTab === 'web3' && <ContractWeb3Tab contract={contract} onOpenWeb3Settings={onOpenWeb3Settings} />}
          {activeTab === 'documentation' && <ContractDocumentationTab contract={contract} />}
        </div>
      </div>
    </div>
  );
}
