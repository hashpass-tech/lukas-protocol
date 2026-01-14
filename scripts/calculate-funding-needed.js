#!/usr/bin/env node
/*
  Calculate exact funding needed for Flashbots ENS rescue
  
  Usage: node scripts/calculate-funding-needed.js [--gas-price GWEI]
*/

const ethers = require('ethers');
const argv = require('minimist')(process.argv.slice(2));

// Gas limits
const GAS_LIMITS = {
  ETH_TRANSFER: 21000n,        // Relayer funding the compromised wallet
  ENS_SET_OWNER: 120000n,      // ENS setOwner transaction (with 20% buffer)
};

// Current typical gas prices (you can override with --gas-price)
const TYPICAL_GAS_PRICES = {
  LOW: 15n,      // Low congestion
  MEDIUM: 30n,   // Medium congestion
  HIGH: 50n,     // High congestion
  PEAK: 100n,    // Peak congestion
};

function calculateCosts(baseFeeGwei, priorityFeeGwei) {
  // Handle very small values by using minimum of 1 gwei for priority
  const baseFee = ethers.parseUnits(baseFeeGwei.toString(), 'gwei');
  const minPriorityFee = ethers.parseUnits('1', 'gwei');
  const priorityFee = priorityFeeGwei < 1 
    ? minPriorityFee 
    : ethers.parseUnits(priorityFeeGwei.toString(), 'gwei');
  
  // Our script uses 150% of priority fee
  const ourPriorityFee = (priorityFee * 150n) / 100n;
  const maxFeePerGas = baseFee + ourPriorityFee;
  
  // Calculate costs for both transactions
  const fundingTxCost = maxFeePerGas * GAS_LIMITS.ETH_TRANSFER;
  const ensTransferCost = maxFeePerGas * GAS_LIMITS.ENS_SET_OWNER;
  
  // Total gas cost
  const totalGasCost = fundingTxCost + ensTransferCost;
  
  // The compromised wallet needs enough to pay for ENS transfer
  // We add 20% buffer for safety
  const fundingNeeded = ensTransferCost + (ensTransferCost * 20n) / 100n;
  
  // Total ETH needed in relayer wallet
  const totalRelayerNeeds = fundingTxCost + fundingNeeded;
  
  return {
    baseFee,
    priorityFee,
    ourPriorityFee,
    maxFeePerGas,
    fundingTxCost,
    ensTransferCost,
    fundingNeeded,
    totalRelayerNeeds,
    totalGasCost
  };
}

