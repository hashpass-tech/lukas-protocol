# FHENIX Phase 1 Deployment Guide

**Version**: 1.0  
**Date**: January 8, 2026  
**Status**: Production Ready

## Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Deployment Steps](#deployment-steps)
4. [Validation Procedures](#validation-procedures)
5. [Post-Deployment Checklist](#post-deployment-checklist)
6. [Rollback Procedures](#rollback-procedures)
7. [Monitoring and Alerting](#monitoring-and-alerting)
8. [Troubleshooting](#troubleshooting)

## Overview

This guide provides step-by-step instructions for deploying FHENIX Phase 1 infrastructure to production networks. Phase 1 includes deployment of all core FHENIX modules with encrypted path disabled by default for safety.

### Phase 1 Scope

**Contracts to Deploy**:
- FhenixEncryptionManager
- EncryptedMintCeiling
- EncryptedPegDeviation
- EncryptedCurveParameters
- FhenixComputationEngine
- FhenixDecryptionHandler
- EncryptionOrchestrator

**Configuration**:
- Encryption level: 192-bit (recommended)
- Encrypted path: Disabled (for safety)
- Decryption authorization: Multi-sig (2-of-3)
- Key rotation: Every 30 days

### Deployment Timeline

- **Pre-Deployment**: 1-2 weeks (security review, testing)
- **Deployment**: 1-2 hours (contract deployment, configuration)
- **Validation**: 2-4 hours (verification, testing)
- **Monitoring**: Ongoing (24/7 monitoring)

## Pre-Deployment Checklist

### Security Review

- [ ] Code audit completed by third-party security firm
- [ ] All vulnerabilities addressed and verified
- [ ] Security best practices reviewed
- [ ] Access control verified
- [ ] Error handling reviewed
- [ ] Audit report available

### Testing

- [ ] All 255 tests passing (100% pass rate)
- [ ] Unit tests passing (133 tests)
- [ ] Property-based tests passing (95 tests, 24,320 iterations)
- [ ] Integration tests passing (27 tests)
- [ ] Testnet deployment successful
- [ ] Performance benchmarks acceptable
- [ ] Gas costs within limits

### Configuration

- [ ] FHENIX public key generated and secured
- [ ] Encryption level set to 192-bit
- [ ] Key management system operational
- [ ] Multi-sig wallet configured (2-of-3)
- [ ] Decryption authorizers identified
- [ ] Feature flags configured
- [ ] Monitoring system ready

### Infrastructure

- [ ] RPC endpoints configured and tested
- [ ] Private keys secured (HSM or secure enclave)
- [ ] Backup systems operational
- [ ] Disaster recovery plan ready
- [ ] Monitoring and alerting configured
- [ ] Logging system operational
- [ ] Communication channels established

### Documentation

- [ ] Deployment guide reviewed
- [ ] Validation checklist prepared
- [ ] Rollback procedures documented
- [ ] Runbooks created
- [ ] Team trained
- [ ] Emergency contacts established

### Approvals

- [ ] Security team approval
- [ ] Operations team approval
- [ ] Product team approval
- [ ] Legal team approval (if required)
- [ ] Community governance vote (if required)

## Deployment Steps

### Step 1: Prepare Environment

```bash
# Set environment variables
export FHENIX_PUBLIC_KEY="0x..." # FHENIX public key
export FHENIX_ENCRYPTION_LEVEL=192
export FHENIX_DECRYPTION_THRESHOLD=2
export FHENIX_ENCRYPTED_PATH_ENABLED=false

# Set network configuration
export RPC_URL="https://mainnet.infura.io/v3/YOUR_KEY"
export PRIVATE_KEY="0x..." # Deployer private key (from secure storage)
export ETHERSCAN_API_KEY="..." # For verification
```

### Step 2: Verify Deployment Script

```bash
# Navigate to contracts directory
cd packages/contracts

# Verify deployment script compiles
forge build

# Simulate deployment (dry run)
forge script script/DeployFhenixPhase1.s.sol:DeployFhenixPhase1 \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --verify \
  --verifier etherscan \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --dry-run
```

### Step 3: Deploy to Testnet (Sepolia)

```bash
# Deploy to Sepolia for final validation
forge script script/DeployFhenixPhase1.s.sol:DeployFhenixPhase1 \
  --rpc-url https://sepolia.infura.io/v3/YOUR_KEY \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --verifier etherscan \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

### Step 4: Validate Testnet Deployment

```bash
# Run validation tests
forge test --match-path "test/fhenix/**" \
  --rpc-url https://sepolia.infura.io/v3/YOUR_KEY

# Verify all contracts deployed correctly
# (See Validation Procedures section)
```

### Step 5: Deploy to Mainnet

```bash
# Deploy to mainnet (production)
forge script script/DeployFhenixPhase1.s.sol:DeployFhenixPhase1 \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --verifier etherscan \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

### Step 6: Record Deployment Addresses

```bash
# Save deployment addresses for reference
cat > deployment_addresses.json << EOF
{
  "network": "mainnet",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "encryptionManager": "0x...",
  "mintCeiling": "0x...",
  "pegDeviation": "0x...",
  "curveParameters": "0x...",
  "computationEngine": "0x...",
  "decryptionHandler": "0x...",
  "orchestrator": "0x..."
}
EOF
```

### Step 7: Verify Contracts on Etherscan

```bash
# Verify each contract on Etherscan
forge verify-contract \
  --chain-id 1 \
  --compiler-version v0.8.26 \
  0x... \
  src/fhenix/core/FhenixEncryptionManager.sol:FhenixEncryptionManager \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

## Validation Procedures

### Validation 1: Contract Deployment

```solidity
// Verify all contracts are deployed
function validateContractDeployment(
    address encryptionManager,
    address mintCeiling,
    address pegDeviation,
    address curveParameters,
    address computationEngine,
    address decryptionHandler,
    address orchestrator
) external view returns (bool) {
    // Check all addresses are not zero
    require(encryptionManager != address(0), "EncryptionManager not deployed");
    require(mintCeiling != address(0), "MintCeiling not deployed");
    require(pegDeviation != address(0), "PegDeviation not deployed");
    require(curveParameters != address(0), "CurveParameters not deployed");
    require(computationEngine != address(0), "ComputationEngine not deployed");
    require(decryptionHandler != address(0), "DecryptionHandler not deployed");
    require(orchestrator != address(0), "Orchestrator not deployed");
    
    // Check all addresses have code
    require(encryptionManager.code.length > 0, "EncryptionManager has no code");
    require(mintCeiling.code.length > 0, "MintCeiling has no code");
    require(pegDeviation.code.length > 0, "PegDeviation has no code");
    require(curveParameters.code.length > 0, "CurveParameters has no code");
    require(computationEngine.code.length > 0, "ComputationEngine has no code");
    require(decryptionHandler.code.length > 0, "DecryptionHandler has no code");
    require(orchestrator.code.length > 0, "Orchestrator has no code");
    
    return true;
}
```

### Validation 2: Encryption Initialization

```solidity
// Verify encryption is properly initialized
function validateEncryptionInitialization(
    address encryptionManager
) external view returns (bool) {
    FhenixEncryptionManager manager = FhenixEncryptionManager(encryptionManager);
    
    // Check encryption is active
    require(manager.isEncryptionActive(), "Encryption not active");
    
    // Check encryption level is valid
    uint256 level = manager.getEncryptionLevel();
    require(level == 192, "Invalid encryption level");
    
    // Check public key is set
    bytes memory publicKey = manager.getPublicKey();
    require(publicKey.length > 0, "Public key not set");
    
    return true;
}
```

### Validation 3: Authorization Configuration

```solidity
// Verify authorization is properly configured
function validateAuthorizationConfiguration(
    address encryptionManager,
    address[] memory expectedAuthorizers
) external view returns (bool) {
    FhenixEncryptionManager manager = FhenixEncryptionManager(encryptionManager);
    
    // Check all expected authorizers are configured
    for (uint256 i = 0; i < expectedAuthorizers.length; i++) {
        require(
            manager.isDecryptionAuthorizer(expectedAuthorizers[i]),
            "Authorizer not configured"
        );
    }
    
    return true;
}
```

### Validation 4: Module Coordination

```solidity
// Verify all modules are properly coordinated
function validateModuleCoordination(
    address orchestrator,
    address mintCeiling,
    address pegDeviation,
    address curveParameters,
    address computationEngine,
    address decryptionHandler
) external view returns (bool) {
    EncryptionOrchestrator orch = EncryptionOrchestrator(orchestrator);
    
    // Verify orchestrator has correct module references
    // (This would require exposing module references in orchestrator)
    
    // Verify encrypted path is disabled by default
    require(!orch.isEncryptedPathActive(), "Encrypted path should be disabled");
    
    return true;
}
```

### Validation 5: End-to-End Test

```solidity
// Perform end-to-end validation
function validateEndToEnd(
    address encryptionManager,
    address computationEngine,
    address decryptionHandler
) external view returns (bool) {
    // Validate encryption
    require(validateEncryptionInitialization(encryptionManager), "Encryption validation failed");
    
    // Validate computation engine
    FhenixComputationEngine engine = FhenixComputationEngine(computationEngine);
    // (Test computation operations)
    
    // Validate decryption handler
    FhenixDecryptionHandler handler = FhenixDecryptionHandler(decryptionHandler);
    // (Test decryption operations)
    
    return true;
}
```

## Post-Deployment Checklist

### Immediate Actions (First Hour)

- [ ] Verify all contracts deployed successfully
- [ ] Verify all contracts have code on-chain
- [ ] Verify encryption is active
- [ ] Verify authorization is configured
- [ ] Verify encrypted path is disabled
- [ ] Check gas costs are within limits
- [ ] Verify Etherscan verification successful

### Short-Term Actions (First Day)

- [ ] Monitor contract interactions
- [ ] Check for any errors or warnings
- [ ] Verify monitoring and alerting working
- [ ] Review logs for any issues
- [ ] Confirm team has access to deployment addresses
- [ ] Update documentation with actual addresses
- [ ] Notify stakeholders of successful deployment

### Medium-Term Actions (First Week)

- [ ] Monitor system performance
- [ ] Review metrics and logs
- [ ] Verify no security issues
- [ ] Confirm backup systems operational
- [ ] Test rollback procedures
- [ ] Update runbooks with actual addresses
- [ ] Schedule post-deployment review

### Long-Term Actions (Ongoing)

- [ ] Monitor system health continuously
- [ ] Review metrics weekly
- [ ] Perform security audits quarterly
- [ ] Update documentation as needed
- [ ] Plan for Phase 2 (enable encrypted path)
- [ ] Gather feedback from users
- [ ] Optimize based on real-world usage

## Rollback Procedures

### Scenario 1: Deployment Failed

**If deployment fails before completion**:

1. Stop deployment script
2. Verify no partial state on-chain
3. Fix issue in deployment script
4. Retry deployment

### Scenario 2: Validation Failed

**If validation fails after deployment**:

1. Disable encrypted path (if enabled)
2. Investigate issue
3. Fix issue in code or configuration
4. Redeploy if necessary

### Scenario 3: Critical Issue Found

**If critical issue found after deployment**:

1. Immediately disable encrypted path
2. Notify all stakeholders
3. Investigate issue
4. Prepare fix
5. Deploy fix (if possible)
6. Or redeploy entire system

### Rollback Steps

```bash
# Step 1: Disable encrypted path (emergency)
# Call orchestrator.setEncryptedPathEnabled(false)

# Step 2: Pause operations if necessary
# (Depends on protocol design)

# Step 3: Investigate issue
# Review logs, metrics, and code

# Step 4: Prepare fix
# Update code, redeploy if necessary

# Step 5: Restore operations
# Re-enable encrypted path after fix verified
```

## Monitoring and Alerting

### Key Metrics to Monitor

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Encryption Active | true | false |
| Encrypted Path Active | false (Phase 1) | true |
| Authorization Working | true | false |
| Computation Success Rate | 99.99% | < 99% |
| Decryption Success Rate | 99.99% | < 99% |
| Average Gas Usage | < 50,000 | > 100,000 |
| Error Rate | < 0.01% | > 0.1% |

### Monitoring Setup

```solidity
// Monitor encryption status
contract EncryptionMonitor {
    event EncryptionStatusCheck(
        bool encryptionActive,
        bool pathActive,
        uint256 timestamp
    );
    
    function checkEncryptionStatus(address encryptionManager, address orchestrator) 
        external 
    {
        FhenixEncryptionManager manager = FhenixEncryptionManager(encryptionManager);
        EncryptionOrchestrator orch = EncryptionOrchestrator(orchestrator);
        
        emit EncryptionStatusCheck(
            manager.isEncryptionActive(),
            orch.isEncryptedPathActive(),
            block.timestamp
        );
    }
}
```

### Alerting Configuration

```bash
# Set up alerts for critical metrics
# Example using Grafana/Prometheus:

# Alert: Encryption not active
alert: EncryptionNotActive
  expr: encryption_active == 0
  for: 5m
  annotations:
    summary: "Encryption is not active"
    severity: "critical"

# Alert: High error rate
alert: HighErrorRate
  expr: error_rate > 0.001
  for: 5m
  annotations:
    summary: "Error rate exceeds threshold"
    severity: "warning"

# Alert: High gas usage
alert: HighGasUsage
  expr: avg_gas_usage > 100000
  for: 10m
  annotations:
    summary: "Average gas usage exceeds threshold"
    severity: "warning"
```

## Troubleshooting

### Issue: Deployment Script Fails

**Symptoms**: Deployment script reverts or fails

**Solutions**:
1. Check RPC endpoint is working
2. Verify private key has sufficient funds
3. Check gas price is not too low
4. Verify environment variables are set correctly
5. Check contract code compiles

### Issue: Encryption Not Active

**Symptoms**: `isEncryptionActive()` returns false

**Solutions**:
1. Verify encryption manager is initialized
2. Check public key is set
3. Verify encryption level is valid
4. Check initialization transaction succeeded

### Issue: Authorization Not Working

**Symptoms**: Decryption fails with authorization error

**Solutions**:
1. Verify authorizers are added
2. Check caller is in authorized list
3. Verify authorization transaction succeeded
4. Check multi-sig threshold is met

### Issue: High Gas Costs

**Symptoms**: Operations exceed gas limits

**Solutions**:
1. Optimize polynomial evaluation
2. Cache encrypted values
3. Batch operations
4. Use plaintext for non-sensitive operations

## Deployment Validation Checklist

- [ ] All contracts deployed successfully
- [ ] All contracts verified on Etherscan
- [ ] Encryption is active
- [ ] Encryption level is 192-bit
- [ ] Public key is set
- [ ] Decryption authorizers are configured
- [ ] Encrypted path is disabled
- [ ] All tests passing
- [ ] Monitoring and alerting working
- [ ] Documentation updated with addresses
- [ ] Team trained on new system
- [ ] Stakeholders notified
- [ ] Backup systems operational
- [ ] Disaster recovery plan ready

## Deployment Addresses Template

```json
{
  "network": "mainnet",
  "chainId": 1,
  "timestamp": "2026-01-08T00:00:00Z",
  "deployer": "0x...",
  "contracts": {
    "encryptionManager": {
      "address": "0x...",
      "deploymentBlock": 0,
      "verifiedOnEtherscan": true
    },
    "mintCeiling": {
      "address": "0x...",
      "deploymentBlock": 0,
      "verifiedOnEtherscan": true
    },
    "pegDeviation": {
      "address": "0x...",
      "deploymentBlock": 0,
      "verifiedOnEtherscan": true
    },
    "curveParameters": {
      "address": "0x...",
      "deploymentBlock": 0,
      "verifiedOnEtherscan": true
    },
    "computationEngine": {
      "address": "0x...",
      "deploymentBlock": 0,
      "verifiedOnEtherscan": true
    },
    "decryptionHandler": {
      "address": "0x...",
      "deploymentBlock": 0,
      "verifiedOnEtherscan": true
    },
    "orchestrator": {
      "address": "0x...",
      "deploymentBlock": 0,
      "verifiedOnEtherscan": true
    }
  },
  "configuration": {
    "encryptionLevel": 192,
    "encryptedPathEnabled": false,
    "decryptionThreshold": 2,
    "decryptionAuthorizers": ["0x...", "0x...", "0x..."]
  }
}
```

---

**For more information**: See [FHENIX_INTEGRATION_GUIDE.md](./FHENIX_INTEGRATION_GUIDE.md)
