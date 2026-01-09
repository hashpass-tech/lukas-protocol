/**
 * Contract Technical Tab Component
 * 
 * Displays technical details about the contract
 */

'use client';

import React from 'react';
import { Contract } from '@/types/contracts';
import { ExternalLink } from 'lucide-react';

interface ContractTechnicalTabProps {
  contract: Contract;
}

export default function ContractTechnicalTab({ contract }: ContractTechnicalTabProps) {
  const { technical } = contract;

  return (
    <div className="space-y-6">
      {/* Source Code */}
      {technical.sourceCode && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Source Code</h3>
          <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
            <p className="text-sm font-mono text-slate-300">{technical.sourceCode}</p>
          </div>
        </div>
      )}

      {/* Contract Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {technical.size && (
            <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
              <p className="text-xs text-slate-400 mb-2">Contract Size</p>
              <p className="text-2xl font-bold text-white">{technical.size.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">bytes</p>
            </div>
          )}
          {technical.gasEstimate && (
            <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
              <p className="text-xs text-slate-400 mb-2">Gas Estimate</p>
              <p className="text-2xl font-bold text-white">
                {(technical.gasEstimate / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-slate-400 mt-1">gas units</p>
            </div>
          )}
        </div>
      </div>

      {/* Interfaces */}
      {technical.interfaces && technical.interfaces.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Interfaces</h3>
          <div className="flex flex-wrap gap-2">
            {technical.interfaces.map((iface, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-sm"
              >
                {iface}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Functions */}
      {technical.functions && technical.functions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Functions</h3>
          <div className="space-y-3">
            {technical.functions.map((func, index) => (
              <div key={index} className="bg-slate-900/50 rounded border border-slate-700 p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-mono text-sm text-green-400">{func.name}</p>
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 capitalize">
                    {func.visibility}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono break-all">{func.signature}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {technical.errors && technical.errors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Custom Errors</h3>
          <div className="space-y-2">
            {technical.errors.map((error, index) => (
              <div key={index} className="bg-slate-900/50 rounded border border-slate-700 p-3">
                <p className="font-mono text-sm text-red-400">{error}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
