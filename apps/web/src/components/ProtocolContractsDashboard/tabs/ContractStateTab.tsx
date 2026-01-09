/**
 * Contract State Tab Component
 * 
 * Displays contract state variables and current values
 */

'use client';

import React from 'react';
import { Contract } from '@/types/contracts';

interface ContractStateTabProps {
  contract: Contract;
}

export default function ContractStateTab({ contract }: ContractStateTabProps) {
  return (
    <div className="space-y-6">
      {/* Owner/Admin Info */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Administration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contract.state.owner && (
            <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
              <p className="text-xs text-slate-400 mb-2">Owner</p>
              <p className="text-sm font-mono text-slate-300 break-all">{contract.state.owner}</p>
            </div>
          )}
          {contract.state.admin && (
            <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
              <p className="text-xs text-slate-400 mb-2">Admin</p>
              <p className="text-sm font-mono text-slate-300 break-all">{contract.state.admin}</p>
            </div>
          )}
        </div>
      </div>

      {/* State Variables */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">State Variables</h3>
        {contract.state.variables && contract.state.variables.length > 0 ? (
          <div className="space-y-3">
            {contract.state.variables.map((variable, index) => (
              <div key={index} className="bg-slate-900/50 rounded border border-slate-700 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-mono text-sm text-blue-400">{variable.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{variable.description}</p>
                  </div>
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                    {variable.type}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-mono break-all">{variable.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No state variables documented</p>
        )}
      </div>

      {/* Balance */}
      {contract.state.balance && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Balance</h3>
          <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
            <p className="text-2xl font-bold text-white">{contract.state.balance}</p>
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="text-xs text-slate-400 pt-4 border-t border-slate-700">
        Last updated: {new Date(contract.state.lastUpdate).toLocaleString()}
      </div>
    </div>
  );
}