function printScenario(name, baseFeeGwei, priorityFeeGwei) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${name} SCENARIO`);
  console.log('='.repeat(70));
  
  const costs = calculateCosts(baseFeeGwei, priorityFeeGwei);
  
  console.log('\n📊 Gas Prices:');
  console.log(`  Base Fee:              ${ethers.formatUnits(costs.baseFee, 'gwei')} gwei`);
  console.log(`  Priority Fee (market): ${ethers.formatUnits(costs.priorityFee, 'gwei')} gwei`);
  console.log(`  Our Priority (150%):   ${ethers.formatUnits(costs.ourPriorityFee, 'gwei')} gwei`);
  console.log(`  Max Fee Per Gas:       ${ethers.formatUnits(costs.maxFeePerGas, 'gwei')} gwei`);
  
  console.log('\n💰 Transaction Costs:');
  console.log(`  Funding TX (21k gas):  ${ethers.formatEther(costs.fundingTxCost)} ETH`);
  console.log(`  ENS Transfer (120k):   ${ethers.formatEther(costs.ensTransferCost)} ETH`);
  console.log(`  Safety Buffer (20%):   ${ethers.formatEther((costs.ensTransferCost * 20n) / 100n)} ETH`);
  
  console.log('\n📦 Bundle Requirements:');
  console.log(`  Funding to send:       ${ethers.formatEther(costs.fundingNeeded)} ETH`);
  console.log(`  Total relayer needs:   ${ethers.formatEther(costs.totalRelayerNeeds)} ETH`);
  
  console.log('\n✅ Your Balance Check (0.016 ETH):');
  const yourBalance = ethers.parseEther('0.016');
  const sufficient = yourBalance >= costs.totalRelayerNeeds;
  const remaining = yourBalance - costs.totalRelayerNeeds;
  
  if (sufficient) {
    console.log(`  Status: ✅ SUFFICIENT`);
    console.log(`  Remaining after: ${ethers.formatEther(remaining)} ETH`);
  } else {
    const needed = costs.totalRelayerNeeds - yourBalance;
    console.log(`  Status: ❌ INSUFFICIENT`);
    console.log(`  Need additional: ${ethers.formatEther(needed)} ETH`);
  }
  
  return { sufficient, costs };
}

async function getCurrentGasPrice() {
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.PROVIDER_URL || 'https://eth.llamarpc.com'
    );
    
    const feeData = await provider.getFeeData();
    const block = await provider.getBlock('latest');
    
    if (block.baseFeePerGas && feeData.maxPriorityFeePerGas) {
      const baseFee = block.baseFeePerGas;
      const priorityFee = feeData.maxPriorityFeePerGas;
      
      console.log('\n🌐 CURRENT MAINNET GAS PRICES');
      console.log('='.repeat(70));
      console.log(`  Base Fee:     ${ethers.formatUnits(baseFee, 'gwei')} gwei`);
      console.log(`  Priority Fee: ${ethers.formatUnits(priorityFee, 'gwei')} gwei`);
      console.log(`  Block:        ${block.number}`);
      
      return {
        baseFee: Number(ethers.formatUnits(baseFee, 'gwei')),
        priorityFee: Math.max(1, Number(ethers.formatUnits(priorityFee, 'gwei')))
      };
    }
  } catch (e) {
    console.log('\n⚠️  Could not fetch current gas prices:', e.message);
    console.log('Using typical scenarios instead...\n');
  }
  return null;
}

async function main() {
  console.log('\n💰 FLASHBOTS ENS RESCUE - FUNDING CALCULATOR');
  console.log('='.repeat(70));
  console.log('Your relayer balance: 0.016 ETH');
  
  // Try to get current gas prices
  const current = await getCurrentGasPrice();
  
  if (current) {
    printScenario('CURRENT MAINNET', current.baseFee, current.priorityFee);
  }
  
  // Show typical scenarios
  const scenarios = [
    { name: 'LOW CONGESTION', base: 15, priority: 1 },
    { name: 'MEDIUM CONGESTION', base: 30, priority: 2 },
    { name: 'HIGH CONGESTION', base: 50, priority: 3 },
    { name: 'PEAK CONGESTION', base: 100, priority: 5 },
  ];
  
  console.log('\n\n📊 TYPICAL SCENARIOS');
  
  const results = scenarios.map(s => ({
    name: s.name,
    ...printScenario(s.name, s.base, s.priority)
  }));
  
  // Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('📋 SUMMARY');
  console.log('='.repeat(70));
  
  const sufficient = results.filter(r => r.sufficient);
  const insufficient = results.filter(r => !r.sufficient);
  
  console.log(`\n✅ Sufficient for ${sufficient.length}/${results.length} scenarios:`);
  sufficient.forEach(r => {
    console.log(`   - ${r.name}`);
  });
  
  if (insufficient.length > 0) {
    console.log(`\n❌ Insufficient for ${insufficient.length}/${results.length} scenarios:`);
    insufficient.forEach(r => {
      console.log(`   - ${r.name}`);
    });
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('='.repeat(70));
  
  if (current) {
    const currentResult = printScenario('VERIFICATION', current.baseFee, current.priorityFee);
    if (currentResult.sufficient) {
      console.log('\n✅ GOOD NEWS: 0.016 ETH is sufficient at current gas prices!');
      console.log('\n📝 Action items:');
      console.log('   1. Execute soon before gas prices increase');
      console.log('   2. Monitor gas prices: https://etherscan.io/gastracker');
      console.log('   3. If gas > 50 gwei, consider waiting or adding more ETH');
    } else {
      const needed = currentResult.costs.totalRelayerNeeds - ethers.parseEther('0.016');
      console.log('\n⚠️  WARNING: 0.016 ETH is NOT sufficient at current gas prices!');
      console.log(`\n📝 Action items:`);
      console.log(`   1. Add ${ethers.formatEther(needed)} ETH to relayer wallet`);
      console.log(`   2. Or wait for gas prices to drop below 40 gwei`);
      console.log(`   3. Monitor: https://etherscan.io/gastracker`);
    }
  } else {
    console.log('\n⚠️  0.016 ETH is BORDERLINE - depends on gas prices:');
    console.log('\n   ✅ Sufficient if gas < 40 gwei (low/medium congestion)');
    console.log('   ❌ Insufficient if gas > 50 gwei (high/peak congestion)');
    console.log('\n📝 Recommended actions:');
    console.log('   1. Check current gas: https://etherscan.io/gastracker');
    console.log('   2. If gas < 40 gwei: Proceed with 0.016 ETH');
    console.log('   3. If gas > 40 gwei: Add 0.01 ETH more (total 0.026 ETH)');
    console.log('   4. For safety: Use 0.05 ETH to handle any gas spike');
  }
  
  console.log('\n🎯 OPTIMAL RELAYER BALANCE:');
  console.log('   Minimum (low gas):  0.015 ETH');
  console.log('   Your balance:       0.016 ETH ⚠️  BORDERLINE');
  console.log('   Recommended:        0.05 ETH  ✅ SAFE');
  console.log('   Very safe:          0.1 ETH   ✅ VERY SAFE');
  
  console.log('\n');
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
