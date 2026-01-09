# Deployment Workflow Guide

This guide explains how to deploy contracts and maintain the registry.

## Deployment Process

### 1. Prepare Deployment Script

Create a new deployment script in `packages/contracts/script/`:

```solidity
// Example: DeployFhenixPhase1Full.s.sol
contract DeployFhenixPhase1Full is Script {
    function run() public {
        vm.startBroadcast();
        // Deploy contracts...
        vm.stopBroadcast();
    }
}
```

### 2. Execute Deployment

```bash
cd packages/contracts

export FHENIX_PUBLIC_KEY="0x0123456789abcdef..."
export FHENIX_ENCRYPTION_LEVEL="192"

/home/ed/.foundry/bin/forge script script/DeployFhenixPhase1Full.s.sol:DeployFhenixPhase1Full \
  --rpc-url https://rpc-amoy.polygon.technology \
  --private-key 0x413b2ec636f512aee4d5e8d2946d4ec2235edbe162d03c71852052c46bead3a6 \
  --broadcast \
  --gas-price 50000000
```

### 3. Record Deployment

After successful deployment, record it in the registry:

```bash
node scripts/record-deployment.js \
  packages/contracts/broadcast/DeployFhenixPhase1Full.s.sol/80002/run-latest.json \
  amoy \
  fhenix-phase1-full-v1
```

### 4. Verify Contracts

Verify each contract on Polygonscan:

```bash
/home/ed/.foundry/bin/forge verify-contract \
  0xContractAddress \
  src/fhenix/core/ContractName.sol:ContractName \
  --chain-id 80002 \
  --etherscan-api-key B7JT8IGABJBG5RCRQ23U57ZUX9GJZMSZ21
```

### 5. Update Registry

Mark contracts as verified:

```bash
node scripts/update-registry.js mark-verified amoy fhenix-phase1-full-v1 ContractName
```

## Registry Structure

```
registry.json
├── version: "1.0.0"
├── lastUpdated: ISO timestamp
├── networks
│   └── amoy
│       ├── chainId: 80002
│       ├── name: "Polygon Amoy Testnet"
│       └── deployments[]
│           └── deployment
│               ├── id: "fhenix-phase1-minimal-v1"
│               ├── version: "0.2.42"
│               ├── timestamp: ISO timestamp
│               ├── deployer: address
│               ├── contracts[]
│               │   └── contract
│               │       ├── name: "FhenixEncryptionManager"
│               │       ├── address: "0x..."
│               │       ├── deploymentTx: "0x..."
│               │       ├── status: "deployed|pending|failed"
│               │       └── verified: boolean
│               └── status: "active|archived"
└── phases
    └── phase1
        ├── name: "FHENIX Phase 1"
        ├── status: "in-progress|complete"
        ├── deployedContracts: 1
        ├── targetContracts: 7
        └── contracts
            └── ContractName
                ├── status: "deployed|pending"
                ├── address: "0x..."
                └── version: "0.2.42"
```

## Common Tasks

### View Current Status

```bash
node scripts/update-registry.js phase-status
```

Output:
```
Phase 1 Status:

Name: FHENIX Phase 1 - Encryption Infrastructure
Status: in-progress
Progress: 1/7 (14%)

Contracts:
  ✓ FhenixEncryptionManager: 0xcafe3cfad5f4dd86dec1ad25b48382b3fa44cb97
  ○ EncryptedMintCeiling: pending
  ...
```

### List All Deployments

```bash
node scripts/update-registry.js list-deployments amoy
```

### Get Specific Deployment Details

```bash
node scripts/update-registry.js get-deployment amoy fhenix-phase1-minimal-v1
```

### Update Single Contract

```bash
node scripts/update-registry.js update-contract \
  amoy \
  fhenix-phase1-minimal-v1 \
  EncryptedMintCeiling \
  0xNewAddress \
  0xTxHash
```

## Deployment Checklist

- [ ] Create deployment script
- [ ] Set environment variables
- [ ] Execute deployment
- [ ] Verify all transactions succeeded
- [ ] Record deployment: `node scripts/record-deployment.js ...`
- [ ] Verify contracts on Polygonscan
- [ ] Mark as verified: `node scripts/update-registry.js mark-verified ...`
- [ ] Update documentation
- [ ] Commit changes

## Environment Variables

```bash
# Deployment
DEPLOYER_PRIVATE="0x..."
DEPLOYER_ADDRS="0x..."

# FHENIX Configuration
FHENIX_PUBLIC_KEY="0x..."
FHENIX_ENCRYPTION_LEVEL="192"
FHENIX_DECRYPTION_THRESHOLD="1"
FHENIX_ENCRYPTED_PATH_ENABLED="false"

# Verification
ETHERSCAN_API_KEY="..."

# Registry
VERSION="0.2.42"
NOTES="Deployment notes"
```

## Troubleshooting

### Deployment Failed

1. Check gas price: `cast gas-price --rpc-url https://rpc-amoy.polygon.technology`
2. Check balance: `cast balance 0xAddress --rpc-url https://rpc-amoy.polygon.technology`
3. Get testnet MATIC: https://faucet.polygon.technology/

### Registry Update Failed

1. Verify broadcast file exists
2. Check JSON format: `jq . packages/contracts/broadcast/.../run-latest.json`
3. Ensure registry.json is valid: `jq . packages/contracts/deployments/registry.json`

### Contract Verification Failed

1. Wait 1-2 minutes after deployment
2. Check contract code matches source
3. Verify constructor arguments
4. Try manual verification on Polygonscan

## Files

- **Registry**: `packages/contracts/deployments/registry.json`
- **Update Script**: `scripts/update-registry.js`
- **Record Script**: `scripts/record-deployment.js`
- **Deployment Scripts**: `packages/contracts/script/Deploy*.s.sol`
- **Documentation**: `DEPLOYMENT_REGISTRY.md`, `DEPLOYMENT_WORKFLOW.md`

---

**Version**: 1.0.0  
**Last Updated**: January 9, 2026
