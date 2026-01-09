#!/usr/bin/env node

/**
 * Registry Update Script
 * Manages deployment registry and versioning
 * 
 * Usage:
 *   node scripts/update-registry.js add-deployment <network> <deploymentId> <contractsJson>
 *   node scripts/update-registry.js update-contract <network> <contractName> <address>
 *   node scripts/update-registry.js mark-verified <network> <contractName>
 *   node scripts/update-registry.js get-deployment <network> <deploymentId>
 *   node scripts/update-registry.js list-deployments <network>
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
  console.log('✓ Registry updated');
}

function updateTimestamp(registry) {
  registry.lastUpdated = new Date().toISOString();
  return registry;
}

function addDeployment(network, deploymentId, contractsJson) {
  const registry = loadRegistry();
  
  if (!registry.networks[network]) {
    throw new Error(`Network ${network} not found in registry`);
  }

  const contracts = typeof contractsJson === 'string' ? JSON.parse(contractsJson) : contractsJson;
  
  const deployment = {
    id: deploymentId,
    version: process.env.VERSION || '0.2.42',
    timestamp: new Date().toISOString(),
    deployer: process.env.DEPLOYER || '0x0000000000000000000000000000000000000000',
    contracts: contracts,
    status: 'active',
    notes: process.env.NOTES || ''
  };

  registry.networks[network].deployments.push(deployment);
  registry = updateTimestamp(registry);
  saveRegistry(registry);
  
  console.log(`✓ Deployment ${deploymentId} added to ${network}`);
  return deployment;
}

function updateContract(network, deploymentId, contractName, address, txHash) {
  const registry = loadRegistry();
  
  if (!registry.networks[network]) {
    throw new Error(`Network ${network} not found`);
  }

  const deployment = registry.networks[network].deployments.find(d => d.id === deploymentId);
  if (!deployment) {
    throw new Error(`Deployment ${deploymentId} not found`);
  }

  let contract = deployment.contracts.find(c => c.name === contractName);
  if (!contract) {
    contract = {
      name: contractName,
      address: null,
      deploymentTx: null,
      status: 'pending',
      verified: false
    };
    deployment.contracts.push(contract);
  }

  contract.address = address;
  if (txHash) contract.deploymentTx = txHash;
  contract.status = 'deployed';

  // Update phase tracking
  if (registry.phases.phase1.contracts[contractName]) {
    registry.phases.phase1.contracts[contractName].status = 'deployed';
    registry.phases.phase1.contracts[contractName].address = address;
    
    const deployed = Object.values(registry.phases.phase1.contracts).filter(c => c.status === 'deployed').length;
    registry.phases.phase1.deployedContracts = deployed;
    registry.phases.phase1.completionPercentage = Math.round((deployed / registry.phases.phase1.targetContracts) * 100);
  }

  registry = updateTimestamp(registry);
  saveRegistry(registry);
  
  console.log(`✓ Contract ${contractName} updated: ${address}`);
  return contract;
}

function markVerified(network, deploymentId, contractName) {
  const registry = loadRegistry();
  
  if (!registry.networks[network]) {
    throw new Error(`Network ${network} not found`);
  }

  const deployment = registry.networks[network].deployments.find(d => d.id === deploymentId);
  if (!deployment) {
    throw new Error(`Deployment ${deploymentId} not found`);
  }

  const contract = deployment.contracts.find(c => c.name === contractName);
  if (!contract) {
    throw new Error(`Contract ${contractName} not found in deployment`);
  }

  contract.verified = true;
  registry = updateTimestamp(registry);
  saveRegistry(registry);
  
  console.log(`✓ Contract ${contractName} marked as verified`);
  return contract;
}

function getDeployment(network, deploymentId) {
  const registry = loadRegistry();
  
  if (!registry.networks[network]) {
    throw new Error(`Network ${network} not found`);
  }

  const deployment = registry.networks[network].deployments.find(d => d.id === deploymentId);
  if (!deployment) {
    throw new Error(`Deployment ${deploymentId} not found`);
  }

  console.log(JSON.stringify(deployment, null, 2));
  return deployment;
}

function listDeployments(network) {
  const registry = loadRegistry();
  
  if (!registry.networks[network]) {
    throw new Error(`Network ${network} not found`);
  }

  const deployments = registry.networks[network].deployments;
  console.log(`\nDeployments on ${network}:\n`);
  
  deployments.forEach(d => {
    console.log(`ID: ${d.id}`);
    console.log(`Version: ${d.version}`);
    console.log(`Status: ${d.status}`);
    console.log(`Timestamp: ${d.timestamp}`);
    console.log(`Contracts: ${d.contracts.length}`);
    d.contracts.forEach(c => {
      console.log(`  - ${c.name}: ${c.address || 'pending'} (${c.status})`);
    });
    console.log('');
  });
}

function getPhaseStatus() {
  const registry = loadRegistry();
  const phase = registry.phases.phase1;
  
  console.log(`\nPhase 1 Status:\n`);
  console.log(`Name: ${phase.name}`);
  console.log(`Status: ${phase.status}`);
  console.log(`Progress: ${phase.deployedContracts}/${phase.targetContracts} (${phase.completionPercentage}%)\n`);
  
  console.log('Contracts:');
  Object.entries(phase.contracts).forEach(([name, contract]) => {
    const status = contract.status === 'deployed' ? '✓' : '○';
    console.log(`  ${status} ${name}: ${contract.address || 'pending'}`);
  });
}

// CLI
const command = process.argv[2];
const args = process.argv.slice(3);

try {
  switch (command) {
    case 'add-deployment':
      addDeployment(args[0], args[1], args[2]);
      break;
    case 'update-contract':
      updateContract(args[0], args[1], args[2], args[3], args[4]);
      break;
    case 'mark-verified':
      markVerified(args[0], args[1], args[2]);
      break;
    case 'get-deployment':
      getDeployment(args[0], args[1]);
      break;
    case 'list-deployments':
      listDeployments(args[0]);
      break;
    case 'phase-status':
      getPhaseStatus();
      break;
    default:
      console.log(`
Usage:
  node scripts/update-registry.js add-deployment <network> <deploymentId> <contractsJson>
  node scripts/update-registry.js update-contract <network> <deploymentId> <contractName> <address> [txHash]
  node scripts/update-registry.js mark-verified <network> <deploymentId> <contractName>
  node scripts/update-registry.js get-deployment <network> <deploymentId>
  node scripts/update-registry.js list-deployments <network>
  node scripts/update-registry.js phase-status
      `);
  }
} catch (error) {
  console.error(`✗ Error: ${error.message}`);
  process.exit(1);
}
