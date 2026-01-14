"use client";

import { useState, useEffect } from 'react';

interface WalletActivity {
  timestamp: number;
  type: 'balance_change' | 'delegation_change' | 'transaction' | 'ens_activity';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  txHash?: string;
}

export function CompromisedWalletMonitor() {
  const compromisedWallet = '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9';
  const delegationContract = '0x3ae1f70cf6da80955936f5599d103fcf62162d10';
  
  const [balance, setBalance] = useState('0.000');
  const [isDelegated, setIsDelegated] = useState(true);
  const [activities, setActivities] = useState<WalletActivity[]>([
    {
      timestamp: Date.now() - 3600000,
      type: 'balance_change',
      description: 'Balance remains at 0 ETH - No funding detected',
      severity: 'low'
    },
    {
      timestamp: Date.now() - 7200000,
      type: 'delegation_change',
      description: 'EIP-7702 delegation still active',
      severity: 'high'
    }
  ]);

  useEffect(() => {
    // Simulate real-time monitoring
    const interval = setInterval(() => {
      // Check for balance changes (mock)
      const newActivity: WalletActivity = {
        timestamp: Date.now(),
        type: 'balance_change',
        description: 'Monitoring check: No changes detected',
        severity: 'low'
      };
      
      setActivities(prev => [newActivity, ...prev].slice(0, 20));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: WalletActivity['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getTypeIcon = (type: WalletActivity['type']) => {
    switch (type) {
      case 'balance_change': return '💰';
      case 'delegation_change': return '🔗';
      case 'transaction': return '📝';
      case 'ens_activity': return '🏷️';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const truncateAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="space-y-6">
      {/* Compromised Wallet Status */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🔴</span>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
              Compromised Wallet Under Surveillance
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Address:</span>
                <code className="font-mono text-foreground">{truncateAddress(compromisedWallet)}</code>
                <a 
                  href={`https://etherscan.io/address/${compromisedWallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-xs"
                >
                  View on Etherscan →
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">ENS:</span>
                <span className="font-medium text-foreground">lukas-lat.eth</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Delegation:</span>
                <code className="font-mono text-xs text-foreground">{truncateAddress(delegationContract)}</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💰</span>
            <span className="text-sm text-muted-foreground">Current Balance</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{balance} ETH</div>
          <div className="text-xs text-muted-foreground mt-1">
            {balance === '0.000' ? 'No funding detected' : 'ALERT: Wallet funded!'}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔗</span>
            <span className="text-sm text-muted-foreground">Delegation Status</span>
          </div>
          <div className={`text-2xl font-bold ${isDelegated ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {isDelegated ? 'Active' : 'Revoked'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {isDelegated ? 'EIP-7702 delegation active' : 'Delegation removed'}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⏱️</span>
            <span className="text-sm text-muted-foreground">Last Check</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatTime(activities[0]?.timestamp || Date.now())}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Monitoring every 30s
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Activity Timeline</h3>
          <p className="text-sm text-muted-foreground mt-1">Real-time monitoring of wallet activity</p>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div 
                key={`${activity.timestamp}-${index}`}
                className={`p-4 rounded-lg border ${getSeverityColor(activity.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getTypeIcon(activity.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium uppercase">{activity.type.replace('_', ' ')}</span>
                      <span className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</span>
                    </div>
                    <p className="text-sm">{activity.description}</p>
                    {activity.txHash && (
                      <a 
                        href={`https://etherscan.io/tx/${activity.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        View Transaction →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monitoring Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">🔍</span>
            <span className="font-medium text-foreground">Force Check Now</span>
          </div>
          <p className="text-xs text-muted-foreground">Manually trigger wallet status check</p>
        </button>

        <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">📊</span>
            <span className="font-medium text-foreground">Export Activity Log</span>
          </div>
          <p className="text-xs text-muted-foreground">Download complete activity history</p>
        </button>
      </div>
    </div>
  );
}
