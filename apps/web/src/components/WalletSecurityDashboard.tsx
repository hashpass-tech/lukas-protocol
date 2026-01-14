"use client";

import { useState, useEffect } from 'react';
import { useLukasSDK } from '@/app/providers/lukas-sdk-provider';

interface WalletSecurityDashboardProps {
  isAdminMode?: boolean;
}

interface WalletStatus {
  address: string;
  label: string;
  status: 'secure' | 'warning' | 'compromised' | 'monitoring';
  lastActivity: number;
  balance: string;
  riskScore: number;
  alerts: number;
}

interface SecurityMetrics {
  totalWallets: number;
  secureWallets: number;
  compromisedWallets: number;
  activeAlerts: number;
  protectedAssets: string;
  responseTime: string;
}

export function WalletSecurityDashboard({ isAdminMode = false }: WalletSecurityDashboardProps) {
  const { sdk } = useLukasSDK();
  const [wallets, setWallets] = useState<WalletStatus[]>([
    {
      address: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
      label: 'lukas-lat.eth (Compromised)',
      status: 'compromised',
      lastActivity: Date.now() - 3600000, // 1 hour ago
      balance: '0.000 ETH',
      riskScore: 100,
      alerts: 5
    },
    {
      address: '0x99E4b05A02E0060a4cD5dFD82731aa9F7EA37ACb',
      label: 'Relayer Wallet',
      status: 'secure',
      lastActivity: Date.now() - 1800000, // 30 minutes ago
      balance: '0.020 ETH',
      riskScore: 15,
      alerts: 0
    },
    {
      address: '0xB533bc58D455B430c4AB6966119536DE91e21097',
      label: 'Recovery Wallet',
      status: 'secure',
      lastActivity: Date.now() - 7200000, // 2 hours ago
      balance: '0.150 ETH',
      riskScore: 5,
      alerts: 0
    }
  ]);

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalWallets: 3,
    secureWallets: 2,
    compromisedWallets: 1,
    activeAlerts: 5,
    protectedAssets: '$2,847.32',
    responseTime: '< 5s'
  });

  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setWallets(prev => prev.map(wallet => ({
        ...wallet,
        lastActivity: wallet.status === 'compromised' ? wallet.lastActivity : Date.now() - Math.random() * 3600000
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: WalletStatus['status']) => {
    switch (status) {
      case 'secure': return 'text-green-600 dark:text-green-400 bg-green-500/20';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/20';
      case 'compromised': return 'text-red-600 dark:text-red-400 bg-red-500/20';
      case 'monitoring': return 'text-blue-600 dark:text-blue-400 bg-blue-500/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: WalletStatus['status']) => {
    switch (status) {
      case 'secure': return '🟢';
      case 'warning': return '🟡';
      case 'compromised': return '🔴';
      case 'monitoring': return '🔵';
      default: return '⚪';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 dark:text-red-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 20) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
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
      {/* Public View - Protection Status Banner */}
      {!isAdminMode && (
        <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🛡️</span>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Protection Status: Active
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="font-semibold text-green-600 dark:text-green-400">ENS Protection</div>
                    <div className="text-sm text-muted-foreground">Front-run enabled</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <div className="font-semibold text-green-600 dark:text-green-400">Auto Re-register</div>
                    <div className="text-sm text-muted-foreground">Enabled</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <div className="font-semibold text-green-600 dark:text-green-400">Response Time</div>
                    <div className="text-sm text-muted-foreground">&lt; 5 seconds</div>
                  </div>
                </div>
              </div>
              <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">Protected Domain</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-foreground">lukas-lat.eth</div>
                    <div className="text-sm text-muted-foreground">Expires in 365 days</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">At Risk</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Metrics Overview - Always visible */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👥</span>
            <span className="text-sm text-muted-foreground">Total Wallets</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{metrics.totalWallets}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🟢</span>
            <span className="text-sm text-muted-foreground">Secure</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.secureWallets}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔴</span>
            <span className="text-sm text-muted-foreground">Compromised</span>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics.compromisedWallets}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🚨</span>
            <span className="text-sm text-muted-foreground">Active Alerts</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{metrics.activeAlerts}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💰</span>
            <span className="text-sm text-muted-foreground">Protected Assets</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{metrics.protectedAssets}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚡</span>
            <span className="text-sm text-muted-foreground">Response Time</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.responseTime}</div>
        </div>
      </div>

      {/* Monitoring Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">System Status</h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="text-sm text-muted-foreground">
              {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="text-xl">✅</span>
            <div>
              <div className="font-medium text-green-600 dark:text-green-400">Mempool Scanner</div>
              <div className="text-xs text-muted-foreground">Scanning transactions</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="text-xl">✅</span>
            <div>
              <div className="font-medium text-green-600 dark:text-green-400">Alert System</div>
              <div className="text-xs text-muted-foreground">Ready to respond</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="font-medium text-yellow-600 dark:text-yellow-400">ENS Protection</div>
              <div className="text-xs text-muted-foreground">1 domain at risk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Status Table - Admin only */}
      {isAdminMode && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Monitored Wallets</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time status of all tracked wallets</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Wallet</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Balance</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Risk Score</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Activity</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Alerts</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet, index) => (
                <tr key={wallet.address} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-foreground text-sm">{wallet.label}</div>
                      <div className="text-xs text-muted-foreground font-mono">{truncateAddress(wallet.address)}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(wallet.status)}`}>
                      <span>{getStatusIcon(wallet.status)}</span>
                      <span className="capitalize">{wallet.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-foreground font-mono">{wallet.balance}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getRiskColor(wallet.riskScore)}`}>
                        {wallet.riskScore}%
                      </span>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            wallet.riskScore >= 80 ? 'bg-red-500' :
                            wallet.riskScore >= 50 ? 'bg-yellow-500' :
                            wallet.riskScore >= 20 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${wallet.riskScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{formatTime(wallet.lastActivity)}</span>
                  </td>
                  <td className="p-4">
                    {wallet.alerts > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
                        🚨 {wallet.alerts}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-primary hover:underline">View Details</button>
                      {wallet.status === 'compromised' && (
                        <button className="text-xs text-red-600 dark:text-red-400 hover:underline">Emergency</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">🔍</span>
            <span className="font-medium text-foreground">Scan Mempool</span>
          </div>
          <p className="text-xs text-muted-foreground">Check for suspicious transactions</p>
        </button>

        <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">⚡</span>
            <span className="font-medium text-foreground">Test Response</span>
          </div>
          <p className="text-xs text-muted-foreground">Simulate emergency response</p>
        </button>

        <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">📊</span>
            <span className="font-medium text-foreground">Generate Report</span>
          </div>
          <p className="text-xs text-muted-foreground">Export security analytics</p>
        </button>

        <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">⚙️</span>
            <span className="font-medium text-foreground">Settings</span>
          </div>
          <p className="text-xs text-muted-foreground">Configure monitoring rules</p>
        </button>
      </div>
    </div>
  );
}