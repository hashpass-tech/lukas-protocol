# Contract Interactions Mapping

**Version**: 1.0  
**Date**: January 8, 2026  
**Status**: Complete

## Overview

This document provides comprehensive mapping of all contract interactions, dependencies, and function call relationships in the LUKAS protocol.

---

## Interaction Summary

### Total Contracts: 9
### Total Dependencies: 12
### Total Dependents: 12
### Critical Interactions: 8

---

## Contract Dependency Graph

```
StabilizerVault
├── depends on: MinimalPoolManager
├── depends on: PriceFeed
└── called by: Uniswap V4 Hook

MinimalPoolManager
├── depends on: (none)
└── called by: StabilizerVault

FhenixEncryptionManager
├── depends on: (none)
└── called by:
    ├── EncryptedMintCeiling
    ├── EncryptedPegDeviation
    ├── EncryptedCurveParameters
    └── FhenixDecryptionHandler

EncryptedMintCeiling
├── depends on: FhenixEncryptionManager
└── called by: EncryptionOrchestrator

EncryptedPegDeviation
├── depends on: FhenixEncryptionManager
└── called by: EncryptionOrchestrator

EncryptedCurveParameters
├── depends on: FhenixEncryptionManager
└── called by: EncryptionOrchestrator

FhenixComputationEngine
├── depends on: (none)
└── called by: EncryptionOrchestrator

FhenixDecryptionHandler
├── depends on: FhenixEncryptionManager
└── called by: EncryptionOrchestrator

EncryptionOrchestrator
├── depends on:
│   ├── FhenixEncryptionManager
│   ├── EncryptedMintCeiling
│   ├── EncryptedPegDeviation
│   ├── EncryptedCurveParameters
│   ├── FhenixComputationEngine
│   └── FhenixDecryptionHandler
└── called by: (none - top-level orchestrator)
```

---

## Detailed Interactions

### 1. StabilizerVault Interactions

#### Dependencies (Contracts it calls)

**1.1 MinimalPoolManager**
- **Function**: `getPoolState(address pool)`
- **Purpose**: Get current pool state
- **Frequency**: Per operation
- **Critical**: YES
- **Data Flow**: Pool state → StabilizerVault
- **Error Handling**: Reverts if pool not found

**1.2 PriceFeed**
- **Function**: `getLatestPrice(address token)`
- **Purpose**: Get current token price
- **Frequency**: Per stabilization operation
- **Critical**: YES
- **Data Flow**: Price data → StabilizerVault
- **Error Handling**: Reverts if price unavailable

#### Dependents (Contracts that call it)

**1.3 Uniswap V4 Hook**
- **Function**: `beforeSwap()`
- **Purpose**: Execute stabilization before swap
- **Frequency**: Per swap operation
- **Critical**: YES
- **Data Flow**: Swap parameters → StabilizerVault
- **Error Handling**: Reverts if stabilization fails

---

### 2. MinimalPoolManager Interactions

#### Dependencies
- None (standalone contract)

#### Dependents

**2.1 StabilizerVault**
- **Function**: `getPoolState(address pool)`
- **Purpose**: Query pool state
- **Frequency**: Per operation
- **Critical**: YES

---

### 3. FhenixEncryptionManager Interactions

#### Dependencies
- None (core infrastructure)

#### Dependents

**3.1 EncryptedMintCeiling**
- **Function**: `initializeEncryption(bytes publicKey, uint256 level)`
- **Purpose**: Initialize encryption
- **Frequency**: Once at deployment
- **Critical**: YES
- **Data Flow**: Public key, encryption level → EncryptedMintCeiling

**3.2 EncryptedPegDeviation**
- **Function**: `initializeEncryption(bytes publicKey, uint256 level)`
- **Purpose**: Initialize encryption
- **Frequency**: Once at deployment
- **Critical**: YES
- **Data Flow**: Public key, encryption level → EncryptedPegDeviation

**3.3 EncryptedCurveParameters**
- **Function**: `initializeEncryption(bytes publicKey, uint256 level)`
- **Purpose**: Initialize encryption
- **Frequency**: Once at deployment
- **Critical**: YES
- **Data Flow**: Public key, encryption level → EncryptedCurveParameters

**3.4 FhenixDecryptionHandler**
- **Function**: `initializeEncryption(bytes publicKey, uint256 level)`
- **Purpose**: Initialize encryption
- **Frequency**: Once at deployment
- **Critical**: YES
- **Data Flow**: Public key, encryption level → FhenixDecryptionHandler

---

### 4. EncryptedMintCeiling Interactions

#### Dependencies

