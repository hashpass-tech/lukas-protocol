/**
 * Contract Interactions Tab Component
 * 
 * Displays contract dependencies and interactions
 */

'use client';

import React from 'react';
import { Contract } from '@/types/contracts';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface ContractInteractionsTabProps {
  contract: Contract;
}

export default function ContractInteractionsTab({ contract }: ContractInteractionsTabProps) {
  const { interactions } = contract;

  if (!interactions) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No interaction data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dependencies */}
      {interactions.dependencies && interactions.dependencies.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Dependencies</h3>
          <p className="text-sm text-slate-400 mb-4">
            Contracts that this contract calls or depends on
          </p>
          <div className="space-y-3">
            {interactions.dependencies.map((dep, index) => (
              <div key={index} className="bg-slate-900/50 rounded border border-slate-700 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <p className="font-semibold text-white">{dep.contractName}</p>
                </div>
                {dep.functions && dep.functions.length > 0 && (
                  <div className="ml-5 text-xs text-slate-400">
                    <p className="mb-2">Functions called:</p>
                    <div className="flex flex-wrap gap-2">
                      {dep.functions.map((func, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-slate-800 rounded text-slate-300 font-mono"
                        >
                          {func}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependents */}
      {interactions.dependents && interactions.dependents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Dependents</h3>
          <p className="text-sm text-slate-400 mb-4">
            Contracts that call or depend on this contract
          </p>
          <div className="space-y-3">
            {interactions.dependents.map((dep, index) => (
              <div key={index} className="bg-slate-900/50 rounded border border-slate-700 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <p className="font-semibold text-white">{dep.contractName}</p>
                </div>
                {dep.functions && dep.functions.length > 0 && (
                  <div className="ml-5 text-xs text-slate-400">
                    <p className="mb-2">Functions that call this:</p>
                    <div className="flex flex-wrap gap-2">
                      {dep.functions.map((func, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-slate-800 rounded text-slate-300 font-mono"
                        >
                          {func}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical Interactions */}
      {interactions.critical && interactions.critical.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            Critical Interactions
          </h3>
          <div className="space-y-3">
            {interactions.critical.map((critical, index) => (
              <div key={index} className="bg-orange-500/10 rounded border border-orange-500/30 p-4">
                <p className="text-sm text-orange-400 font-semibold mb-2">{critical.description}</p>
                <p className="text-xs text-slate-400">{critical.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!interactions.dependencies &&
        !interactions.dependents &&
        !interactions.critical && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No interactions documented</p>
            </div>
          </div>
        )}
    </div>
  );
}
