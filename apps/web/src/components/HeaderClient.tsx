"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LightPullThemeSwitcher } from "@/components/LightPullThemeSwitcher";
import { WalletHeader } from "@/components/WalletHeader";
import { MobileThemeSwitcher } from "@/components/MobileThemeSwitcher";
import { Menu, X } from "lucide-react";
import { Trans } from "@/components/Trans";
import { DownloadButton } from "@/components/DownloadButton";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";

export function HeaderClient() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setMobileSidebarOpen } = useSidebar();
  const params = useParams();
  const lang = params?.lang || 'en';

  return (
    <div className="pointer-events-auto w-full px-3 sm:px-4 py-2">
      <header className="mx-auto w-full max-w-5xl rounded-2xl border border-border/70 bg-background/90 backdrop-blur-lg shadow-lg">
        <nav className="flex h-12 sm:h-14 items-center justify-between px-3 sm:px-4 gap-2 sm:gap-3">
          {/* Left: Brand */}
          <div className="flex items-center min-w-0">
            <Link href={`/${lang}`} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent/60 transition-colors">
              <span className="text-lg sm:text-xl font-mono font-bold tracking-tight">
                <span className="sm:hidden"><Trans i18nKey="brand.name" fallback="$LUKAS" /></span>
                <span className="hidden sm:inline"><Trans i18nKey="brand.name.full" fallback="$(LKS) LUKAS" /></span>
              </span>
            </Link>
          </div>

          {/* Center: Language + Download + Pages Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Download Button */}
            <div className="md:flex lg:hidden">
              <DownloadButton variant="icon-only" />
            </div>
            <div className="hidden lg:flex">
              <DownloadButton variant="full" />
            </div>
            
            {/* Pages Navigation - Grouped with visual container */}
            <div className="flex items-center gap-1 px-2 py-1 bg-muted/30 rounded-lg border border-border/50">
              <span className="text-xs text-muted-foreground font-medium mr-1 hidden lg:inline">Pages:</span>
              <Link 
                href={`/${lang}/contracts`}
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent/60 transition-all duration-200 text-sm font-medium group"
                title="Protocol Contracts"
              >
                <span className="text-base">📄</span>
                <span className="hidden lg:inline">Contracts</span>
              </Link>
              <Link 
                href={`/${lang}/pool`}
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent/60 transition-all duration-200 text-sm font-medium group"
                title="LUKAS/USDC Pool"
              >
                <span className="text-base">🌊</span>
                <span className="hidden lg:inline">Pool</span>
              </Link>
              <Link 
                href={`/${lang}/wallets-tracker`}
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent/60 transition-all duration-200 text-sm font-medium group"
                title="Security Tracker"
              >
                <span className="text-base">🔒</span>
                <span className="hidden lg:inline">Security</span>
              </Link>
            </div>
          </div>

          {/* Right: Theme + Wallet */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 justify-end">
            <div className="hidden sm:flex">
              <LightPullThemeSwitcher />
            </div>
            <div className="hidden sm:flex flex-shrink-0">
              <WalletHeader connectTextKey="connect.wallet" />
            </div>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/80 sm:hidden"
              onClick={() => {
                setMobileOpen(true);
                setMobileSidebarOpen(true);
              }}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] flex sm:hidden">
          <div className="w-3/4 max-w-xs h-full bg-background/95 backdrop-blur-xl border-r border-border flex flex-col p-4 gap-4">
            <div className="flex items-center justify-between mb-2">
              <Link href={`/${lang}`} className="text-base font-mono font-bold"><Trans i18nKey="brand.name" fallback="$LUKAS" /></Link>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/80"
                onClick={() => {
                  setMobileOpen(false);
                  setMobileSidebarOpen(false);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-4 flex-1">
              {/* Navigation Section */}
              <div className="border-b border-border/60 pb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Navigation</h3>
                <div className="space-y-1">
                  <Link 
                    href={`/${lang}/contracts`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent/60 transition-all duration-200 text-sm font-medium group"
                    onClick={() => {
                      setMobileOpen(false);
                      setMobileSidebarOpen(false);
                    }}
                  >
                    <span className="text-lg">📄</span>
                    <div className="flex flex-col">
                      <span className="text-foreground">Protocol Contracts</span>
                      <span className="text-xs text-muted-foreground">View deployed contracts</span>
                    </div>
                  </Link>
                  <Link 
                    href={`/${lang}/pool`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent/60 transition-all duration-200 text-sm font-medium group"
                    onClick={() => {
                      setMobileOpen(false);
                      setMobileSidebarOpen(false);
                    }}
                  >
                    <span className="text-lg">🌊</span>
                    <div className="flex flex-col">
                      <span className="text-foreground">LUKAS/USDC Pool</span>
                      <span className="text-xs text-muted-foreground">Trade and monitor pool</span>
                    </div>
                  </Link>
                  <Link 
                    href={`/${lang}/wallets-tracker`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent/60 transition-all duration-200 text-sm font-medium group"
                    onClick={() => {
                      setMobileOpen(false);
                      setMobileSidebarOpen(false);
                    }}
                  >
                    <span className="text-lg">🔒</span>
                    <div className="flex flex-col">
                      <span className="text-foreground">Security Tracker</span>
                      <span className="text-xs text-muted-foreground">Monitor wallet security</span>
                    </div>
                  </Link>
                </div>
              </div>
              
              {/* Settings Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</h3>
                <div className="space-y-2">
                  <div>
                    <LanguageSwitcher />
                  </div>
                  <DownloadButton variant="full" />
                  <div>
                    <MobileThemeSwitcher />
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/60">
              <WalletHeader connectTextKey="connect.wallet" />
            </div>
            <div className="mt-auto pt-2">
              <Footer className="relative !z-10" />
            </div>
          </div>
          <button
            type="button"
            className="flex-1 h-full bg-black/40"
            onClick={() => {
              setMobileOpen(false);
              setMobileSidebarOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
