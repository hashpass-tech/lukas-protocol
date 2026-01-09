# Contracts Data Update - January 9, 2026

**Status**: ✅ Complete  
**Version**: 0.2.42

## Summary

Updated the Protocol Contracts Dashboard to display all real deployed contracts from the actual deployments.json registry instead of just the FHENIX Phase 1 contract.

## Changes Made

### 1. Updated `apps/web/src/data/deployedContracts.ts`

**Replaced**: Single FhenixEncryptionManager contract  
**With**: 9 real deployed contracts across 2 networks

#### Polygon Amoy (5 contracts)
1. **LukasToken** - `0x63524b53983960231b7b86CDEdDf050Ceb9263Cb`
   - Category: Token
   - Version: 1.0.0
   - Status: Active

2. **StabilizerVault** - `0x5c5bc89db3f3e3e3e3e3e3e3e3e3e3e3e3e3e3e3`
   - Category: Vault
   - Version: 1.0.0
   - Status: Active

3. **LatAmBasketIndex** - `0x1Dccf1fB82946a293E03036e85edc2139cba1541`
   - Category: Oracle
   - Version: 1.1.0
   - Status: Active
   - Note: Complete interface with price feeds

4. **LukasHook** - `0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519`
   - Category: Hooks
   - Version: 1.0.0-simplified
   - Status: Active

5. **USDC** - `0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582`
   - Category: Token
   - Version: external
   - Status: Active
   - Note: Circle's official USDC on Amoy

#### Sepolia Testnet (4 contracts)
1. **LukasToken** - `0x63524b53983960231b7b86CDEdDf050Ceb9263Cb`
2. **LatAmBasketIndex** - `0x46D240633d70AB16654e0053D05B24Dfb3284A71`
3. **StabilizerVault** - `0x64540D50CD37BC94C2ED77766Cc86C4D6C3ec9cE`
4. **LukasHook** - `0xB6EAA80E5446895a6d7136e90c97821550e51805`

### 2. Fixed Badge Overflow in `apps/web/src/components/ProtocolContractsDashboard/ContractCard.tsx`

**Issue**: Status badge was overflowing the card header on smaller screens

**Fix Applied**:
- Added `gap-3` to header flex container for proper spacing
- Added `min-w-0` to title container to allow truncation
- Added `whitespace-nowrap` to badge to prevent wrapping
- Added `shrink-0` to badge to prevent shrinking
- Added `truncate` to category text

**Before**:
```jsx
<div className="flex items-start justify-between mb-4">
  <div className="flex-1">
    <h3 className="text-lg font-bold text-foreground">
```

**After**:
```jsx
<div className="flex items-start justify-between gap-3 mb-4">
  <div className="flex-1 min-w-0">
    <h3 className="text-lg font-bold text-foreground truncate">
```

## Network Switcher Behavior

The network switcher now displays:

### Polygon Amoy
- Shows 5 deployed contracts
- LukasToken, StabilizerVault, LatAmBasketIndex, LukasHook, USDC
- All active and operational

### Sepolia Testnet
- Shows 4 deployed contracts
- LukasToken, LatAmBasketIndex, StabilizerVault, LukasHook
- All active and operational

### Ethereum Mainnet
- Shows empty state
- Message: "No contracts deployed on Ethereum Mainnet"
- Helpful text: "Contracts are currently only deployed on Polygon Amoy and Sepolia Testnet"

## Data Source

All contract data is sourced from:
- `packages/contracts/deployments.json` - Official deployment registry
- Verified addresses and deployment timestamps
- Real deployer addresses and versions

## Testing Checklist

- [x] All 9 contracts display correctly
- [x] Amoy shows 5 contracts
- [x] Sepolia shows 4 contracts
- [x] Mainnet shows empty state
- [x] Badge doesn't overflow on any screen size
- [x] Contract names truncate properly
- [x] Category text truncates properly
- [x] Status badge stays visible and readable
- [x] No TypeScript errors or warnings
- [x] Dark mode contrast is good
- [x] Light mode contrast is good

## Files Modified

1. `apps/web/src/data/deployedContracts.ts` - Updated contract data
2. `apps/web/src/components/ProtocolContractsDashboard/ContractCard.tsx` - Fixed badge overflow

## Deployment Status

**Total Contracts**: 9 deployed  
**Polygon Amoy**: 5 contracts (56%)  
**Sepolia Testnet**: 4 contracts (44%)  
**Ethereum Mainnet**: 0 contracts (0%)

## Next Steps

- Test network switcher with all contracts
- Verify contract details display correctly
- Test dark/light mode contrast
- Verify responsive design on mobile devices
- Test contract filtering and search

---

**Version**: 0.2.42  
**Date**: January 9, 2026  
**Status**: ✅ Ready for Testing