**4.1 FhenixEncryptionManager**
- **Function**: `getEncryptionLevel()`
- **Purpose**: Get encryption level for operations
- **Frequency**: Per parameter update
- **Critical**: YES
- **Data Flow**: Encryption level → EncryptedMintCeiling

#### Dependents

**4.2 EncryptionOrchestrator**
- **Function**: `getMintCeiling()`
- **Purpose**: Get encrypted mint ceiling
- **Frequency**: Per stabilization operation
- **Critical**: YES
- **Data Flow**: Encrypted ceiling → EncryptionOrchestrator

---

### 5. EncryptedPegDeviation Interactions

#### Dependencies

**5.1 FhenixEncryptionManager**
- **Function**: `getEncryptionLevel()`
- **Purpose**: Get encryption level for operations
- **Frequency**: Per parameter update
- **Critical**: YES
- **Data Flow**: Encryption level → EncryptedPegDeviation

#### Dependents

**5.2 EncryptionOrchestrator**
- **Function**: `getPegDeviation()`
- **Purpose**: Get encrypted peg deviation
- **Frequency**: Per stabilization operation
- **Critical**: YES
- **Data Flow**: Encrypted deviation → EncryptionOrchestrator

---

### 6. EncryptedCurveParameters Interactions

#### Dependencies

**6.1 FhenixEncryptionManager**
- **Function**: `getEncryptionLevel()`
- **Purpose**: Get encryption level for operations
- **Frequency**: Per parameter update
- **Critical**: YES
- **Data Flow**: Encryption level → EncryptedCurveParameters

#### Dependents

**6.2 EncryptionOrchestrator**
- **Function**: `getCurveParameters()`
- **Purpose**: Get encrypted curve parameters
- **Frequency**: Per stabilization operation
- **Critical**: YES
- **Data Flow**: Encrypted parameters → EncryptionOrchestrator

---

### 7. FhenixComputationEngine Interactions

#### Dependencies
- None (stateless utility)

#### Dependents

**7.1 EncryptionOrchestrator**
- **Function**: `add(bytes a, bytes b)`
- **Purpose**: Perform homomorphic addition
- **Frequency**: Per computation
- **Critical**: YES
- **Data Flow**: Encrypted values → computation result

**7.2 EncryptionOrchestrator**
- **Function**: `multiply(bytes a, bytes b)`
- **Purpose**: Perform homomorphic multiplication
- **Frequency**: Per computation
- **Critical**: YES
- **Data Flow**: Encrypted values → computation result

**7.3 EncryptionOrchestrator**
- **Function**: `compare(bytes a, bytes b)`
- **Purpose**: Compare encrypted values
- **Frequency**: Per comparison
- **Critical**: YES
- **Data Flow**: Encrypted values → comparison result

---

### 8. FhenixDecryptionHandler Interactions

#### Dependencies

**8.1 FhenixEncryptionManager**
- **Function**: `getPublicKey()`
- **Purpose**: Get public key for decryption
- **Frequency**: Per decryption operation
- **Critical**: YES
- **Data Flow**: Public key → FhenixDecryptionHandler

#### Dependents

**8.2 EncryptionOrchestrator**
- **Function**: `requestDecryption(bytes encryptedData)`
- **Purpose**: Request decryption of encrypted data
- **Frequency**: Per decryption need
- **Critical**: YES
- **Data Flow**: Encrypted data → decrypted result

---

### 9. EncryptionOrchestrator Interactions

#### Dependencies

**9.1 FhenixEncryptionManager**
- **Function**: `isEncryptionActive()`
- **Purpose**: Check if encryption is active
- **Frequency**: Per operation
- **Critical**: YES
- **Data Flow**: Encryption status → EncryptionOrchestrator

**9.2 EncryptedMintCeiling**
- **Function**: `getMintCeiling()`
- **Purpose**: Get encrypted mint ceiling
- **Frequency**: Per stabilization
- **Critical**: YES

**9.3 EncryptedPegDeviation**
- **Function**: `getPegDeviation()`
- **Purpose**: Get encrypted peg deviation
- **Frequency**: Per stabilization
- **Critical**: YES

**9.4 EncryptedCurveParameters**
- **Function**: `getCurveParameters()`
- **Purpose**: Get encrypted curve parameters
- **Frequency**: Per stabilization
- **Critical**: YES

**9.5 FhenixComputationEngine**
- **Function**: `add()`, `multiply()`, `compare()`
- **Purpose**: Perform homomorphic operations
- **Frequency**: Per computation
- **Critical**: YES

**9.6 FhenixDecryptionHandler**
- **Function**: `requestDecryption()`
- **Purpose**: Request decryption
- **Frequency**: Per decryption need
- **Critical**: YES

#### Dependents
- None (top-level orchestrator)

---

## Interaction Matrices

### Dependency Matrix

