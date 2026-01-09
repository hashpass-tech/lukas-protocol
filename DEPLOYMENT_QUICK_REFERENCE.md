# Deployment Quick Reference

## Current Status

**Phase 1**: 1/7 contracts deployed (14%)  
**Network**: Polygon Amoy Testnet  
**Last Updated**: 2026-01-09

## Deployed Contracts

| Contract | Address | Status |
|----------|---------|--------|
| FhenixEncryptionManager | `0xcafe3cfad5f4dd86dec1ad25b48382b3fa44cb97` | ✅ Active |

## Quick Commands

### Check Status
```bash
node scripts/update-registry.js phase-status
```

### Record Deployment
```bash
node scripts/record-deployment.js <broadcast.json> amoy <deployment-id>
```

### Update Contract
```bash
node scripts/update-registry.js update-contract amoy <deployment-id> <contract-name> <address>
```

### Mark Verified
```bash
node scripts/update-registry.js mark-verified amoy <deployment-id> <contract-name>
```

### List Deployments
```bash
node scripts/update-registry.js list-deployments amoy
```

## Deployment Script

```bash
cd packages/contracts

export FHENIX_PUBLIC_KEY="0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
export FHENIX_ENCRYPTION_LEVEL="192"

/home/ed/.foundry/bin/forge script script/DeployFhenixMinimal.s.sol:DeployFhenixMinimal \
  --rpc-url https://rpc-amoy.polygon.technology \
  --private-key 0x413b2ec636f512aee4d5e8d2946d4ec2235edbe162d03c71852052c46bead3a6 \
  --broadcast \
  --gas-price 50000000
```

## Registry Files

- **Registry**: `packages/contracts/deployments/registry.json`
- **Update Script**: `scripts/update-registry.js`
- **Record Script**: `scripts/record-deployment.js`
- **Workflow Guide**: `DEPLOYMENT_WORKFLOW.md`
- **Full Registry**: `DEPLOYMENT_REGISTRY.md`

## Amoy Testnet Info

- **Chain ID**: 80002
- **RPC**: https://rpc-amoy.polygon.technology
- **Explorer**: https://amoy.polygonscan.com
- **Faucet**: https://faucet.polygon.technology

## Deployer Info

- **Address**: `0x4F36DC378d1C78181B3F544a81E8951fb4838ad9`
- **Private Key**: `0x413b2ec636f512aee4d5e8d2946d4ec2235edbe162d03c71852052c46bead3a6`

---

**Version**: 0.2.42  
**Last Updated**: January 9, 2026
