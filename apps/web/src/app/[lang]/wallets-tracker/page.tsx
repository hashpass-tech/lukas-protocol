import { WalletTrackerClient } from './WalletTrackerClient';

export default function WalletTrackerPage() {
  return <WalletTrackerClient />;
}

export function generateStaticParams() {
  return ["en", "es", "pt", "cl"].map((lang) => ({ lang }));
}

export const metadata = {
  title: 'Wallet Security Tracker | Lukas Protocol',
  description: 'Real-time monitoring and protection system for compromised wallets and ENS domains',
};