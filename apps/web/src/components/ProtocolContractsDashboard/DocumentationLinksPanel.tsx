/**
 * Documentation Links Panel Component
 * 
 * Displays documentation, source code, and related links for contracts
 */

'use client';

import React from 'react';
import { Contract } from '@/types/contracts';
import {
  BookOpen,
  Code,
  ExternalLink,
  Github,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';

interface DocumentationLinksPanelProps {
  contract: Contract;
}

// Documentation links mapping
const DOCUMENTATION_LINKS = {
  StabilizerVault: {
    docs: 'https://docs.lukas.lat/contracts/stabilizer-vault',
    github: 'https://github.com/lukas-protocol/contracts/blob/main/src/StabilizerVault.sol',
  },
  MinimalPoolManager: {
    docs: 'https://docs.lukas.lat/contracts/minimal-pool-manager',
    github: 'https://github.com/lukas-protocol/contracts/blob/main/src/MinimalPoolManager.sol',
  },
  LukasToken: {
    docs: 'https://docs.lukas.lat/contracts/lukas-token',
    github: 'https://github.com/lukas-protocol/contracts/blob/main/src/LukasToken.sol',
  },
  LukasHook: {
    docs: 'https://docs.lukas.lat/contracts/lukas-hook',
    github: 'https://github.com/lukas-protocol/contracts/blob/main/src/LukasHook.sol',
  },
};

interface LinkItem {
  icon: React.ReactNode;
  label: string;
  url: string;
  description: string;
}

export default function DocumentationLinksPanel({ contract }: DocumentationLinksPanelProps) {
  const contractDocs = DOCUMENTATION_LINKS[contract.name as keyof typeof DOCUMENTATION_LINKS];

  const links: LinkItem[] = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Documentation',
      url: contractDocs?.docs || `https://docs.lukas.lat/contracts/${contract.name.toLowerCase()}`,
      description: 'Read the contract documentation and usage guide',
    },
    {
      icon: <Code className="w-5 h-5" />,
      label: 'Source Code',
      url: contractDocs?.github || `https://github.com/lukas-protocol/contracts/blob/main/src/${contract.name}.sol`,
      description: 'View the contract source code on GitHub',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'ABI',
      url: `https://api.etherscan.io/api?module=contract&action=getabi&address=${contract.deployment.address}`,
      description: 'Download the contract ABI for integration',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Documentation Links */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          Documentation & Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-slate-900/50 rounded border border-slate-700 p-4 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                  {link.icon}
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </div>
              <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">
                {link.label}
              </h4>
              <p className="text-xs text-slate-400">{link.description}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Related Documentation */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-purple-400" />
          Related Documentation
        </h3>
        <div className="space-y-3">
          {/* Protocol Overview */}
          <a
            href="https://docs.lukas.lat/protocol/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between bg-slate-900/50 rounded border border-slate-700 p-4 hover:border-purple-500 hover:bg-slate-800/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              <div>
                <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                  Protocol Overview
                </p>
                <p className="text-xs text-slate-400">Learn about the LUKAS protocol architecture</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors flex-shrink-0" />
          </a>

          {/* Contract Interactions */}
          <a
            href="https://docs.lukas.lat/protocol/interactions"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between bg-slate-900/50 rounded border border-slate-700 p-4 hover:border-purple-500 hover:bg-slate-800/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              <div>
                <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                  Contract Interactions
                </p>
                <p className="text-xs text-slate-400">Understand how contracts interact with each other</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors flex-shrink-0" />
          </a>

          {/* Deployment Guide */}
          <a
            href="https://docs.lukas.lat/deployment/guide"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between bg-slate-900/50 rounded border border-slate-700 p-4 hover:border-purple-500 hover:bg-slate-800/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              <div>
                <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                  Deployment Guide
                </p>
                <p className="text-xs text-slate-400">Instructions for deploying contracts</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors flex-shrink-0" />
          </a>

          {/* API Reference */}
          <a
            href="https://docs.lukas.lat/api/reference"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between bg-slate-900/50 rounded border border-slate-700 p-4 hover:border-purple-500 hover:bg-slate-800/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              <div>
                <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                  API Reference
                </p>
                <p className="text-xs text-slate-400">Complete API documentation and examples</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors flex-shrink-0" />
          </a>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Github className="w-5 h-5 text-green-400" />
          Quick Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* GitHub Repository */}
          <a
            href="https://github.com/lukas-protocol/contracts"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-900/50 rounded border border-slate-700 p-3 hover:border-green-500 hover:bg-slate-800/50 transition-all"
          >
            <Github className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white hover:text-green-400 transition-colors">GitHub</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
          </a>

          {/* Main Documentation */}
          <a
            href="https://docs.lukas.lat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-900/50 rounded border border-slate-700 p-3 hover:border-blue-500 hover:bg-slate-800/50 transition-all"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white hover:text-blue-400 transition-colors">Docs</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
          </a>

          {/* Discord Community */}
          <a
            href="https://discord.gg/lukas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-900/50 rounded border border-slate-700 p-3 hover:border-indigo-500 hover:bg-slate-800/50 transition-all"
          >
            <span className="text-sm">💬</span>
            <span className="text-sm text-white hover:text-indigo-400 transition-colors">Discord</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
          </a>

          {/* Support */}
          <a
            href="https://support.lukas.lat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-900/50 rounded border border-slate-700 p-3 hover:border-orange-500 hover:bg-slate-800/50 transition-all"
          >
            <span className="text-sm">❓</span>
            <span className="text-sm text-white hover:text-orange-400 transition-colors">Support</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
          </a>
        </div>
      </div>

      {/* Contract Information */}
      <div className="bg-slate-900/50 rounded border border-slate-700 p-4">
        <h4 className="font-semibold text-white mb-3">Contract Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Contract Name:</span>
            <span className="text-white font-mono">{contract.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Category:</span>
            <span className="text-white">{contract.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Network:</span>
            <span className="text-white capitalize">{contract.deployment.network}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Version:</span>
            <span className="text-white">{contract.state.version}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
