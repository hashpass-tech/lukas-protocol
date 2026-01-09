/**
 * Protocol Contracts Page
 * 
 * Main page for viewing all protocol contracts
 */

import React from 'react';
import ContractsPageClient from './ContractsPageClient';

export function generateStaticParams() {
  return ["en", "es", "pt", "cl"].map((lang) => ({ lang }));
}

export default function ContractsPage() {
  return <ContractsPageClient />;
}
