/**
 * Protocol Contracts Page Client Component
 * 
 * Client-side component for the Protocol Contracts page
 */

'use client';

import React, { useState, useEffect } from 'react';
import ProtocolContractsDashboard from '@/components/ProtocolContractsDashboard';
import { ContractRegistry } from '@/types/contracts';
import { Web3SettingsDialog } from '@/components/Web3SettingsDialog';

export default function ContractsPageClient() {
  const [contractsData, setContractsData] = useState<ContractRegistry | undefined>();
  const [web3SettingsOpen, setWeb3SettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load contracts data
  useEffect(() => {
    const loadContractsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to load from public contracts registry
        const response = await fetch('/contracts-registry.json');
        if (!response.ok) {
          throw new Error('Failed to load contracts registry');
        }

        const data: ContractRegistry = await response.json();
        setContractsData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load contracts';
        setError(message);
        console.error('Error loading contracts:', err);

        // Fallback: create empty registry
        setContractsData({
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          contracts: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadContractsData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
          <p className="text-slate-400">Loading contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProtocolContractsDashboard
        contractsData={contractsData}
        onOpenWeb3Settings={() => setWeb3SettingsOpen(true)}
      />

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm max-w-md">
          {error}
        </div>
      )}

      <Web3SettingsDialog
        open={web3SettingsOpen}
        onOpenChange={setWeb3SettingsOpen}
      />
    </>
  );
}
