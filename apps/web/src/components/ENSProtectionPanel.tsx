"use client";

import { useState, useEffect } from 'react';

interface ENSProtectionPanelProps {
  isAdminMode?: boolean;
}

interface ENSDomain {
  name: string;
  owner: string;
  status: 'at_risk' | 'protected' | 'expired' | 'monitoring';
  expirationDate: number;
  daysUntilExpiration: number;
  autoRenew: boolean;
}

export function ENSProtectionPanel({ isAdminMode = false }: ENSProtectionPanelProps) {
  const [domains, setDomains] = useState<ENSDomain[]>([
    {
      name: 'lukas-lat.eth',
      owner: '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
      status: 'at_risk',
      expirationDate: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year from now
      daysUntilExpiration: 365,
      autoRenew: false
    }
  ]);

  const [frontRunEnabled, setFrontRunEnabled] = useState(true);
  const [autoRegisterEnabled, setAutoRegisterEnabled] = useState(true);
  const [recoveryWallet, setRecoveryWallet] = useState('0xB533bc58D455B430c4AB6966119536DE91e21097');

  useEffect(() => {
    // Update days until expiration
    const interval = setInterval(() => {
      setDomains(prev => prev.map(domain => ({
        ...domain,
        daysUntilExpiration: Math.floor((domain.expirationDate - Date.now()) / (24 * 60 * 60 * 1000))
      })));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ENSDomain['status']) => {
    switch (status) {
      case 'at_risk': return 'text-red-600 dark:text-red-400 bg-red-500/20 border-red-500/30';
      case 'protected': return 'text-green-600 dark:text-green-400 bg-green-500/20 border-green-500/30';
      case 'expired': return 'text-gray-600 dark:text-gray-400 bg-gray-500/20 border-gray-500/30';
      case 'monitoring': return 'text-blue-600 dark:text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getStatusIcon = (status: ENSDomain['status']) => {
    switch (status) {
      case 'at_risk': return '⚠️';
      case 'protected': return '🛡️';
      case 'expired': return '⏰';
      case 'monitoring': return '👁️';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="space-y-6">
      {/* Protection Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🏷️</span>
            <span className="text-sm text-muted-foreground">Monitored Domains</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{domains.length}</div>
          <div className="text-xs text-muted-foreground mt-1">ENS domains tracked</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚡</span>
            <span className="text-sm text-muted-foreground">Front-run Protection</span>
          </div>
          <div className={`text-2xl font-bold ${frontRunEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {frontRunEnabled ? 'Active' : 'Disabled'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {frontRunEnabled ? 'Ready to respond' : 'Manual mode'}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔄</span>
            <span className="text-sm text-muted-foreground">Auto Re-register</span>
          </div>
          <div className={`text-2xl font-bold ${autoRegisterEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {autoRegisterEnabled ? 'Enabled' : 'Disabled'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {autoRegisterEnabled ? 'Will auto-register' : 'Manual registration'}
          </div>
        </div>
      </div>

      {/* ENS Domains List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">ENS Domains</h3>
          <p className="text-sm text-muted-foreground mt-1">Tracked domains and expiration status</p>
        </div>

        <div className="p-6 space-y-4">
          {domains.map((domain) => (
            <div key={domain.name} className={`p-4 rounded-lg border ${getStatusColor(domain.status)}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{getStatusIcon(domain.status)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-bold">{domain.name}</h4>
                      <span className="text-xs font-medium uppercase px-2 py-1 rounded-full bg-background/50">
                        {domain.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Owner:</span>
                        <code className="font-mono text-xs">{truncateAddress(domain.owner)}</code>
                        <a 
                          href={`https://etherscan.io/address/${domain.owner}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs"
                        >
                          View →
                        </a>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Expires:</span>
                        <span className="font-medium">{formatDate(domain.expirationDate)}</span>
                        <span className="text-xs">({domain.daysUntilExpiration} days)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Auto-renew:</span>
                        <span className={`text-xs font-medium ${domain.autoRenew ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {domain.autoRenew ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {/* Expiration Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Time until expiration</span>
                        <span className="font-medium">{Math.floor((domain.daysUntilExpiration / 365) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            domain.daysUntilExpiration < 30 ? 'bg-red-500' :
                            domain.daysUntilExpiration < 90 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((domain.daysUntilExpiration / 365) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-1 text-xs bg-background/50 rounded hover:bg-background transition-colors">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Protection Settings - Admin only */}
      {isAdminMode && (
        <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Protection Settings</h3>
        
        <div className="space-y-4">
          {/* Front-run Protection */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚡</span>
              <div>
                <div className="font-medium text-foreground">Front-run Protection</div>
                <div className="text-xs text-muted-foreground">Automatically counter ENS transfer attempts</div>
              </div>
            </div>
            <button
              onClick={() => setFrontRunEnabled(!frontRunEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                frontRunEnabled ? 'bg-green-500' : 'bg-gray-400'
              }`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                frontRunEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Auto Re-register */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔄</span>
              <div>
                <div className="font-medium text-foreground">Auto Re-register</div>
                <div className="text-xs text-muted-foreground">Automatically re-register expired domains</div>
              </div>
            </div>
            <button
              onClick={() => setAutoRegisterEnabled(!autoRegisterEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoRegisterEnabled ? 'bg-green-500' : 'bg-gray-400'
              }`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                autoRegisterEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Recovery Wallet */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">🔐</span>
              <div className="font-medium text-foreground">Recovery Wallet</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={recoveryWallet}
                onChange={(e) => setRecoveryWallet(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono"
                placeholder="0x..."
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors">
                Update
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Wallet address to receive recovered ENS domains
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Quick Actions - Admin only */}
      {isAdminMode && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">🔍</span>
            <span className="font-medium text-foreground">Check ENS Status</span>
          </div>
          <p className="text-xs text-muted-foreground">Verify current ENS ownership and expiration</p>
        </button>

        <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">⚡</span>
            <span className="font-medium text-foreground">Test Front-run</span>
          </div>
          <p className="text-xs text-muted-foreground">Simulate front-running response</p>
        </button>
      </div>
      )}
    </div>
  );
}
