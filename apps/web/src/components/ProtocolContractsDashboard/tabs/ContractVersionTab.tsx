/**
 * Contract Version Tab Component
 * 
 * Displays version history and changelog
 */

'use client';

import React from 'react';
import { Contract } from '@/types/contracts';
import { AlertCircle } from 'lucide-react';

interface ContractVersionTabProps {
  contract: Contract;
}

export default function ContractVersionTab({ contract }: ContractVersionTabProps) {
  const { versions } = contract;

  if (!versions || versions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No version history available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Timeline */}
        <div className="space-y-6">
          {versions.map((version, index) => (
            <div key={index} className="relative pl-8">
              {/* Timeline dot */}
              <div className="absolute left-0 top-2 w-4 h-4 bg-blue-500 rounded-full border-4 border-slate-800" />

              {/* Timeline line */}
              {index < versions.length - 1 && (
                <div className="absolute left-1.5 top-6 w-0.5 h-12 bg-slate-700" />
              )}

              {/* Version card */}
              <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg font-semibold text-white">v{version.version}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(version.releaseDate).toLocaleDateString()}
                    </p>
                  </div>
                  {version.status && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        version.status === 'current'
                          ? 'bg-green-500/20 text-green-400'
                          : version.status === 'deprecated'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {version.status}
                    </span>
                  )}
                </div>

                {version.description && (
                  <p className="text-sm text-slate-300 mb-3">{version.description}</p>
                )}

                {/* Changes */}
                {version.changes && version.changes.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-2">Changes:</p>
                    <ul className="space-y-1">
                      {version.changes.map((change, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Breaking Changes */}
                {version.breakingChanges && version.breakingChanges.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                    <p className="text-xs text-red-400 font-semibold mb-2">Breaking Changes:</p>
                    <ul className="space-y-1">
                      {version.breakingChanges.map((change, i) => (
                        <li key={i} className="text-xs text-red-300 flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">⚠</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Deployment Info */}
                {version.deploymentBlock && (
                  <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
                    <p>
                      Deployed at block <span className="text-slate-300">{version.deploymentBlock}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
