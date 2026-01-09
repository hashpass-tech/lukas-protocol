/**
 * Contract Documentation Tab Component
 * 
 * Displays documentation links, source code links, and related resources
 */

'use client';

import React from 'react';
import { Contract } from '@/types/contracts';
import DocumentationLinksPanel from '../DocumentationLinksPanel';

interface ContractDocumentationTabProps {
  contract: Contract;
}

export default function ContractDocumentationTab({ contract }: ContractDocumentationTabProps) {
  return <DocumentationLinksPanel contract={contract} />;
}
