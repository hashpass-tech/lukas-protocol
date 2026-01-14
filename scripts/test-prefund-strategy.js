#!/usr/bin/env node
/**
 * TEST PRE-FUNDING STRATEGY
 * 
 * This script tests if we can pre-fund the compromised account
 * and whether the attacker will drain it immediately.
 * 
 * Strategy:
 * 1. Send small test amount (0.005 ETH) to compromised account
 * 2. Monitor for 10 blocks (~2 minutes)
 * 3. Check if funds remain or were drained
 * 4. If funds remain, we can proceed with 2-TX bundle
 */

const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

// Load .env file manually
const envPath = path.join(__dirname, '../packages/flashbots-ens-rescue-master/.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

function log(section, message) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`[${timestamp}] [${section}] ${message}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  console.log(title);
  console.log('='.repeat(70));
}

async function main() {
  logSection('🧪 PRE-FUNDING STRATEGY TEST');
  
  const dryRun = process.env.DRY_RUN === 'true' || argv['dry-run'];
  const testAmount = argv.amount || '0.005'; // Default 0.005 ETH test
  
  // Load configuration
  const rpcUrl = process.env.MAINNET_RPC_URL || 'https://eth.llamarpc.com';
  let relayerPriv = process.env.RELAYER_PRIVATE || process.env.RELAYER_PRIVATE_KEY;
  let ownerPriv = process.env.PRIVATE_KEY;
  
  if (!relayerPriv || !ownerPriv) {
    console.error('❌ Missing required env: RELAYER_PRIVATE, PRIVATE_KEY');
    process.exit(1);
  }
  
  if (!relayerPriv.startsWith('0x')) relayerPriv = '0x' + relayerPriv;
  if (!ownerPriv.startsWith('0x')) ownerPriv = '0x' + ownerPriv;
  
  // Setup provider and wallets
  logSection('🔌 SETUP');
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const relayer = new ethers.Wallet(relayerPriv, provider);
  const owner = new ethers.Wallet(ownerPriv, provider);
  
  log('SETUP', `RPC: ${rpcUrl}`);
  log('SETUP', `Relayer: ${relayer.address}`);
  log('SETUP', `Compromised: ${owner.address}`);
  log('SETUP', `Test Amount: ${testAmount} ETH`);
  
  // Check initial balances
  logSection('💰 INITIAL BALANCES');
  
  const relayerBalance = await provider.getBalance(relayer.address);
  const ownerBalance = await provider.getBalance(owner.address);
  
  log('BALANCE', `Relayer: ${ethers.formatEther(relayerBalance)} ETH`);
  log('BALANCE', `Compromised: ${ethers.formatEther(ownerBalance)} ETH`);
  
  if (ownerBalance > 0n) {
    console.log('\n⚠️  WARNING: Compromised account already has balance!');
    console.log(`   Current: ${ethers.formatEther(ownerBalance)} ETH`);
    console.log('   This is unexpected. Attacker may have stopped draining.');
    console.log('   Or there may be pending transactions.');
  }
  
  const testAmountWei = ethers.parseEther(testAmount.toString());
  
  if (relayerBalance < testAmountWei) {
    console.log('\n❌ ERROR: Insufficient relayer balance!');
    console.log(`   Required: ${testAmount} ETH`);
    console.log(`   Available: ${ethers.formatEther(relayerBalance)} ETH`);
    process.exit(1);
  }
  
  // Check delegation status
  logSection('🔍 DELEGATION CHECK');
  
  const currentCode = await provider.getCode(owner.address);
  log('CHECK', `Account code: ${currentCode}`);
  
  if (currentCode === '0x') {
    log('CHECK', '✅ No delegation detected');
  } else if (currentCode.startsWith('0xef0100')) {
    const delegatedTo = '0x' + currentCode.slice(8, 48);
    log('CHECK', `🔴 EIP-7702 delegation active`);
    log('CHECK', `   Delegated to: ${delegatedTo}`);
  } else {
    log('CHECK', `⚠️  Unexpected code: ${currentCode}`);
  }
  
  if (dryRun) {
    console.log('\n✅ DRY RUN - Would send test funding');
    console.log(`   Amount: ${testAmount} ETH`);
    console.log(`   From: ${relayer.address}`);
    console.log(`   To: ${owner.address}`);
    console.log('\nSet DRY_RUN=false to execute for real');
    process.exit(0);
  }
  
  // Send test funding
  logSection('💸 SENDING TEST FUNDING');
  
  log('SEND', `Preparing to send ${testAmount} ETH...`);
  
  const feeData = await provider.getFeeData();
  const tx = {
    to: owner.address,
    value: testAmountWei,
    gasLimit: 21000n,
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
  };
  
  log('SEND', `Gas: ${ethers.formatUnits(feeData.maxFeePerGas, 'gwei')} gwei`);
  
  console.log('\n⚠️  FINAL CONFIRMATION');
  console.log(`   Sending: ${testAmount} ETH`);
  console.log(`   To: ${owner.address}`);
  console.log(`   Risk: Attacker may drain immediately`);
  console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to proceed...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  log('SEND', '📤 Sending transaction...');
  
  const txResponse = await relayer.sendTransaction(tx);
  const startBlock = await provider.getBlockNumber();
  
  log('SEND', `✅ Transaction sent: ${txResponse.hash}`);
  log('SEND', `   Block: ${startBlock}`);
  log('SEND', `   Etherscan: https://etherscan.io/tx/${txResponse.hash}`);
  
  log('SEND', '⏳ Waiting for confirmation...');
  const receipt = await txResponse.wait();
  
  log('SEND', `✅ Confirmed in block ${receipt.blockNumber}`);
  log('SEND', `   Gas used: ${receipt.gasUsed}`);
  log('SEND', `   Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
  
  if (receipt.status !== 1) {
    console.log('\n❌ Transaction failed!');
    process.exit(1);
  }
  
  // Monitor for draining
  logSection('👀 MONITORING FOR ATTACKER ACTIVITY');
  
  const monitorBlocks = 10; // Monitor for 10 blocks (~2 minutes)
  const checkInterval = 12000; // Check every 12 seconds (1 block)
  
  log('MONITOR', `Will monitor for ${monitorBlocks} blocks (~${monitorBlocks * 12} seconds)`);
  log('MONITOR', `Starting from block ${receipt.blockNumber}`);
  
  const balanceHistory = [];
  
  for (let i = 0; i < monitorBlocks; i++) {
    await new Promise(resolve => setTimeout(resolve, checkInterval));
    
    const currentBlock = await provider.getBlockNumber();
    const currentBalance = await provider.getBalance(owner.address);
    
    balanceHistory.push({
      block: currentBlock,
      balance: currentBalance,
      balanceEth: ethers.formatEther(currentBalance)
    });
    
    log('MONITOR', `Block ${currentBlock}: ${ethers.formatEther(currentBalance)} ETH`);
    
    // Check if balance changed
    if (i > 0) {
      const prevBalance = balanceHistory[i - 1].balance;
      
      if (currentBalance < prevBalance) {
        const drained = prevBalance - currentBalance;
        console.log('\n🔴 BALANCE DECREASED!');
        log('MONITOR', `   Previous: ${ethers.formatEther(prevBalance)} ETH`);
        log('MONITOR', `   Current: ${ethers.formatEther(currentBalance)} ETH`);
        log('MONITOR', `   Drained: ${ethers.formatEther(drained)} ETH`);
        log('MONITOR', `   Block: ${currentBlock}`);
        
        // Check for outgoing transactions
        log('MONITOR', 'Checking for attacker transactions...');
        
        const block = await provider.getBlock(currentBlock, true);
        const attackerTxs = block.prefetchedTransactions.filter(
          tx => tx.from.toLowerCase() === owner.address.toLowerCase()
        );
        
        if (attackerTxs.length > 0) {
          console.log('\n🔴 ATTACKER TRANSACTION DETECTED!');
          attackerTxs.forEach((tx, idx) => {
            log('MONITOR', `   TX ${idx + 1}: ${tx.hash}`);
            log('MONITOR', `   To: ${tx.to}`);
            log('MONITOR', `   Value: ${ethers.formatEther(tx.value)} ETH`);
            log('MONITOR', `   Etherscan: https://etherscan.io/tx/${tx.hash}`);
          });
        }
        
        break;
      } else if (currentBalance > prevBalance) {
        console.log('\n✅ BALANCE INCREASED!');
        log('MONITOR', `   Previous: ${ethers.formatEther(prevBalance)} ETH`);
        log('MONITOR', `   Current: ${ethers.formatEther(currentBalance)} ETH`);
        log('MONITOR', `   Gained: ${ethers.formatEther(currentBalance - prevBalance)} ETH`);
      }
    }
  }
  
  // Final analysis
  logSection('📊 FINAL ANALYSIS');
  
  const finalBalance = await provider.getBalance(owner.address);
  const finalBlock = await provider.getBlockNumber();
  
  log('ANALYSIS', `Final block: ${finalBlock}`);
  log('ANALYSIS', `Final balance: ${ethers.formatEther(finalBalance)} ETH`);
  log('ANALYSIS', `Blocks monitored: ${balanceHistory.length}`);
  
  console.log('\n📈 Balance History:');
  balanceHistory.forEach(entry => {
    console.log(`   Block ${entry.block}: ${entry.balanceEth} ETH`);
  });
  
  // Determine outcome
  console.log('\n' + '='.repeat(70));
  
  if (finalBalance >= testAmountWei) {
    console.log('✅ SUCCESS: FUNDS REMAIN!');
    console.log('\n🎉 The attacker did NOT drain the funds!');
    console.log('\nThis means we can proceed with the 2-TX bundle strategy:');
    console.log('   1. Account is already funded');
    console.log('   2. Submit 2-TX Flashbots bundle:');
    console.log('      - TX1: Revoke EIP-7702 delegation');
    console.log('      - TX2: Transfer ENS ownership');
    console.log('\n💡 Next steps:');
    console.log('   1. Calculate exact gas needed for 2-TX bundle');
    console.log('   2. If current balance insufficient, send more ETH');
    console.log('   3. Execute 2-TX Flashbots bundle');
    console.log('\n⚠️  Act quickly before attacker notices!');
  } else if (finalBalance > 0n) {
    console.log('⚠️  PARTIAL DRAIN: Some funds remain');
    console.log(`\n   Sent: ${testAmount} ETH`);
    console.log(`   Remaining: ${ethers.formatEther(finalBalance)} ETH`);
    console.log(`   Drained: ${ethers.formatEther(testAmountWei - finalBalance)} ETH`);
    console.log('\nThe attacker is active but may have left some funds.');
    console.log('This is unusual. Possible reasons:');
    console.log('   - Attacker has minimum threshold');
    console.log('   - Gas costs made full drain unprofitable');
    console.log('   - Attacker bot has bugs');
    console.log('\n💡 You could try sending more to reach needed amount.');
  } else {
    console.log('❌ COMPLETE DRAIN: All funds taken');
    console.log(`\n   Sent: ${testAmount} ETH`);
    console.log('   Remaining: 0 ETH');
    console.log(`   Lost: ${testAmount} ETH`);
    console.log('\nThe attacker is actively monitoring and draining.');
    console.log('Pre-funding strategy will NOT work.');
    console.log('\n💡 Recommended next steps:');
    console.log('   1. Contact ENS support (best option)');
    console.log('   2. Research if attacker has patterns/delays');
    console.log('   3. Consider if domain value justifies more attempts');
  }
  
  console.log('='.repeat(70));
  
  // Save results
  const results = {
    timestamp: new Date().toISOString(),
    testAmount: testAmount,
    testAmountWei: testAmountWei.toString(),
    fundingTx: txResponse.hash,
    fundingBlock: receipt.blockNumber,
    monitoredBlocks: balanceHistory.length,
    finalBalance: finalBalance.toString(),
    finalBalanceEth: ethers.formatEther(finalBalance),
    success: finalBalance >= testAmountWei,
    balanceHistory: balanceHistory.map(e => ({
      block: e.block,
      balance: e.balance.toString(),
      balanceEth: e.balanceEth
    }))
  };
  
  const resultsPath = path.join(__dirname, '../prefund_test_results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  log('ANALYSIS', `Results saved to: ${resultsPath}`);
}

main().catch(e => {
  console.error('\n❌ FATAL ERROR:', e);
  process.exit(1);
});
