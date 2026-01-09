/**
 * Dashboard Statistics Component
 * 
 * Displays overview statistics about the protocol contracts
 */

'use client';

import React, { useMemo } from 'react';
import { Contract } from '@/types/contracts';
import { Package, Zap, Shield, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  contracts: Contract[];
}

export default function DashboardStats({ contracts }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter((c) => c.state.status === 'active').length;
    const categories = new Set(contracts.map((c) => c.category)).size;
    const totalGasCost = contracts.reduce((sum, c) => sum + (c.technical.gasEstimate || 0), 0);

    return {
      totalContracts,
      activeContracts,
      categories,
      totalGasCost,
    };
  }, [contracts]);

  const statItems = [
    {
      label: 'Total Contracts',
      value: stats.totalContracts,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      tooltip: 'Total number of deployed contracts',
    },
    {
      label: 'Active Contracts',
      value: stats.activeContracts,
      icon: Zap,
      color: 'from-green-500 to-green-600',
      tooltip: 'Contracts currently active and operational',
    },
    {
      label: 'Categories',
      value: stats.categories,
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      tooltip: 'Number of contract categories',
    },
    {
      label: 'Total Gas Estimate',
      value: `${(stats.totalGasCost / 1000000).toFixed(1)}M`,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      tooltip: 'Combined gas estimate for all contracts',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            title={item.tooltip}
            className="bg-card border border-border rounded-lg p-6 hover:border-border transition-colors cursor-help"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-muted-foreground text-sm font-medium">{item.label}</h3>
              <div className={`bg-gradient-to-br ${item.color} p-2 rounded-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{item.value}</p>
          </div>
        );
      })}
    </div>
    </div>
  );
}
