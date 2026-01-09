/**
 * Contract Card Component
 * 
 * Displays a summary card for a single contract
 */

'use client';

import React from 'react';
import { Contract } from '@/types/contracts';
import { ChevronRight } from 'lucide-react';

interface ContractCardProps {
  contract: Contract;
  onClick: () => void;
  compact?: boolean;
}

export default function ContractCard({ contract, onClick, compact = false }: ContractCardProps) {
  const statusColors = {
    active: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 dark:border-green-500/30',
    deprecated: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30 dark:border-red-500/30',
    testing: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30 dark:border-yellow-500/30',
  };

  const statusColor = statusColors[contract.state.status as keyof typeof statusColors] || statusColors.active;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="group bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-blue-500/20 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {contract.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {contract.category}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColor}`}>
              {contract.state.status}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-blue-500/20 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {contract.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{contract.category}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
          {contract.state.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 line-clamp-2">{contract.description}</p>

      {/* Address */}
      <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-900/50 rounded border border-slate-300 dark:border-slate-700">
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Address</p>
        <p className="text-xs font-mono text-slate-800 dark:text-slate-300 truncate">{contract.deployment.address}</p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div>
          <p className="text-slate-600 dark:text-slate-400">Version</p>
          <p className="text-slate-900 dark:text-white font-semibold">{contract.state.version}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Network</p>
          <p className="text-slate-900 dark:text-white font-semibold capitalize">{contract.deployment.network}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-300 dark:border-slate-700">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {contract.technical.gasEstimate && (
            <span>Gas: {(contract.technical.gasEstimate / 1000).toFixed(0)}K</span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}
