# LUKAS Protocol - Deployment Registry

**Last Updated**: 2026-01-09T06:32:00Z  
**Registry Version**: 1.0.0

## Quick Status

### Phase 1: FHENIX Encryption Infrastructure
- **Status**: In Progress
- **Progress**: 1/7 contracts deployed (14%)
- **Network**: Polygon Amoy Testnet

| Contract | Status | Address | Network |
|----------|--------|---------|---------|
| FhenixEncryptionManager | ✅ Deployed | `0xcafe3cfad5f4dd86dec1ad25b48382b3fa44cb97` | Amoy |
| EncryptedMintCeiling | ⏳ Pending | - | Amoy |
| EncryptedPegDeviation | ⏳ Pending | - | Amoy |
| EncryptedCurveParameters | ⏳ Pending | - | Amoy |
| FhenixComputationEngine | ⏳ Pending | - | Amoy |
| FhenixDecryptionHandler | ⏳ Pending | - | Amoy |
| EncryptionOrchestrator | ⏳ Pending | - | Amoy |

## Deployments

### Amoy Testnet (Chain ID: 80002)

#### Deployment: fhenix-phase1-minimal-v1
- **Version**: 0.2.42
- **Timestamp**: 2026-01-09T06:32:00Z
- **Deployer**: `0x4F36DC378d1C78181B3F544a81E8951fb4838ad9`
- **Status**: Active
- **Notes**: Minimal deployment - core encryption manager only

**Contracts**:
1. **FhenixEncryptionManager**
   - Address: `0xcafe3cfad5f4dd86dec1ad25b48382b3fa44cb97`
   - Deployment TX: `0x29e6b1a8aa26b2a5cbcca865ac073796b77aae5e75fc9c12a89eaa075d07b038`
   - Initialization TX: `0x7a420e09fb2eadf139a5d145158cad4514b3ab83700b13e9e41a72ed0309ca76`
   - Block: 31,556,271
   - Gas Used: 1,540,606
   - Status: Active
   - Verified: No
   - Configuration:
     - Encryption Level: 192-bit
     - Public Key: `0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`

## Registry Management

### Commands

**View Phase Status**:
```bash
node scripts/update-registry.js phase-status
```

**List All Deployments**:
```bash
node scripts/update-registry.js list-deployments amoy
```

**Get Specific Deployment**:
```bash
node scripts/update-registry.js get-deployment amoy fhenix-phase1-minimal-v1
```

**Record New Deployment**:
```bash
node scripts/record-deployment.js <broadcastJsonPath> <network> <deploymentId>
```

**Update Contract Address**:
```bash
node scripts/update-registry.js update-contract amoy fhenix-phase1-minimal-v1 ContractName 0xAddress [txHash]
```

**Mark Contract as Verified**:
```bash
node scripts/update-registry.js mark-verified amoy fhenix-phase1-minimal-v1 ContractName
```

## Registry Files

- **Registry**: `packages/contracts/deployments/registry.json`
- **Update Script**: `scripts/update-registry.js`
- **Record Script**: `scripts/record-deployment.js`

## Next Steps

1. Deploy remaining 6 FHENIX contracts
2. Record deployments using `record-deployment.js`
3. Verify contracts on Polygonscan
4. Mark contracts as verified in registry
5. Deploy to mainnet when ready

## Versioning

Registry follows semantic versioning:
- **Major**: Network changes or breaking changes
- **Minor**: New deployments or phases
- **Patch**: Updates to existing deployments

Current Version: **1.0.0**

---

**Maintained By**: LUKAS Protocol Team  
**Last Updated**: January 9, 2026
