# Amoy Quick Start Deployment Guide

**Status**: ✅ Ready to Deploy  
**Network**: Polygon Amoy (Testnet)  
**Contracts**: 7 (Minimal Core Infrastructure)

## 🚀 Quick Start (5 Minutes)

### 1. Set Environment Variables

```bash
# Amoy RPC
export AMOY_RPC_URL="https://rpc-amoy.polygon.technology/"

# Your deployer private key (from secure storage)
export AMOY_PRIVATE_KEY="0x..."

# FHENIX public key (test key for now)
export FHENIX_PUBLIC_KEY="0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Etherscan API key (for verification)
export ETHERSCAN_API_KEY="..."

# Encryption configuration
export FHENIX_ENCRYPTION_LEVEL=192
export FHENIX_ENCRYPTED_PATH_ENABLED=false
export FHENIX_DECRYPTION_THRESHOLD=1
```

### 2. Verify Setup

```bash
# Check deployer address
cast wallet address --private-key $AMOY_PRIVATE_KEY

# Check Amoy RPC is working
cast block-number --rpc-url $AMOY_RPC_URL

# Check deployer has MATIC
cast balance $(cast wallet address --private-key $AMOY_PRIVATE_KEY) --rpc-url $AMOY_RPC_URL
```

### 3. Build Contracts

```bash
cd packages/contracts
forge build
```

### 4. Dry Run Deployment

```bash
forge script script/DeployFhenixPhase1.s.sol:DeployFhenixPhase1 \
  --rpc-url $AMOY_RPC_URL \
  --private-key $AMOY_PRIVATE_KEY \
  --dry-run
```

### 5. Deploy to Amoy

```bash
forge script script/DeployFhenixPhase1.s.sol:DeployFhenixPhase1 \
  --rpc-url $AMOY_RPC_URL \
  --private-key $AMOY_PRIVATE_KEY \
  --broadcast \
  --verify \
  --verifier etherscan \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

### 6. Save Deployment Addresses

```bash
# After deployment, save the addresses
cat > amoy_deployment.json << 'EOF'
{
  "network": "amoy",
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

## 📋 Contracts to Deploy (7 Total)

| # | Contract | Purpose | Status |
|---|----------|---------|--------|
| 1 | FhenixEncryptionManager | Key management | ✅ Ready |
| 2 | EncryptedMintCeiling | Mint ceiling | ✅ Ready |
| 3 | EncryptedPegDeviation | Peg deviation | ✅ Ready |
| 4 | EncryptedCurveParameters | Curve params | ✅ Ready |
| 5 | FhenixComputationEngine | Homomorphic ops | ✅ Ready |
| 6 | FhenixDecryptionHandler | Decryption | ✅ Ready |
| 7 | EncryptionOrchestrator | Orchestration | ✅ Ready |

## ✅ Pre-Deployment Checklist

- [ ] All 255 tests passing locally
- [ ] Contracts compile successfully
- [ ] Environment variables set
- [ ] Deployer wallet has >1 MATIC
- [ ] Private key secured
- [ ] FHENIX public key obtained
- [ ] Etherscan API key obtained
- [ ] Dry run successful

## 🔍 Verification After Deployment

```bash
# Check encryption is active
cast call <ENCRYPTION_MANAGER_ADDRESS> "isEncryptionActive()" --rpc-url $AMOY_RPC_URL

# Check encryption level
cast call <ENCRYPTION_MANAGER_ADDRESS> "getEncryptionLevel()" --rpc-url $AMOY_RPC_URL

# Check public key is set
cast call <ENCRYPTION_MANAGER_ADDRESS> "getPublicKey()" --rpc-url $AMOY_RPC_URL

# Check orchestrator encrypted path is disabled
cast call <ORCHESTRATOR_ADDRESS> "isEncryptedPathActive()" --rpc-url $AMOY_RPC_URL
```

## 📊 Expected Gas Costs

| Contract | Estimated Gas | Cost (at 50 gwei) |
|----------|---------------|-------------------|
| FhenixEncryptionManager | 500,000 | ~0.025 MATIC |
| EncryptedMintCeiling | 400,000 | ~0.020 MATIC |
| EncryptedPegDeviation | 400,000 | ~0.020 MATIC |
| EncryptedCurveParameters | 450,000 | ~0.023 MATIC |
| FhenixComputationEngine | 350,000 | ~0.018 MATIC |
| FhenixDecryptionHandler | 450,000 | ~0.023 MATIC |
| EncryptionOrchestrator | 600,000 | ~0.030 MATIC |
| **Total** | **~3.15M** | **~0.16 MATIC** |

## 🔗 Amoy Resources

- **RPC**: https://rpc-amoy.polygon.technology/
- **Block Explorer**: https://amoy.polygonscan.com/
- **Faucet**: https://faucet.polygon.technology/
- **Chain ID**: 80002

## 📝 Deployment Addresses Template

After deployment, record these addresses:

```json
{
  "network": "amoy",
  "chainId": 80002,
  "timestamp": "2026-01-08T00:00:00Z",
  "deployer": "0x...",
  "contracts": {
    "encryptionManager": "0x...",
    "mintCeiling": "0x...",
    "pegDeviation": "0x...",
    "curveParameters": "0x...",
    "computationEngine": "0x...",
    "decryptionHandler": "0x...",
    "orchestrator": "0x..."
  },
  "configuration": {
    "encryptionLevel": 192,
    "encryptedPathEnabled": false,
    "decryptionThreshold": 1
  }
}
```

## 🚨 Troubleshooting

### Error: "Insufficient funds"
- Get MATIC from faucet: https://faucet.polygon.technology/
- Need at least 1 MATIC for deployment

### Error: "RPC rate limit exceeded"
- Use alternative RPC endpoint
- Add delays between transactions
- Try again later

### Error: "Contract verification failed"
- Manually verify on Polygonscan
- Retry verification after 1 minute
- Check Etherscan API key is valid

### Error: "Encryption not active"
- Check initialization transaction succeeded
- Verify public key was set
- Check encryption level is valid

## ✨ Success Indicators

✅ **Deployment Successful When**:
- All 7 contracts deployed
- All contracts verified on Polygonscan
- `isEncryptionActive()` returns true
- `isEncryptedPathActive()` returns false
- No errors in deployment logs
- Gas costs within estimates

## 📞 Support

For detailed information, see:
- `AMOY_DEPLOYMENT_READINESS_CHECKLIST.md` - Full checklist
- `packages/contracts/docs/FHENIX_PHASE1_DEPLOYMENT_GUIDE.md` - Detailed guide
- `packages/contracts/docs/FHENIX_INTEGRATION_GUIDE.md` - Integration guide

## 🎯 Next Steps

1. **Deploy to Amoy** (this guide)
2. **Verify Deployment** (see verification section)
3. **Integration Testing** (test with actual contracts)
4. **Community Testing** (share with community)
5. **Mainnet Deployment** (after successful testing)

---

**Status**: ✅ **READY TO DEPLOY**

**Estimated Time**: 5-10 minutes  
**Estimated Cost**: ~0.16 MATIC  
**Risk Level**: Low (testnet only)

**Go ahead and deploy!** 🚀
