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
      <div className="sticky top-14 sm:top-16 z-40 bg-card backdrop-blur-md border-b border-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base shrink-0 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Protocol Contracts</h1>
            </div>
            {onLayoutViewChange && (
              <ViewToggle currentView={layoutView} onViewChange={onLayoutViewChange} />
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      {showSearch && (
        <div className="sticky top-[120px] sm:top-[136px] z-30 bg-card backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search contracts by name, address..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  title="Search contracts by name or address"
                  className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2" title="Filter by category">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => onCategoryChange(e.target.value || null)}
                  title="Filter contracts by category"
                  className="px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
