#!/usr/bin/env node
/**
 * Calculate if 0.02 ETH is sufficient for the 3-TX bundle
 */

const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

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

async function calculateBudget() {
  console.log('💰 Gas Budget Calculator for 3-TX Bundle\n');
  console.log('═'.repeat(70));
  
  const rpcUrl = process.env.MAINNET_RPC_URL || 'https://eth.llamarpc.com';
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  // Get current gas prices
  const feeData = await provider.getFeeData();
  const block = await provider.getBlock('latest');
  const baseFee = block.baseFeePerGas || ethers.parseUnits('30', 'gwei');
  
  console.log('📊 Current Network Conditions:\n');
  console.log(`   Base Fee: ${ethers.formatUnits(baseFee, 'gwei')} gwei`);
  console.log(`   Priority Fee: ${ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')} gwei`);
  console.log(`   Max Fee: ${ethers.formatUnits(feeData.maxFeePerGas, 'gwei')} gwei`);
  
  // Calculate with 150% premium (for Flashbots)
  const maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas * 150n) / 100n;
  const maxFeePerGas = baseFee + maxPriorityFeePerGas;
  
  console.log(`\n   With 150% Premium:`);
  console.log(`   Priority Fee: ${ethers.formatUnits(maxPriorityFeePerGas, 'gwei')} gwei`);
  console.log(`   Max Fee: ${ethers.formatUnits(maxFeePerGas, 'gwei')} gwei`);
  
  // Gas limits for each transaction
  const tx1Gas = 21000n; // Standard ETH transfer
  const tx2Gas = 50000n; // EIP-7702 revoke (12,500 base + 25,000 processing + buffer)
  const tx3Gas = 100000n; // ENS setOwner (tested on testnet: ~80k, using 100k for safety)
  
  console.log('\n═'.repeat(70));
  console.log('⛽ Gas Calculations:\n');
  
  // TX1: Funding (paid by relayer)
  const tx1Cost = maxFeePerGas * tx1Gas;
  console.log(`   TX1 (Funding):`);
  console.log(`   - Gas Limit: ${tx1Gas.toLocaleString()}`);
  console.log(`   - Cost: ${ethers.formatEther(tx1Cost)} ETH`);
  console.log(`   - Paid by: Relayer`);
  
  // TX2: Revoke delegation (paid by compromised from TX1 funding)
  const tx2Cost = maxFeePerGas * tx2Gas;
  console.log(`\n   TX2 (Revoke Delegation):`);
  console.log(`   - Gas Limit: ${tx2Gas.toLocaleString()}`);
  console.log(`   - Cost: ${ethers.formatEther(tx2Cost)} ETH`);
  console.log(`   - Paid by: Compromised (from TX1)`);
  
  // TX3: ENS transfer (paid by compromised from TX1 funding)
  const tx3Cost = maxFeePerGas * tx3Gas;
  console.log(`\n   TX3 (ENS Transfer):`);
  console.log(`   - Gas Limit: ${tx3Gas.toLocaleString()}`);
  console.log(`   - Cost: ${ethers.formatEther(tx3Cost)} ETH`);
  console.log(`   - Paid by: Compromised (from TX1)`);
  
  // Total costs
  const tx2And3Cost = tx2Cost + tx3Cost;
  const buffer20 = (tx2And3Cost * 20n) / 100n;
  const buffer30 = (tx2And3Cost * 30n) / 100n;
  
  const fundingNeeded20 = tx2And3Cost + buffer20;
  const fundingNeeded30 = tx2And3Cost + buffer30;
  
  const totalCost20 = tx1Cost + fundingNeeded20;
  const totalCost30 = tx1Cost + fundingNeeded30;
  
  console.log('\n═'.repeat(70));
  console.log('💵 Total Costs:\n');
  
  console.log(`   TX2 + TX3 Gas Cost: ${ethers.formatEther(tx2And3Cost)} ETH`);
  console.log(`   Buffer (20%): ${ethers.formatEther(buffer20)} ETH`);
  console.log(`   Buffer (30%): ${ethers.formatEther(buffer30)} ETH`);
  
  console.log(`\n   Funding Needed (20% buffer): ${ethers.formatEther(fundingNeeded20)} ETH`);
  console.log(`   Funding Needed (30% buffer): ${ethers.formatEther(fundingNeeded30)} ETH`);
  
  console.log(`\n   Total Relayer Cost (20% buffer): ${ethers.formatEther(totalCost20)} ETH`);
  console.log(`   Total Relayer Cost (30% buffer): ${ethers.formatEther(totalCost30)} ETH`);
  
  // Budget analysis
  const available = ethers.parseEther('0.020');
  
  console.log('\n═'.repeat(70));
  console.log('📊 Budget Analysis:\n');
  
  console.log(`   Available Budget: ${ethers.formatEther(available)} ETH`);
  console.log(`   Required (20% buffer): ${ethers.formatEther(totalCost20)} ETH`);
  console.log(`   Required (30% buffer): ${ethers.formatEther(totalCost30)} ETH`);
  
  if (totalCost20 <= available) {
    const margin = available - totalCost20;
    console.log(`\n   ✅ SUFFICIENT with 20% buffer`);
    console.log(`   Margin: ${ethers.formatEther(margin)} ETH (${(Number(margin) / Number(available) * 100).toFixed(1)}%)`);
  } else {
    const shortfall = totalCost20 - available;
    console.log(`\n   ❌ INSUFFICIENT with 20% buffer`);
    console.log(`   Shortfall: ${ethers.formatEther(shortfall)} ETH`);
  }
  
  if (totalCost30 <= available) {
    const margin = available - totalCost30;
    console.log(`\n   ✅ SUFFICIENT with 30% buffer`);
    console.log(`   Margin: ${ethers.formatEther(margin)} ETH (${(Number(margin) / Number(available) * 100).toFixed(1)}%)`);
  } else {
    const shortfall = totalCost30 - available;
    console.log(`\n   ⚠️  INSUFFICIENT with 30% buffer`);
    console.log(`   Shortfall: ${ethers.formatEther(shortfall)} ETH`);
  }
  
  // Recommendations
  console.log('\n═'.repeat(70));
  console.log('💡 Recommendations:\n');
  
  const baseFeeGwei = Number(ethers.formatUnits(baseFee, 'gwei'));
  
  if (baseFeeGwei > 50) {
    console.log('   🔴 WAIT: Gas prices are very high (> 50 gwei)');
    console.log('   Recommendation: Wait for gas prices to drop below 30 gwei');
  } else if (baseFeeGwei > 30) {
    console.log('   ⚠️  CAUTION: Gas prices are elevated (30-50 gwei)');
    console.log('   Recommendation: Consider waiting for lower prices');
  } else if (baseFeeGwei > 15) {
    console.log('   ✅ ACCEPTABLE: Gas prices are moderate (15-30 gwei)');
    console.log('   Recommendation: Can proceed with 20% buffer');
  } else {
    console.log('   ✅ EXCELLENT: Gas prices are low (< 15 gwei)');
    console.log('   Recommendation: Ideal conditions for execution');
  }
  
  if (totalCost20 > available) {
    console.log('\n   🔴 CRITICAL: Budget insufficient even with 20% buffer');
    console.log('   Options:');
    console.log('   1. Wait for gas prices to drop significantly');
    console.log('   2. Add more ETH to relayer (recommended: 0.03 ETH total)');
    console.log('   3. Reduce buffer to 10% (risky - may fail if gas spikes)');
  } else if (totalCost30 > available) {
    console.log('\n   ⚠️  Budget is tight - using 20% buffer');
    console.log('   Risk: If gas prices spike during execution, bundle may fail');
    console.log('   Mitigation: Execute during low gas periods (weekends, late night UTC)');
  } else {
    console.log('\n   ✅ Budget is comfortable - can use 30% buffer');
    console.log('   Low risk of failure due to gas price fluctuations');
  }
  
  // Gas price scenarios
  console.log('\n═'.repeat(70));
  console.log('📈 Gas Price Scenarios:\n');
  
  const scenarios = [
    { name: 'Very Low', gwei: 10n },
    { name: 'Low', gwei: 20n },
    { name: 'Current', gwei: BigInt(Math.round(baseFeeGwei)) },
    { name: 'Moderate', gwei: 30n },
    { name: 'High', gwei: 50n },
    { name: 'Very High', gwei: 100n },
  ];
  
  for (const scenario of scenarios) {
    const scenarioMaxFee = ethers.parseUnits(scenario.gwei.toString(), 'gwei') + maxPriorityFeePerGas;
    const scenarioCost = scenarioMaxFee * (tx1Gas + tx2Gas + tx3Gas);
    const scenarioWithBuffer = scenarioCost + (scenarioCost * 20n) / 100n;
    
    const fits = scenarioWithBuffer <= available;
    const icon = fits ? '✅' : '❌';
    
    console.log(`   ${icon} ${scenario.name.padEnd(12)} (${scenario.gwei} gwei): ${ethers.formatEther(scenarioWithBuffer)} ETH`);
  }
  
  console.log('\n═'.repeat(70));
  console.log('🎯 Execution Strategy:\n');
  
  if (totalCost20 <= available) {
    console.log('   1. Monitor gas prices - wait for < 30 gwei base fee');
    console.log('   2. Execute during low-traffic periods (weekends, 2-6 AM UTC)');
    console.log('   3. Use 20% buffer (script default)');
    console.log('   4. Have backup plan if bundle fails');
    console.log('\n   Estimated Success Rate: 85%+');
  } else {
    console.log('   ⚠️  BUDGET INSUFFICIENT - DO NOT EXECUTE');
    console.log('   Required actions:');
    console.log('   1. Add more ETH to relayer (minimum 0.025 ETH total)');
    console.log('   2. Or wait for gas prices to drop below 10 gwei (rare)');
    console.log('   3. Or consider alternative rescue strategies');
  }
  
  console.log('\n═'.repeat(70));
}

calculateBudget()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
