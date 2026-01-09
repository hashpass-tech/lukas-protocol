/**
 * Roadmap Section Component
 * 
 * Displays upcoming and planned contracts
 */

'use client';

import React from 'react';
import { Zap, Clock, Target } from 'lucide-react';

interface RoadmapItem {
  name: string;
  category: string;
  description: string;
  timeline: string;
  status: 'planned' | 'in-development' | 'testing';
}

const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    name: 'FHENIX Integration',
    category: 'FHENIX',
    description: 'Encrypted contract state management with FHENIX protocol',
    timeline: 'Q1 2026',
    status: 'in-development',
  },
  {
    name: 'Advanced Oracle',
    category: 'Oracle',
    description: 'Multi-source price oracle with fallback mechanisms',
    timeline: 'Q2 2026',
    status: 'planned',
  },
  {
    name: 'Governance Token',
    category: 'Governance',
    description: 'DAO governance and voting mechanisms',
    timeline: 'Q2 2026',
    status: 'planned',
  },
  {
    name: 'Cross-Chain Bridge',
    category: 'Bridge',
    description: 'Multi-chain asset bridging and liquidity',
    timeline: 'Q3 2026',
    status: 'planned',
  },
];

const statusConfig = {
  'in-development': {
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/20 dark:bg-yellow-500/20',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    label: 'In Development',
  },
  testing: {
    icon: Clock,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/20 dark:bg-blue-500/20',
    textColor: 'text-blue-700 dark:text-blue-400',
    label: 'Testing',
  },
  planned: {
    icon: Target,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/20 dark:bg-purple-500/20',
    textColor: 'text-purple-700 dark:text-purple-400',
    label: 'Planned',
  },
};

export default function RoadmapSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded" />
          Roadmap
        </h2>
        <p className="text-muted-foreground text-sm" title="View upcoming contracts and features">
          Upcoming contracts and features coming to the LUKAS protocol
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROADMAP_ITEMS.map((item) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;

          return (
            <div
              key={item.name}
              title={`${item.name} - ${config.label} - ${item.timeline}`}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all cursor-help"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.category}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${config.bgColor}`} title={config.label}>
                  <Icon className={`w-5 h-5 ${config.textColor}`} />
                </div>
              </div>

              <p className="text-sm text-foreground/80 mb-4">
                {item.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`} title={config.label}>
                  {config.label}
                </span>
                <span className="text-xs text-muted-foreground font-medium" title="Expected timeline">
                  {item.timeline}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
