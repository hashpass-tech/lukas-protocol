"use client";

import { useState, useEffect } from 'react';

interface Alert {
  id: string;
  timestamp: number;
  type: 'security' | 'ens' | 'mempool' | 'system' | 'wallet';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  source: string;
  acknowledged: boolean;
  actionTaken?: string;
  relatedAddress?: string;
  txHash?: string;
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      timestamp: Date.now() - 300000,
      type: 'security',
      severity: 'critical',
      title: 'Compromised Wallet Activity',
      message: 'EIP-7702 delegation detected on lukas-lat.eth wallet',
      source: 'Wallet Monitor',
      acknowledged: false,
      relatedAddress: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9'
    },
    {
      id: '2',
      timestamp: Date.now() - 600000,
      type: 'ens',
      severity: 'warning',
      title: 'ENS Expiration Warning',
      message: 'lukas-lat.eth expires in 365 days',
      source: 'ENS Monitor',
      acknowledged: true,
      actionTaken: 'Auto-renewal configured'
    },
    {
      id: '3',
      timestamp: Date.now() - 900000,
      type: 'mempool',
      severity: 'info',
      title: 'Mempool Scanner Active',
      message: 'Started monitoring mempool for suspicious transactions',
      source: 'Mempool Scanner',
      acknowledged: true
    }
  ]);

  const [filter, setFilter] = useState<'all' | Alert['type']>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | Alert['severity']>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(true);

  useEffect(() => {
    // Simulate new alerts
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAlert: Alert = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: ['security', 'ens', 'mempool', 'system', 'wallet'][Math.floor(Math.random() * 5)] as Alert['type'],
          severity: ['info', 'warning', 'error', 'critical'][Math.floor(Math.random() * 4)] as Alert['severity'],
          title: 'System Check',
          message: 'Routine monitoring check completed',
          source: 'System Monitor',
          acknowledged: false
        };
        
        setAlerts(prev => [newAlert, ...prev].slice(0, 100));
      }
    }, 30000); // New alert every 30 seconds (random)

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-500/20 border-red-500/30';
      case 'error': return 'text-orange-600 dark:text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'info': return 'text-blue-600 dark:text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'security': return '🛡️';
      case 'ens': return '🏷️';
      case 'mempool': return '🔍';
      case 'system': return '⚙️';
      case 'wallet': return '💰';
    }
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diff = now.getTime() - alertTime.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  const acknowledgeAll = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, acknowledged: true })));
  };

  const clearAcknowledged = () => {
    setAlerts(prev => prev.filter(alert => !alert.acknowledged));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter !== 'all' && alert.type !== filter) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (!showAcknowledged && alert.acknowledged) return false;
    return true;
  });

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;
  const criticalCount = alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged).length;

  const truncateAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🚨</span>
            <span className="text-sm text-muted-foreground">Total Alerts</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{alerts.length}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⏰</span>
            <span className="text-sm text-muted-foreground">Unacknowledged</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{unacknowledgedCount}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔴</span>
            <span className="text-sm text-muted-foreground">Critical</span>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalCount}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📊</span>
            <span className="text-sm text-muted-foreground">Last 24h</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {alerts.filter(a => Date.now() - a.timestamp < 86400000).length}
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-foreground">Alert Management</h3>
          <div className="flex gap-2">
            <button
              onClick={acknowledgeAll}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
            >
              Acknowledge All
            </button>
            <button
              onClick={clearAcknowledged}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Clear Acknowledged
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Type Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
            >
              <option value="all">All Types</option>
              <option value="security">Security</option>
              <option value="ens">ENS</option>
              <option value="mempool">Mempool</option>
              <option value="system">System</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Severity Filter</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showAcknowledged}
                onChange={(e) => setShowAcknowledged(e.target.checked)}
                className="rounded"
              />
              <span className="text-foreground">Show acknowledged</span>
            </label>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Alert History</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No alerts match current filters
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 hover:bg-accent/30 transition-colors ${
                    alert.acknowledged ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{getTypeIcon(alert.type)}</span>
                      <span className="text-sm">{getSeverityIcon(alert.severity)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded-full text-xs">
                          {alert.type}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatTime(alert.timestamp)}</span>
                        {alert.acknowledged && (
                          <span className="text-xs text-green-600 dark:text-green-400">✓ Acknowledged</span>
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-foreground mb-1">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Source: {alert.source}</span>
                        {alert.relatedAddress && (
                          <span>Address: {truncateAddress(alert.relatedAddress)}</span>
                        )}
                        {alert.txHash && (
                          <a 
                            href={`https://etherscan.io/tx/${alert.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View TX →
                          </a>
                        )}
                      </div>
                      
                      {alert.actionTaken && (
                        <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded text-xs">
                          <span className="text-green-600 dark:text-green-400">Action taken: {alert.actionTaken}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button className="px-3 py-1 bg-muted/50 rounded text-xs hover:bg-muted transition-colors">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-3">Alerts by Type</h4>
          <div className="space-y-2">
            {(['security', 'ens', 'mempool', 'system', 'wallet'] as const).map(type => {
              const count = alerts.filter(a => a.type === type).length;
              return (
                <div key={type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{getTypeIcon(type)}</span>
                    <span className="capitalize">{type}</span>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-3">Alerts by Severity</h4>
          <div className="space-y-2">
            {(['critical', 'error', 'warning', 'info'] as const).map(severity => {
              const count = alerts.filter(a => a.severity === severity).length;
              return (
                <div key={severity} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{getSeverityIcon(severity)}</span>
                    <span className="capitalize">{severity}</span>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}