/**
 * Dashboard Header Component
 * 
 * Displays the dashboard title, search bar, and category filter
 * Follows the same pattern as Pool page with sticky header and breadcrumb
 */

'use client';

import React from 'react';
import { Search, Filter, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import ViewToggle from './ViewToggle';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: string[];
  layoutView?: 'grid' | 'list' | 'compact';
  onLayoutViewChange?: (view: 'grid' | 'list' | 'compact') => void;
  showSearch?: boolean;
}

export default function DashboardHeader({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  layoutView = 'grid',
  onLayoutViewChange,
  showSearch = true,
}: DashboardHeaderProps) {
  return (
    <>
      {/* Sticky Header with Back Button and Title */}
      <div className="sticky top-14 sm:top-16 z-40 bg-white dark:bg-slate-800 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link
                href="/"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm sm:text-base shrink-0 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white truncate">Protocol Contracts</h1>
            </div>
            {onLayoutViewChange && (
              <ViewToggle currentView={layoutView} onViewChange={onLayoutViewChange} />
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      {showSearch && (
        <div className="sticky top-[120px] sm:top-[136px] z-30 bg-slate-50 dark:bg-slate-800 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contracts by name, address..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  title="Search contracts by name or address"
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2" title="Filter by category">
                <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => onCategoryChange(e.target.value || null)}
                  title="Filter contracts by category"
                  className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
