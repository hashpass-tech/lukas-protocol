/**
 * View Toggle Component
 * 
 * Allows users to switch between different layout views
 */

'use client';

import React from 'react';
import { LayoutGrid, List, Columns3 } from 'lucide-react';

export type ViewMode = 'grid' | 'list' | 'compact';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  const views: { id: ViewMode; label: string; icon: React.ReactNode; tooltip: string }[] = [
    { id: 'grid', label: 'Grid', icon: <LayoutGrid className="w-4 h-4" />, tooltip: 'Grid view - 3 columns' },
    { id: 'list', label: 'List', icon: <List className="w-4 h-4" />, tooltip: 'List view - full width' },
    { id: 'compact', label: 'Compact', icon: <Columns3 className="w-4 h-4" />, tooltip: 'Compact view - 4 columns' },
  ];

  return (
    <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700/50 rounded-lg p-1">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          title={view.tooltip}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all ${
            currentView === view.id
              ? 'bg-blue-500 text-white dark:bg-blue-500 dark:text-white'
              : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          {view.icon}
          <span className="hidden sm:inline">{view.label}</span>
        </button>
      ))}
    </div>
  );
}
