"use client";

import { useState, useEffect } from 'react';

interface ResponseRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
  priority: number;
  lastTriggered?: number;
  triggerCount: number;
}

interface ResponseLog {
  id: string;
  timestamp: number;
  ruleId: string;
  ruleName: string;
  trigger: string;
  action: string;
  status: 'success' | 'failed' | 'pending';
  details: string;
  txHash?: string;
}

export function AutoResponseSystem() {
  const [isSystemEnabled, setIsSystemEnabled] = useState(true);
  const [responseTime, setResponseTime] = useState(3.2); // seconds
  const [gasMultiplier, setGasMultiplier] = useState(1.5);
  
  const [rules, setRules] = useState<ResponseRule[]>([
    {
      id: '1',
      name: 'ENS Transfer Protection',
      trigger: 'ENS transfer detected in mempool',
      condition: 'Target: lukas-lat.eth',
      action: 'Front-run with higher gas price',
      enabled: true,
      priority: 1,
      triggerCount: 0
    },
    {
      id: '2',
      name: 'Wallet Funding Alert',
      trigger: 'ETH received by compromised wallet',
      condition: 'Amount > 0.001 ETH',
      action: 'Send immediate alert + Monitor for 1 hour',
      enabled: true,
      priority: 2,
      triggerCount: 0
    },
    {
      id: '3',
      name: 'Delegation Removal',
      trigger: 'EIP-7702 delegation revoked',
      condition: 'Compromised wallet',
      action: 'Attempt immediate ENS recovery',
      enabled: true,
      priority: 1,
      triggerCount: 0
    },
    {
      id: '4',
      name: 'High-Value Transaction',
      trigger: 'Transaction > 1 ETH to monitored address',
      condition: 'Any monitored wallet',
      action: 'Block transaction + Send critical alert',
      enabled: false,
      priority: 3,
      triggerCount: 0
    }
  ]);

  const [logs, setLogs] = useState<ResponseLog[]>([
    {
      id: '1',
      timestamp: Date.now() - 1800000,
      ruleId: '2',
      ruleName: 'Wallet Funding Alert',
      trigger: 'ETH received by compromised wallet',
      action: 'Alert sent + Monitoring activated',
      status: 'success',
      details: 'Detected 0.001 ETH transfer, monitoring for 1 hour'
    }
  ]);

  useEffect(() => {
    // Simulate response system activity
    const interval = setInterval(() => {
      if (Math.random() > 0.8 && isSystemEnabled) {
        const activeRules = rules.filter(r => r.enabled);
        if (activeRules.length > 0) {
          const rule = activeRules[Math.floor(Math.random() * activeRules.length)];
          
          const newLog: ResponseLog = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            ruleId: rule.id,
            ruleName: rule.name,
            trigger: rule.trigger,
            action: rule.action,
            status: Math.random() > 0.1 ? 'success' : 'failed',
            details: `Automated response executed for ${rule.name}`
          };
          
          setLogs(prev => [newLog, ...prev].slice(0, 50));
          setRules(prev => prev.map(r => 
            r.id === rule.id 
              ? { ...r, triggerCount: r.triggerCount + 1, lastTriggered: Date.now() }
              : r
          ));
        }
      }
    }, 45000); // Check every 45 seconds

    return () => clearInterval(interval);
  }, [isSystemEnabled, rules]);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const getStatusColor = (status: ResponseLog['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 dark:text-green-400 bg-green-500/20';
      case 'failed': return 'text-red-600 dark:text-red-400 bg-red-500/20';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/20';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600 dark:text-red-400';
      case 2: return 'text-orange-600 dark:text-orange-400';
      case 3: return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-blue-600 dark:text-blue-400';
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

  const enabledRules = rules.filter(r => r.enabled).length;
  const totalTriggers = rules.reduce((sum, r) => sum + r.triggerCount, 0);
  const successRate = logs.length > 0 
    ? (logs.filter(l => l.status === 'success').length / logs.length * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* System Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${isSystemEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <h2 className="text-xl font-semibold text-foreground">Auto Response System</h2>
          </div>
          <button
            onClick={() => setIsSystemEnabled(!isSystemEnabled)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              isSystemEnabled 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isSystemEnabled ? 'Disable System' : 'Enable System'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{enabledRules}</div>
            <div className="text-xs text-muted-foreground">Active Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{responseTime}s</div>
            <div className="text-xs text-muted-foreground">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{successRate}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{totalTriggers}</div>
            <div className="text-xs text-muted-foreground">Total Triggers</div>
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">System Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Gas Price Multiplier
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1.1"
                max="3.0"
                step="0.1"
                value={gasMultiplier}
                onChange={(e) => setGasMultiplier(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-mono w-12">{gasMultiplier}x</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Multiplier for front-running gas prices
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Max Response Time
            </label>
            <select
              value={responseTime}
              onChange={(e) => setResponseTime(Number(e.target.value))}
              className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
            >
              <option value={1}>1 second</option>
              <option value={3}>3 seconds</option>
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum time to execute response
            </p>
          </div>
        </div>
      </div>

      {/* Response Rules */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Response Rules</h3>
          <p className="text-sm text-muted-foreground mt-1">Automated response configurations</p>
        </div>

        <div className="divide-y divide-border">
          {rules.map((rule) => (
            <div key={rule.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-foreground">{rule.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rule.priority)}`}>
                      Priority {rule.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.enabled 
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                        : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                    }`}>
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-0 w-16">Trigger:</span>
                      <span className="text-foreground">{rule.trigger}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-0 w-16">Condition:</span>
                      <span className="text-foreground">{rule.condition}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-0 w-16">Action:</span>
                      <span className="text-foreground">{rule.action}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>Triggered: {rule.triggerCount} times</span>
                    {rule.lastTriggered && (
                      <span>Last: {formatTime(rule.lastTriggered)}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      rule.enabled
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button className="px-3 py-1 bg-muted/50 rounded text-xs hover:bg-muted transition-colors">
                    Edit
                  </button>
                  <button className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors">
                    Test
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Response Logs */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Response Logs</h3>
          <p className="text-sm text-muted-foreground mt-1">Recent automated responses</p>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No responses logged yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground text-sm">{log.ruleName}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(log.timestamp)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{log.trigger}</p>
                      <p className="text-xs text-foreground">{log.details}</p>
                      {log.txHash && (
                        <a 
                          href={`https://etherscan.io/tx/${log.txHash}`}
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
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">➕</span>
            <span className="font-medium text-foreground">Add New Rule</span>
          </div>
          <p className="text-xs text-muted-foreground">Create custom response rule</p>
        </button>

        <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">🧪</span>
            <span className="font-medium text-foreground">Test All Rules</span>
          </div>
          <p className="text-xs text-muted-foreground">Simulate response scenarios</p>
        </button>

        <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">📊</span>
            <span className="font-medium text-foreground">Export Logs</span>
          </div>
          <p className="text-xs text-muted-foreground">Download response history</p>
        </button>
      </div>
    </div>
  );
}