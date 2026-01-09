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

  // Ensure dark mode is applied
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, []);

  // Filter contracts based on search and category
  const filteredContracts = useMemo(() => {
    if (!contractsData?.contracts) return [];

    return contractsData.contracts.filter((contract) => {
      const matchesSearch =
        contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.deployment.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || contract.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [contractsData?.contracts, searchQuery, selectedCategory]);

  const selectedContract = useMemo(
    () => contractsData?.contracts.find((c) => c.id === selectedContractId),
    [contractsData?.contracts, selectedContractId]
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
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-16 sm:pt-20 pb-20 sm:pb-16">
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={
          contractsData?.contracts
            ? Array.from(new Set(contractsData.contracts.map((c) => c.category)))
            : []
        }
        layoutView={layoutView}
        onLayoutViewChange={setLayoutView}
        showSearch={mainTab === 'contracts' && viewMode === 'registry'}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <DashboardStats contracts={contractsData?.contracts || []} />

        {/* Main Tabs */}
        <div className="mt-8 border-b border-slate-300 dark:border-slate-700">
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
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
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
            <ContractRegistryView
              contracts={filteredContracts}
              onSelectContract={handleSelectContract}
              isLoading={!contractsData}
              layoutView={layoutView}
            />
          ) : mainTab === 'contracts' && selectedContract ? (
            <ContractDetailView
              contract={selectedContract}
              onBack={handleBackToRegistry}
              onOpenWeb3Settings={onOpenWeb3Settings}
            />
          ) : mainTab === 'architecture' ? (
            <ArchitectureVisualization contracts={contractsData?.contracts || []} />
          ) : mainTab === 'roadmap' ? (
            <RoadmapSection />
          ) : null}
        </div>
      </div>
    </div>
  );
}
