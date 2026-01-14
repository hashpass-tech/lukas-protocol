"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WalletSecurityDashboard } from '../../../components/WalletSecurityDashboard';
import { CompromisedWalletMonitor } from '../../../components/CompromisedWalletMonitor';
import { ENSProtectionPanel } from '../../../components/ENSProtectionPanel';
import { MempoolScanner } from '../../../components/MempoolScanner';
import { AlertsPanel } from '../../../components/AlertsPanel';
import { AutoResponseSystem } from '../../../components/AutoResponseSystem';

export function WalletTrackerClient() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'compromised' | 'ens' | 'mempool' | 'alerts' | 'response'>('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminToggle, setShowAdminToggle] = useState(false);

  useEffect(() => {
    // Check wallet connection status
    const checkConnection = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        setIsConnected(true);
      }
    };
    
    checkConnection();
  }, []);

  useEffect(() => {
    // Check if user is admin (using environment variables)
    const checkAdminStatus = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            // Admin addresses from environment variables
            const adminAddresses = [
              process.env.NEXT_PUBLIC_ADMIN_RELAYER_ADDRESS,
              process.env.NEXT_PUBLIC_ADMIN_OWNER_ADDRESS,
            ].filter(Boolean); // Remove undefined values
            
            const isAdmin = adminAddresses.some(
              addr => addr && addr.toLowerCase() === accounts[0].toLowerCase()
            );
            setShowAdminToggle(isAdmin);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };

    if (isConnected) {
      checkAdminStatus();
    }
  }, [isConnected]);

  const tabs = [
    { id: 'dashboard', label: 'Security Dashboard', icon: '🛡️', adminOnly: false },
    { id: 'compromised', label: 'Compromised Wallets', icon: '⚠️', adminOnly: true },
    { id: 'ens', label: 'ENS Protection', icon: '🏷️', adminOnly: false },
    { id: 'mempool', label: 'Mempool Scanner', icon: '🔍', adminOnly: true },
    { id: 'alerts', label: 'Alerts & Logs', icon: '🚨', adminOnly: true },
    { id: 'response', label: 'Auto Response', icon: '⚡', adminOnly: true },
  ] as const;

  // Filter tabs based on admin mode
  const visibleTabs = isAdminMode ? tabs : tabs.filter(tab => !tab.adminOnly);

  return (
    <div className="min-h-screen bg-background text-foreground pt-16 sm:pt-20 pb-20 sm:pb-16 transition-colors duration-300">
      {/* Navigation Header - Sticky below main header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-card/95 backdrop-blur-md border-b border-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base shrink-0"
              >
                ← Back
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">🛡️ Wallet Security Tracker</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Admin Mode Toggle */}
              {showAdminToggle && (
                <button
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isAdminMode
                      ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                      : 'bg-muted/50 text-muted-foreground border border-border hover:bg-muted'
                  }`}
                >
                  <span>{isAdminMode ? '👨‍💼' : '👤'}</span>
                  <span className="hidden sm:inline">{isAdminMode ? 'Admin Mode' : 'Public View'}</span>
                </button>
              )}
              
              {/* Connection Status */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isConnected 
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                  : 'bg-red-500/20 text-red-600 dark:text-red-400'
              }`}>
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs - Fixed, no horizontal scroll */}
      <div className="sticky top-[120px] sm:top-[136px] z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-start overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.adminOnly && isAdminMode && (
                    <span className="text-[10px] px-1 py-0.5 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded">
                      ADMIN
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        {activeTab === 'dashboard' && <WalletSecurityDashboard isAdminMode={isAdminMode} />}
        {activeTab === 'compromised' && isAdminMode && <CompromisedWalletMonitor />}
        {activeTab === 'ens' && <ENSProtectionPanel isAdminMode={isAdminMode} />}
        {activeTab === 'mempool' && isAdminMode && <MempoolScanner />}
        {activeTab === 'alerts' && isAdminMode && <AlertsPanel />}
        {activeTab === 'response' && isAdminMode && <AutoResponseSystem />}
      </div>
    </div>
  );
}