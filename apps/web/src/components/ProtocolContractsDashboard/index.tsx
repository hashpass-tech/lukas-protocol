/**
 * Protocol Contracts Dashboard
 * 
 * Main dashboard component that displays all deployed LUKAS protocol contracts
 * with detailed state, technical information, interactions, and version history.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { ContractRegistry } from '@/types/contracts';
import ContractRegistryView from './ContractRegistryView';
import ContractDetailView from './ContractDetailView';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import RoadmapSection from './RoadmapSection';
import ArchitectureVisualization from './ArchitectureVisualization';
import { SUPPORTED_NETWORKS, getContractsByNetwork } from '@/data/deployedContracts';
import { Zap, Network, Target } from 'lucide-react';

interface ProtocolContractsDashboardProps {
  contractsData?: ContractRegistry;
  onOpenWeb3Settings?: () => void;
}

type MainTab = 'contracts' | 'architecture' | 'roadmap';

export default function ProtocolContractsDashboard({
  contractsData,
  onOpenWeb3Settings,
}: ProtocolContractsDashboardProps) {
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'registry' | 'detail'>('registry');
  const [layoutView, setLayoutView] = useState<'grid' | 'list' | 'compact'>('grid');
  const [mainTab, setMainTab] = useState<MainTab>('contracts');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('amoy');

  // Get contracts for selected network
  const networkContracts = useMemo(() => {
    const contracts = getContractsByNetwork(selectedNetwork);
    return contracts.length > 0 ? { contracts } : { contracts: [] };
  }, [selectedNetwork]);

  // Use network-specific contracts or fallback to provided data
  const activeContractsData = networkContracts.contracts.length > 0 ? networkContracts : contractsData;

  // Filter contracts based on search and category
  const filteredContracts = useMemo(() => {
    if (!activeContractsData?.contracts) return [];

    return activeContractsData.contracts.filter((contract) => {
      const matchesSearch =
        contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.deployment.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || contract.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [activeContractsData?.contracts, searchQuery, selectedCategory]);

  const selectedContract = useMemo(
    () => activeContractsData?.contracts.find((c) => c.id === selectedContractId),
    [activeContractsData?.contracts, selectedContractId]
  );

  const handleSelectContract = (contractId: string) => {
    setSelectedContractId(contractId);
    setViewMode('detail');
  };

  const handleBackToRegistry = () => {
    setViewMode('registry');
    setSelectedContractId(null);
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-20 sm:pb-16">
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={
          activeContractsData?.contracts
            ? Array.from(new Set(activeContractsData.contracts.map((c) => c.category)))
            : []
        }
        layoutView={layoutView}
        onLayoutViewChange={setLayoutView}
        showSearch={mainTab === 'contracts' && viewMode === 'registry'}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <DashboardStats contracts={activeContractsData?.contracts || []} />

        {/* Network Switcher */}
        {mainTab === 'contracts' && (
          <div className="mt-6 flex flex-wrap gap-2">
            {SUPPORTED_NETWORKS.map((network) => (
              <button
                key={network.id}
                onClick={() => {
                  setSelectedNetwork(network.id);
                  setSelectedContractId(null);
                  setViewMode('registry');
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedNetwork === network.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-card border border-border text-foreground hover:border-primary'
                }`}
                title={`Switch to ${network.name}`}
              >
                <span className="mr-2">{network.icon}</span>
                {network.name}
              </button>
            ))}
          </div>
        )}

        {/* Main Tabs */}
        <div className="mt-8 border-b border-border">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'contracts', label: 'Contracts', icon: Zap, tooltip: 'View deployed contracts' },
              { id: 'architecture', label: 'Architecture', icon: Network, tooltip: 'Contract dependencies and interactions' },
              { id: 'roadmap', label: 'Roadmap', icon: Target, tooltip: 'Upcoming contracts and features' },
            ].map(({ id, label, icon: Icon, tooltip }) => (
              <button
                key={id}
                onClick={() => {
                  setMainTab(id as MainTab);
                  setViewMode('registry');
                }}
                title={tooltip}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                  mainTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {mainTab === 'contracts' && viewMode === 'registry' ? (
            filteredContracts.length > 0 ? (
              <ContractRegistryView
                contracts={filteredContracts}
                onSelectContract={handleSelectContract}
                isLoading={!activeContractsData}
                layoutView={layoutView}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No contracts deployed on {SUPPORTED_NETWORKS.find(n => n.id === selectedNetwork)?.name}</p>
                <p className="text-sm text-muted-foreground">Contracts are currently only deployed on Polygon Amoy and Sepolia Testnet</p>
              </div>
            )
          ) : mainTab === 'contracts' && selectedContract ? (
            <ContractDetailView
              contract={selectedContract}
              onBack={handleBackToRegistry}
              onOpenWeb3Settings={onOpenWeb3Settings}
            />
          ) : mainTab === 'architecture' ? (
            <ArchitectureVisualization contracts={activeContractsData?.contracts || []} />
          ) : mainTab === 'roadmap' ? (
            <RoadmapSection />
          ) : null}
        </div>
      </div>
    </div>
  );
}
