# FHENIX Phase 1 Deployment Guide - Polygon Amoy Testnet

**Status**: Ready for Deployment  
**Target Network**: Polygon Amoy Testnet (Chain ID: 80002)  
**Date**: January 9, 2026  
**Version**: 0.2.42

---

## Overview

This guide provides step-by-step instructions for deploying the FHENIX Phase 1 encrypted stabilization infrastructure to Polygon Amoy testnet. This is the critical minimal deployment for privacy-preserving parameter management.

### What is FHENIX Phase 1?

FHENIX Phase 1 introduces encrypted parameter management for the LUKAS protocol:

- **FhenixEncryptionManager**: Manages encryption keys and lifecycle
- **EncryptedMintCeiling**: Encrypted supply limit parameter
- **EncryptedPegDeviation**: Encrypted sensitivity parameter  
- **EncryptedCurveParameters**: Encrypted stabilization curve coefficients
- **FhenixComputationEngine**: Homomorphic operations (add, multiply, compare, polynomial eval)
- **FhenixDecryptionHandler**: Multi-sig decryption with authorization
- **EncryptionOrchestrator**: Coordinated encrypted parameter routing
- **EncryptedParameterProxy**: Modular upgrade pattern

---

## Prerequisites

### 1. Environment Setup

```bash
# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Navigate to contracts directory
cd packages/contracts

# Install dependencies
forge install
```

### 2. Environment Variables

Create or update `.env` file in `packages/contracts/`:

```bash
# Polygon Amoy RPC
AMOY_RPC_URL="https://rpc-amoy.polygon.technology"

# Deployer private key (with testnet MATIC)
PRIVATE_KEY="your_deployer_private_key_here"

# Etherscan API key (for verification)
ETHERSCAN_API_KEY="your_polygonscan_api_key"

# FHENIX Configuration
FHENIX_PUBLIC_KEY="0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
FHENIX_ENCRYPTION_LEVEL="192"  # 128, 192, or 256
FHENIX_DECRYPTION_THRESHOLD="1"
FHENIX_ENCRYPTED_PATH_ENABLED="false"  # Start with false for safety
```

### 3. Get Testnet MATIC

