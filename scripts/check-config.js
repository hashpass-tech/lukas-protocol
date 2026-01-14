#!/usr/bin/env node
/*
  Configuration Checker - Validates .env before execution
*/

const fs = require('fs');
const path = require('path');

console.log('\n🔍 CONFIGURATION CHECKER');
console.log('='.repeat(70));

// Load .env file
const envPath = 'packages/flashbots-ens-rescue-master/.env';
if (!fs.existsSync(envPath)) {
  console.log('❌ Error: .env file not found at', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

const config = {};
lines.forEach(line => {
  const match = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (match) {
    config[match[1]] = match[2];
  }
});

console.log('\n📋 Checking Required Variables...\n');

const checks = [];

// Check PRIVATE_KEY (compromised wallet)
if (!config.PRIVATE_KEY || config.PRIVATE_KEY.includes('YOUR_ACTUAL') || config.PRIVATE_KEY.includes('PLACEHOLDER')) {
  checks.push({
    name: 'PRIVATE_KEY (Compromised Wallet)',
    status: 'fail',
    value: 'Not set or placeholder',
    action: 'Set the actual compromised wallet private key'
  });
} else if (config.PRIVATE_KEY.length < 60) {
  checks.push({
    name: 'PRIVATE_KEY (Compromised Wallet)',
    status: 'fail',
    value: 'Too short',
    action: 'Provide valid 64-character private key'
  });
} else {
  checks.push({
    name: 'PRIVATE_KEY (Compromised Wallet)',
    status: 'pass',
    value: config.PRIVATE_KEY.slice(0, 10) + '...' + config.PRIVATE_KEY.slice(-4),
    action: 'OK'
  });
}

// Check RELAYER_PRIVATE
if (!config.RELAYER_PRIVATE || config.RELAYER_PRIVATE.includes('YOUR_ACTUAL') || config.RELAYER_PRIVATE.includes('PLACEHOLDER')) {
  checks.push({
    name: 'RELAYER_PRIVATE',
    status: 'fail',
    value: 'Not set or placeholder',
    action: 'Set the relayer wallet private key'
  });
} else if (config.RELAYER_PRIVATE.length < 60) {
  checks.push({
    name: 'RELAYER_PRIVATE',
    status: 'fail',
    value: 'Too short',
    action: 'Provide valid 64-character private key'
  });
} else {
  checks.push({
    name: 'RELAYER_PRIVATE',
    status: 'pass',
    value: config.RELAYER_PRIVATE.slice(0, 10) + '...' + config.RELAYER_PRIVATE.slice(-4),
    action: 'OK'
  });
}

// Check NEW_OWNER
if (!config.NEW_OWNER || config.NEW_OWNER.includes('YOUR_') || config.NEW_OWNER.includes('0x0000000000')) {
  checks.push({
    name: 'NEW_OWNER',
    status: 'fail',
    value: 'Not set or placeholder',
    action: 'Set the destination address'
  });
} else if (!config.NEW_OWNER.startsWith('0x') || config.NEW_OWNER.length !== 42) {
  checks.push({
    name: 'NEW_OWNER',
    status: 'fail',
    value: config.NEW_OWNER,
    action: 'Provide valid Ethereum address'
  });
} else {
  checks.push({
    name: 'NEW_OWNER',
    status: 'pass',
    value: config.NEW_OWNER,
    action: 'OK'
  });
}

// Check RPC URLs
if (!config.MAINNET_RPC_URL || config.MAINNET_RPC_URL.includes('YOUR_')) {
  checks.push({
    name: 'MAINNET_RPC_URL',
    status: 'fail',
    value: 'Not set',
    action: 'Set mainnet RPC URL'
  });
} else {
  checks.push({
    name: 'MAINNET_RPC_URL',
    status: 'pass',
    value: config.MAINNET_RPC_URL.slice(0, 50) + '...',
    action: 'OK'
  });
}

if (!config.SEPOLIA_RPC_URL || config.SEPOLIA_RPC_URL.includes('YOUR_')) {
  checks.push({
    name: 'SEPOLIA_RPC_URL',
    status: 'fail',
    value: 'Not set',
    action: 'Set Sepolia RPC URL'
  });
} else {
  checks.push({
    name: 'SEPOLIA_RPC_URL',
    status: 'pass',
    value: config.SEPOLIA_RPC_URL.slice(0, 50) + '...',
    action: 'OK'
  });
}

// Print results
checks.forEach(check => {
  const icon = check.status === 'pass' ? '✅' : '❌';
  console.log(`${icon} ${check.name}`);
  console.log(`   Value: ${check.value}`);
  if (check.status !== 'pass') {
    console.log(`   Action: ${check.action}`);
  }
  console.log('');
});

const failed = checks.filter(c => c.status === 'fail');
const passed = checks.filter(c => c.status === 'pass');

console.log('='.repeat(70));
console.log(`\n📊 Results: ${passed.length}/${checks.length} checks passed\n`);

if (failed.length > 0) {
  console.log('❌ CONFIGURATION INCOMPLETE');
  console.log('\n🔧 Required Actions:\n');
  failed.forEach((check, i) => {
    console.log(`${i + 1}. ${check.name}: ${check.action}`);
  });
  console.log('\n⚠️  Please update packages/flashbots-ens-rescue-master/.env\n');
  process.exit(1);
} else {
  console.log('✅ CONFIGURATION COMPLETE');
  console.log('\n🎯 You are ready to:');
  console.log('   1. Test on Sepolia: ./scripts/final-testnet-check.sh');
  console.log('   2. Execute on Mainnet: ./scripts/execute-mainnet-rescue.sh\n');
  process.exit(0);
}
