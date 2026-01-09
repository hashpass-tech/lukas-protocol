/**
 * Contract Web3 Tab Component
 * 
 * Displays Web3 settings, network configuration, and contract interaction tools
 */

'use client';

import React from 'react';
import { Contract } from '@/types/contracts';
import Web3SettingsPanel from '../Web3SettingsPanel';

interface ContractWeb3TabProps {
  contract: Contract;
  onOpenWeb3Settings?: () => void;
}

export default function ContractWeb3Tab({
  contract,
  onOpenWeb3Settings,
}: ContractWeb3TabProps) {
  return (
    <Web3SettingsPanel
      contract={contract}
      onOpenWeb3Settings={onOpenWeb3Settings}
    />
  );
}