Get testnet MATIC from the [Polygon Faucet](https://faucet.polygon.technology/):
- Select "Polygon Amoy"
- Enter your wallet address
- Receive 0.5 MATIC

---

## Deployment Steps

### Step 1: Verify Contracts Compile

```bash
# Compile all contracts
forge build

# Expected output:
# Compiling 45 files with 0.8.26
# Compilation successful!
```

### Step 2: Deploy FHENIX Phase 1

```bash
# Deploy to Amoy testnet
forge script script/DeployFhenixPhase1.s.sol:DeployFhenixPhase1 \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Expected output:
# ==== FHENIX Phase 1 Deployment ====
# Deployer: 0x...
# Encryption Level: 192
# 
# Step 1: Deploying FhenixEncryptionManager...
#   Deployed at: 0x...
# Step 2: Deploying parameter modules...
#   EncryptedMintCeiling deployed at: 0x...
#   EncryptedPegDeviation deployed at: 0x...
#   EncryptedCurveParameters deployed at: 0x...
# Step 3: Deploying FhenixComputationEngine...
#   Deployed at: 0x...
# Step 4: Deploying FhenixDecryptionHandler...
#   Deployed at: 0x...
# Step 5: Deploying EncryptionOrchestrator...
#   Deployed at: 0x...
# Step 6: Initializing encryption manager...
#   Encryption initialized with level: 192
# ...
# ==== Deployment Complete ====
```

### Step 3: Record Deployment Addresses

Save the deployed contract addresses from the output:

```json
{
  "network": "amoy",
  "chainId": 80002,
  "deploymentDate": "2026-01-09",
  "fhenixPhase1": {
    "encryptionManager": "0x...",
    "mintCeiling": "0x...",
    "pegDeviation": "0x...",
    "curveParameters": "0x...",
    "computationEngine": "0x...",
    "decryptionHandler": "0x...",
    "orchestrator": "0x...",
    "deploymentBlock": 12345678
  }
}
```

### Step 4: Verify Deployment

```bash
# Check encryption manager initialization
cast call 0x<ENCRYPTION_MANAGER_ADDRESS> "isInitialized()" \
  --rpc-url $AMOY_RPC_URL

# Expected output: 0x0000000000000000000000000000000000000000000000000000000000000001
# (true = 1)

# Check orchestrator status
cast call 0x<ORCHESTRATOR_ADDRESS> "isEncryptedPathEnabled()" \
  --rpc-url $AMOY_RPC_URL

# Expected output: 0x0000000000000000000000000000000000000000000000000000000000000000
# (false = 0, as per default configuration)
```

### Step 5: Deploy Minimal Oracle & Vault (Optional)

For testing the full integration, also deploy the minimal oracle and vault:

```bash
forge script script/DeployMinimalAmoy.s.sol:DeployMinimalAmoy \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# This deploys:
# - LatAmBasketIndex (mock oracle)
# - StabilizerVault (minimal vault)
```

---

## Post-Deployment Verification

### 1. Check Contract Sizes

```bash
# Verify no contracts exceed EIP-170 size limit (24KB)
forge build --sizes

# Expected: All contracts should be < 24KB
```

### 2. Verify on Polygonscan

Visit [Amoy Polygonscan](https://amoy.polygonscan.com/) and search for each contract address:

- ✅ Verify source code matches
- ✅ Check constructor arguments
- ✅ Confirm contract creation transaction

### 3. Test Encryption Manager

```bash
# Get encryption level
cast call 0x<ENCRYPTION_MANAGER_ADDRESS> "getEncryptionLevel()" \
  --rpc-url $AMOY_RPC_URL

# Expected: 192 (or configured level)

# Get public key
cast call 0x<ENCRYPTION_MANAGER_ADDRESS> "getPublicKey()" \
  --rpc-url $AMOY_RPC_URL

# Expected: 0x0123456789abcdef... (configured public key)
```

### 4. Test Computation Engine

```bash
# Test homomorphic addition
cast call 0x<COMPUTATION_ENGINE_ADDRESS> "add(uint256,uint256)" 100 200 \
  --rpc-url $AMOY_RPC_URL

# Expected: 300
```

---

## Integration with Existing Contracts

### Connect to LukasToken

```bash
# Get LukasToken address (already deployed on Amoy)
LUKAS_TOKEN="0xAeE0F26589a21BA4547765F630075262f330F1CB"

# Verify token exists
cast call $LUKAS_TOKEN "name()" --rpc-url $AMOY_RPC_URL
# Expected: "Lukas Token"
```

### Connect to StabilizerVault

```bash
# If deploying vault, set encryption manager as authorized
cast send 0x<VAULT_ADDRESS> "setEncryptionManager(address)" \
  0x<ENCRYPTION_MANAGER_ADDRESS> \
  --rpc-url $AMOY_RPC_URL \
  --private-key $PRIVATE_KEY
```

---

## Configuration Options

### Encryption Levels

| Level | Security | Performance | Use Case |
|-------|----------|-------------|----------|
| 128   | Standard | Fast        | Testing  |
| 192   | Strong   | Balanced    | **Recommended** |
| 256   | Maximum  | Slower      | Production |

### Decryption Threshold

- **1**: Single signature (fast, less secure)
- **2-3**: Multi-sig (balanced)
- **5+**: High security (slower)

### Encrypted Path

- **false**: Disabled (safe for testing)
- **true**: Enabled (production ready)

---

## Troubleshooting

### Issue: "Insufficient balance"

**Solution**: Get more testnet MATIC from [Polygon Faucet](https://faucet.polygon.technology/)

### Issue: "Contract size exceeds EIP-170"

**Solution**: This is expected for libraries. Only deployed contracts matter.

### Issue: "Verification failed"

**Solution**: 
```bash
# Manually verify on Polygonscan
# 1. Go to contract page
# 2. Click "Verify and Publish"
# 3. Select Solidity compiler version: 0.8.26
# 4. Paste source code
# 5. Submit
```

### Issue: "Encryption initialization failed"

**Solution**: Check that public key is valid hex format:
```bash
# Verify public key format
echo $FHENIX_PUBLIC_KEY | grep -E '^0x[0-9a-fA-F]{64}$'
# Should match without error
```

---

## Next Steps

### Phase 2: Integration Testing

1. Deploy test harness contracts
2. Test encrypted parameter updates
3. Verify homomorphic computations
4. Test decryption authorization

### Phase 3: Mainnet Preparation

1. Audit FHENIX contracts
2. Formal verification (optional)
3. Security review
4. Mainnet deployment plan

### Phase 4: Production Deployment

1. Deploy to Polygon mainnet
2. Deploy to other chains (Ethereum, Arbitrum, etc.)
3. Enable encrypted path in production
4. Monitor and maintain

---

## Security Considerations

### ✅ Implemented

- Solidity 0.8.26 (overflow protection)
- Access control on all sensitive functions
- Reentrancy guards in place
- Encryption key management
- Multi-sig decryption support

### ⏳ Recommended Before Mainnet

- [ ] Full security audit
- [ ] Formal verification of encryption logic
- [ ] Penetration testing
- [ ] Code review by cryptography experts
- [ ] Insurance coverage

---

## Support & Resources

### Documentation

- [FHENIX Architecture](../src/fhenix/README.md)
- [Encryption Manager API](../src/fhenix/core/FhenixEncryptionManager.sol)
- [Computation Engine Guide](../src/fhenix/core/FhenixComputationEngine.sol)
- [Orchestrator Integration](../src/fhenix/orchestration/EncryptionOrchestrator.sol)

### External Resources

- [Polygon Amoy Testnet](https://amoy.polygonscan.com/)
- [Polygon Faucet](https://faucet.polygon.technology/)
- [Foundry Documentation](https://book.getfoundry.sh/)
- [Solidity Documentation](https://docs.soliditylang.org/)

### Getting Help

- Open an issue on GitHub
- Check existing issues for solutions
- Review deployment logs for error messages
- Contact the development team

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Testnet MATIC obtained
- [ ] Contracts compile successfully
- [ ] Deployment script runs without errors
- [ ] All contracts deployed to Amoy
- [ ] Addresses recorded in deployments.json
- [ ] Contracts verified on Polygonscan
- [ ] Encryption manager initialized
- [ ] Computation engine tested
- [ ] Integration tests passed
- [ ] Documentation updated
- [ ] Team notified of deployment

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-09 | Initial FHENIX Phase 1 deployment guide |

---

**Last Updated**: January 9, 2026  
**Maintained By**: LUKAS Protocol Team  
**Status**: Ready for Deployment ✅
