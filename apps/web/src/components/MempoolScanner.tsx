"use client";

import { useState, useEffect } from 'react';

interface MempoolTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  data: string;
  timestamp: number;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  description: string;
  isENSRelated: boolean;
}

export function MempoolScanner() {
  const [isScanning, setIsScanning] = useState(true);
  const [scanInterval, setScanInterval] = useState(5); // seconds
  const [transactions, setTransactions] = useState<MempoolTransaction[]>([
    {
      hash: '0x' + Math.random().toString(16).slice(2, 66),
      from: '0x742d35Cc6634C0532925a3b8D4C9db96C4C4C4C4',
      to: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
      value: '0.001',
      gasPrice: '25.5',
      gasLimit: '21000',
      data: '0x',
      timestamp: Date.now() - 30000,
      threatLevel: 'medium',
      description: 'ETH transfer to compromised wallet',
      isENSRelated: false
    }
  ]);

  const [filters, setFilters] = useState({
    ensOnly: false,
    minThreatLevel: 'low' as MempoolTransaction['threatLevel'],
    targetAddresses: ['0x4F36DC378d1C78181B3F544a81E8951fb4838ad9']
  });

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      // Simulate new mempool transactions
      const mockTx: MempoolTransaction = {
        hash: '0x' + Math.random().toString(16).slice(2, 66),
        from: '0x' + Math.random().toString(16).slice(2, 42),
        to: Math.random() > 0.7 ? '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9' : '0x' + Math.random().toString(16).slice(2, 42),
        value: (Math.random() * 0.1).toFixed(6),
        gasPrice: (20 + Math.random() * 50).toFixed(1),
        gasLimit: '21000',
        data: '0x',
        timestamp: Date.now(),
        threatLevel: Math.random() > 0.8 ? 'high' : Math.random() > 0.6 ? 'medium' : 'low',
        description: 'Regular transaction',
        isENSRelated: Math.random() > 0.9
      };

      // Add threat descriptions
      if (mockTx.to === '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9') {
        mockTx.description = 'Transaction to compromised wallet';
        mockTx.threatLevel = 'high';
      } else if (mockTx.isENSRelated) {
        mockTx.description = 'ENS-related transaction detected';
        mockTx.threatLevel = 'critical';
      }

      setTransactions(prev => [mockTx, ...prev].slice(0, 50));
    }, scanInterval * 1000);

    return () => clearInterval(interval);
  }, [isScanning, scanInterval]);

  const getThreatColor = (level: MempoolTransaction['threatLevel']) => {
    switch (level) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'none': return 'text-gray-600 dark:text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getThreatIcon = (level: MempoolTransaction['threatLevel']) => {
    switch (level) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      case 'none': return '⚪';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes > 0) return `${minutes}m ago`;
    if (seconds > 0) return `${seconds}s ago`;
    return 'Just now';
  };

  const truncateAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const truncateHash = (hash: string) => 
    `${hash.slice(0, 10)}...${hash.slice(-8)}`;

  const filteredTransactions = transactions.filter(tx => {
    if (filters.ensOnly && !tx.isENSRelated) return false;
    
    const threatLevels = ['none', 'low', 'medium', 'high', 'critical'];
    const minIndex = threatLevels.indexOf(filters.minThreatLevel);
    const txIndex = threatLevels.indexOf(tx.threatLevel);
    
    return txIndex >= minIndex;
  });

  const threatCounts = transactions.reduce((acc, tx) => {
    acc[tx.threatLevel] = (acc[tx.threatLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Scanner Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <h2 className="text-xl font-semibold text-foreground">Mempool Scanner</h2>
          </div>
          <button
            onClick={() => setIsScanning(!isScanning)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              isScanning 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{transactions.length}</div>
            <div className="text-xs text-muted-foreground">Total Scanned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{threatCounts.critical || 0}</div>
            <div className="text-xs text-muted-foreground">Critical Threats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{threatCounts.high || 0}</div>
            <div className="text-xs text-muted-foreground">High Threats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{scanInterval}s</div>
            <div className="text-xs text-muted-foreground">Scan Interval</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Filters & Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Scan Interval</label>
            <select
              value={scanInterval}
              onChange={(e) => setScanInterval(Number(e.target.value))}
              className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
            >
              <option value={1}>1 second</option>
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Min Threat Level</label>
            <select
              value={filters.minThreatLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, minThreatLevel: e.target.value as any }))}
              className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
            >
              <option value="none">All</option>
              <option value="low">Low+</option>
              <option value="medium">Medium+</option>
              <option value="high">High+</option>
              <option value="critical">Critical Only</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.ensOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, ensOnly: e.target.checked }))}
                className="rounded"
              />
              <span className="text-foreground">ENS-related only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Live Transactions</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No transactions match current filters
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTransactions.map((tx) => (
                <div key={tx.hash} className="p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getThreatIcon(tx.threatLevel)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThreatColor(tx.threatLevel)}`}>
                          {tx.threatLevel.toUpperCase()}
                        </span>
                        {tx.isENSRelated && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                            ENS
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{formatTime(tx.timestamp)}</span>
                      </div>
                      
                      <p className="text-sm text-foreground mb-2">{tx.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Hash:</span>
                          <code className="font-mono">{truncateHash(tx.hash)}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Value:</span>
                          <span className="font-mono">{tx.value} ETH</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">From:</span>
                          <code className="font-mono">{truncateAddress(tx.from)}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">To:</span>
                          <code className="font-mono">{truncateAddress(tx.to)}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Gas:</span>
                          <span className="font-mono">{tx.gasPrice} gwei</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View →
                      </a>
                      {tx.threatLevel === 'critical' && (
                        <button className="text-xs text-red-600 dark:text-red-400 hover:underline">
                          Block
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">🎯</span>
            <span className="font-medium text-foreground">Add Watch Address</span>
          </div>
          <p className="text-xs text-muted-foreground">Monitor specific wallet addresses</p>
        </button>

        <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">⚡</span>
            <span className="font-medium text-foreground">Test Alert System</span>
          </div>
          <p className="text-xs text-muted-foreground">Simulate threat detection</p>
        </button>

        <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">📊</span>
            <span className="font-medium text-foreground">Export Data</span>
          </div>
          <p className="text-xs text-muted-foreground">Download transaction logs</p>
        </button>
      </div>
    </div>
  );
}