```
                    EM  MC  PD  CP  CE  DH  EO  SV  PM
EncryptionManager   -   D   D   D   -   D   D   -   -
MintCeiling         -   -   -   -   -   -   D   -   -
PegDeviation        -   -   -   -   -   -   D   -   -
CurveParameters     -   -   -   -   -   -   D   -   -
ComputationEngine   -   -   -   -   -   -   D   -   -
DecryptionHandler   -   -   -   -   -   -   D   -   -
Orchestrator        -   -   -   -   -   -   -   -   -
StabilizerVault     -   -   -   -   -   -   -   -   D
PoolManager         -   -   -   -   -   -   -   D   -

Legend: D = Depends on, - = No dependency
```

### Call Matrix

```
                    EM  MC  PD  CP  CE  DH  EO  SV  PM
EncryptionManager   -   C   C   C   -   C   C   -   -
MintCeiling         -   -   -   -   -   -   C   -   -
PegDeviation        -   -   -   -   -   -   C   -   -
CurveParameters     -   -   -   -   -   -   C   -   -
ComputationEngine   -   -   -   -   -   -   C   -   -
DecryptionHandler   -   -   -   -   -   -   C   -   -
Orchestrator        -   -   -   -   -   -   -   -   -
StabilizerVault     -   -   -   -   -   -   -   -   C
PoolManager         -   -   -   -   -   -   -   C   -

Legend: C = Calls, - = No calls
```

---

## Critical Interactions

### Critical Path 1: Encryption Initialization
```
FhenixEncryptionManager.initializeEncryption()
├── EncryptedMintCeiling.initialize()
├── EncryptedPegDeviation.initialize()
├── EncryptedCurveParameters.initialize()
└── FhenixDecryptionHandler.initialize()
```
**Impact**: If fails, entire encryption system unavailable

### Critical Path 2: Stabilization Operation
```
StabilizerVault.stabilize()
├── MinimalPoolManager.getPoolState()
├── PriceFeed.getLatestPrice()
└── EncryptionOrchestrator.executeStabilization()
    ├── EncryptedMintCeiling.getMintCeiling()
    ├── EncryptedPegDeviation.getPegDeviation()
    ├── EncryptedCurveParameters.getCurveParameters()
    ├── FhenixComputationEngine.compute()
    └── FhenixDecryptionHandler.requestDecryption()
```
**Impact**: If fails, stabilization unavailable

### Critical Path 3: Decryption Request
```
EncryptionOrchestrator.requestDecryption()
├── FhenixDecryptionHandler.requestDecryption()
└── FhenixEncryptionManager.getPublicKey()
```
**Impact**: If fails, cannot decrypt encrypted parameters

---

## Interaction Patterns

### Pattern 1: Encryption Manager Hub
- FhenixEncryptionManager is the central hub
- All encrypted modules depend on it
- Single point of failure for encryption

### Pattern 2: Orchestrator Coordinator
- EncryptionOrchestrator coordinates all encrypted operations
- Calls multiple modules in sequence
- Handles complex orchestration logic

### Pattern 3: Parameter Modules
- EncryptedMintCeiling, PegDeviation, CurveParameters are similar
- All depend on EncryptionManager
- All called by Orchestrator
- Interchangeable pattern

### Pattern 4: Utility Engine
- FhenixComputationEngine is stateless
- Called for specific operations
- No dependencies on other contracts

---

## Error Propagation

### Encryption Manager Failure
- **Impact**: All encrypted operations fail
- **Propagation**: Cascades to all dependent modules
- **Recovery**: Requires re-initialization

### Orchestrator Failure
- **Impact**: Stabilization operations fail
- **Propagation**: Affects StabilizerVault
- **Recovery**: Requires orchestrator restart

### Parameter Module Failure
- **Impact**: Specific parameter unavailable
- **Propagation**: Affects orchestrator operations
- **Recovery**: Requires module re-initialization

---

## Performance Considerations

### Call Frequency
- **High**: Encryption operations (per stabilization)
- **Medium**: Parameter retrieval (per operation)
- **Low**: Initialization (once at deployment)

### Gas Costs
- **Encryption Manager**: ~50,000 gas per operation
- **Parameter Modules**: ~30,000 gas per operation
- **Computation Engine**: ~20,000 gas per operation
- **Orchestrator**: ~100,000 gas per full operation

### Optimization Opportunities
- Cache encryption level
- Batch parameter updates
- Optimize computation operations

---

## Summary

### Total Interactions: 20+
### Critical Interactions: 8
### Dependency Chains: 3
### Interaction Patterns: 4

**Status**: ✅ Complete

---

**Last Updated**: January 8, 2026  
**Next Review**: After next deployment

