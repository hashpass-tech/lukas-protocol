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
        className="group bg-card border border-border rounded-lg p-4 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {contract.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {contract.category}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColor}`}>
              {contract.state.status}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group bg-card border border-border rounded-lg p-6 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {contract.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 truncate">{contract.category}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap shrink-0 ${statusColor}`}>
          {contract.state.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground/90 mb-4 line-clamp-2">{contract.description}</p>

      {/* Address */}
      <div className="mb-4 p-3 bg-muted rounded border border-border">
        <p className="text-xs text-muted-foreground mb-1">Address</p>
        <p className="text-xs font-mono text-foreground/80 truncate">{contract.deployment.address}</p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div>
          <p className="text-muted-foreground">Version</p>
          <p className="text-foreground font-semibold">{contract.state.version}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Network</p>
          <p className="text-foreground font-semibold capitalize">{contract.deployment.network}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          {contract.technical.gasEstimate && (
            <span>Gas: {(contract.technical.gasEstimate / 1000).toFixed(0)}K</span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}
