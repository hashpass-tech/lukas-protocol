#!/usr/bin/env node

/**
 * Record Deployment Script
 * Automatically extracts deployment data from forge broadcast files
 * and updates the registry
 * 
 * Usage:
 *   node scripts/record-deployment.js <broadcastJsonPath> <network> <deploymentId>
 * 
 * Example:
 *   node scripts/record-deployment.js packages/contracts/broadcast/DeployFhenixMinimal.s.sol/80002/run-latest.json amoy fhenix-phase1-minimal-v1
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../packages/contracts/deployments/registry.json');

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error(`Registry not found at ${REGISTRY_PATH}`);
  }
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

function saveRegistry(registry) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

function extractDeploymentData(broadcastPath) {
  if (!fs.existsSync(broadcastPath)) {
    throw new Error(`Broadcast file not found: ${broadcastPath}`);
  }

  const broadcast = JSON.parse(fs.readFileSync(broadcastPath, 'utf8'));
  const contracts = [];

  // Extract contract deployments from transactions
  broadcast.transactions.forEach((tx, index) => {
    if (tx.transactionType === 'CREATE') {
      contracts.push({
        name: tx.contractName,
        address: tx.contractAddress,
        deploymentTx: tx.hash,
        blockNumber: broadcast.receipts[index]?.blockNumber ? parseInt(broadcast.receipts[index].blockNumber, 16) : null,
        gasUsed: broadcast.receipts[index]?.gasUsed ? parseInt(broadcast.receipts[index].gasUsed, 16) : null,
        status: broadcast.receipts[index]?.status === '0x1' ? 'deployed' : 'failed',
        verified: false
      });
    }
  });

  return {
    contracts,
    timestamp: new Date(broadcast.timestamp).toISOString(),
    chain: broadcast.chain
  };
}

function recordDeployment(broadcastPath, network, deploymentId) {
  const registry = loadRegistry();
  
  if (!registry.networks[network]) {
    throw new Error(`Network ${network} not found in registry`);
  }

  // Extract data from broadcast
  const deploymentData = extractDeploymentData(broadcastPath);
  
  // Check if deployment already exists
  const existingDeployment = registry.networks[network].deployments.find(d => d.id === deploymentId);
  
  if (existingDeployment) {
    // Update existing deployment
    console.log(`Updating existing deployment: ${deploymentId}`);
    existingDeployment.contracts = deploymentData.contracts;
    existingDeployment.timestamp = deploymentData.timestamp;
  } else {
    // Create new deployment
    console.log(`Creating new deployment: ${deploymentId}`);
    const deployment = {
      id: deploymentId,
      version: process.env.VERSION || '0.2.42',
      timestamp: deploymentData.timestamp,
      deployer: process.env.DEPLOYER || '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9',
      contracts: deploymentData.contracts,
      status: 'active',
      notes: process.env.NOTES || 'Recorded from forge broadcast'
    };
    registry.networks[network].deployments.push(deployment);
  }

  // Update phase tracking
  if (registry.phases.phase1) {
    deploymentData.contracts.forEach(contract => {
      if (registry.phases.phase1.contracts[contract.name]) {
        registry.phases.phase1.contracts[contract.name].status = contract.status;
        registry.phases.phase1.contracts[contract.name].address = contract.address;
      }
    });

    const deployed = Object.values(registry.phases.phase1.contracts)
      .filter(c => c.status === 'deployed').length;
    registry.phases.phase1.deployedContracts = deployed;
    registry.phases.phase1.completionPercentage = Math.round(
      (deployed / registry.phases.phase1.targetContracts) * 100
    );
  }

  registry.lastUpdated = new Date().toISOString();
  saveRegistry(registry);

  // Print summary
  console.log(`\n✓ Deployment recorded: ${deploymentId}`);
  console.log(`Network: ${network}`);
  console.log(`Contracts deployed: ${deploymentData.contracts.length}`);
  deploymentData.contracts.forEach(c => {
    console.log(`  - ${c.name}: ${c.address}`);
  });
  
  if (registry.phases.phase1) {
    console.log(`\nPhase 1 Progress: ${registry.phases.phase1.deployedContracts}/${registry.phases.phase1.targetContracts} (${registry.phases.phase1.completionPercentage}%)`);
  }
}

// CLI
const broadcastPath = process.argv[2];
const network = process.argv[3];
const deploymentId = process.argv[4];

if (!broadcastPath || !network || !deploymentId) {
  console.log(`
Usage:
  node scripts/record-deployment.js <broadcastJsonPath> <network> <deploymentId>

Example:
  node scripts/record-deployment.js packages/contracts/broadcast/DeployFhenixMinimal.s.sol/80002/run-latest.json amoy fhenix-phase1-minimal-v1
  `);
  process.exit(1);
}

try {
  recordDeployment(broadcastPath, network, deploymentId);
} catch (error) {
  console.error(`✗ Error: ${error.message}`);
  process.exit(1);
}
