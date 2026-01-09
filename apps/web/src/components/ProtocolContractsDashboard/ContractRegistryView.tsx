/**
 * Contract Registry View Component
 * 
 * Displays a list of all contracts with filtering and sorting options
 * Supports multiple layout views: grid, list, and compact
 */

'use client';

import React from 'react';
import { Contract } from '@/types/contracts';
import ContractCard from './ContractCard';
import { AlertCircle } from 'lucide-react';

interface ContractRegistryViewProps {
  contracts: Contract[];
  onSelectContract: (contractId: string) => void;
  isLoading?: boolean;
  layoutView?: 'grid' | 'list' | 'compact';
}

export default function ContractRegistryView({
  contracts,
  onSelectContract,
  isLoading,
  layoutView = 'grid',
}: ContractRegistryViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
          <p className="text-slate-400">Loading contracts...</p>
        </div>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No contracts found</p>
        </div>
      </div>
    );
  }

  // Group contracts by category
  const groupedContracts = contracts.reduce(
    (acc, contract) => {
      if (!acc[contract.category]) {
        acc[contract.category] = [];
      }
      acc[contract.category].push(contract);
      return acc;
    },
    {} as Record<string, Contract[]>
  );

  // Determine grid columns based on layout view
  const getGridClass = () => {
    switch (layoutView) {
      case 'list':
        return 'grid-cols-1';
      case 'compact':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 'grid':
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedContracts).map(([category, categoryContracts]) => (
        <div key={category}>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded" />
            {category}
          </h2>
          <div className={`grid ${getGridClass()} gap-4`}>
            {categoryContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onClick={() => onSelectContract(contract.id)}
                compact={layoutView === 'compact'}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
