#!/usr/bin/env node
/*
  RPC Performance Tester
  Tests multiple RPC endpoints to find the fastest and most reliable
  
  Usage: node scripts/test-rpc-performance.js [--network mainnet|sepolia]
*/

const ethers = require('ethers');
const argv = require('minimist')(process.argv.slice(2));

const MAINNET_RPCS = [
  { name: 'Alchemy', url: process.env.ALCHEMY_MAINNET_RPC || 'https://eth-mainnet.g.alchemy.com/v2/demo' },
  { name: 'Infura', url: process.env.INFURA_MAINNET_RPC || 'https://mainnet.infura.io/v3/demo' },
  { name: 'LlamaNodes', url: 'https://eth.llamarpc.com' },
  { name: 'Ankr', url: 'https://rpc.ankr.com/eth' },
  { name: 'Cloudflare', url: 'https://cloudflare-eth.com' },
  { name: 'Flashbots', url: 'https://rpc.flashbots.net' },
  { name: 'PublicNode', url: 'https://ethereum-rpc.publicnode.com' },
];

const SEPOLIA_RPCS = [
  { name: 'Alchemy', url: process.env.ALCHEMY_SEPOLIA_RPC || 'https://eth-sepolia.g.alchemy.com/v2/demo' },
  { name: 'Infura', url: process.env.INFURA_SEPOLIA_RPC || 'https://sepolia.infura.io/v3/demo' },
  { name: 'Sepolia.org', url: 'https://rpc.sepolia.org' },
  { name: 'PublicNode', url: 'https://ethereum-sepolia-rpc.publicnode.com' },
];

async function testRPC(rpc) {
  const results = {
    name: rpc.name,
    url: rpc.url,
    available: false,
    blockNumber: null,
    latency: null,
    gasPrice: null,
    error: null
  };
  
  try {
    const provider = new ethers.JsonRpcProvider(rpc.url);
    
    // Test 1: Get block number (latency test)
    const start = Date.now();
    const blockNumber = await Promise.race([
      provider.getBlockNumber(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    const latency = Date.now() - start;
    
    results.available = true;
    results.blockNumber = blockNumber;
    results.latency = latency;
    
    // Test 2: Get gas price
    try {
      const feeData = await provider.getFeeData();
      if (feeData.maxFeePerGas) {
        results.gasPrice = ethers.formatUnits(feeData.maxFeePerGas, 'gwei');
      }
    } catch (e) {
      results.gasPrice = 'N/A';
    }
    
  } catch (e) {
    results.error = e.message;
  }
  
  return results;
}

async function main() {
  const network = argv.network || 'mainnet';
  const rpcs = network === 'sepolia' ? SEPOLIA_RPCS : MAINNET_RPCS;
  
  console.log('🧪 RPC Performance Test');
  console.log('='.repeat(80));
  console.log(`Network: ${network.toUpperCase()}`);
  console.log(`Testing ${rpcs.length} RPC endpoints...`);
  console.log('='.repeat(80));
  console.log('');
  
  const results = [];
  
  for (const rpc of rpcs) {
    process.stdout.write(`Testing ${rpc.name.padEnd(15)}... `);
    const result = await testRPC(rpc);
    results.push(result);
    
    if (result.available) {
      console.log(`✅ ${result.latency}ms`);
    } else {
      console.log(`❌ ${result.error}`);
    }
  }
  
  console.log('');
  console.log('='.repeat(80));
  console.log('RESULTS');
  console.log('='.repeat(80));
  console.log('');
  
  // Sort by latency (available first)
  const available = results.filter(r => r.available).sort((a, b) => a.latency - b.latency);
  const unavailable = results.filter(r => !r.available);
  
  if (available.length > 0) {
    console.log('✅ Available RPCs (sorted by latency):');
    console.log('');
    console.log('Rank | Provider       | Latency | Block      | Gas Price');
    console.log('-----|----------------|---------|------------|----------');
    
    available.forEach((r, i) => {
      const rank = (i + 1).toString().padStart(4);
      const name = r.name.padEnd(14);
      const latency = `${r.latency}ms`.padEnd(7);
      const block = r.blockNumber.toString().padEnd(10);
      const gas = typeof r.gasPrice === 'string' ? r.gasPrice : `${r.gasPrice} gwei`;
      
      console.log(`${rank} | ${name} | ${latency} | ${block} | ${gas}`);
    });
    
    console.log('');
    console.log('🏆 RECOMMENDED:');
    console.log(`   Primary:   ${available[0].name} (${available[0].latency}ms)`);
    if (available[1]) {
      console.log(`   Secondary: ${available[1].name} (${available[1].latency}ms)`);
    }
    if (available[2]) {
      console.log(`   Tertiary:  ${available[2].name} (${available[2].latency}ms)`);
    }
    
    console.log('');
    console.log('📋 Export these to your .env:');
    console.log(`   export PROVIDER_URL="${available[0].url}"`);
    if (available[1]) {
      console.log(`   export BACKUP_RPC_1="${available[1].url}"`);
    }
    if (available[2]) {
      console.log(`   export BACKUP_RPC_2="${available[2].url}"`);
    }
  }
  
  if (unavailable.length > 0) {
    console.log('');
    console.log('❌ Unavailable RPCs:');
    unavailable.forEach(r => {
      console.log(`   ${r.name}: ${r.error}`);
    });
  }
  
  console.log('');
  console.log('='.repeat(80));
  console.log('');
  console.log('💡 Tips:');
  console.log('   - Use the fastest RPC for time-sensitive operations');
  console.log('   - Configure fallback RPCs in your script');
  console.log('   - Re-run this test periodically as performance varies');
  console.log('   - For production, use paid tiers (Alchemy/Infura) for reliability');
  console.log('');
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
