# Contract State Documentation

**Version**: 1.0  
**Date**: January 8, 2026  
**Status**: Complete

## Overview

This document provides comprehensive documentation of all public state variables for each deployed contract in the LUKAS protocol.

---

## 1. StabilizerVault

**Category**: Vault  
**Network**: Mainnet  
**Status**: Active  
**Version**: 1.0.0

### State Variables

#### totalAssets
- **Type**: `uint256`
- **Visibility**: `public`
- **Description**: Total assets currently held in the vault
- **Current Value**: 0
- **Unit**: Wei
- **Purpose**: Tracks total vault assets for accounting

#### stabilizationFee
- **Type**: `uint256`
- **Visibility**: `public`
- **Description**: Current stabilization fee percentage
- **Current Value**: 0
- **Unit**: Basis points (1 = 0.01%)
- **Purpose**: Controls fee charged for stabilization operations

#### owner
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Owner/admin address
- **Current Value**: 0x...
- **Purpose**: Controls vault administration

#### lastUpdate
- **Type**: `uint256`
- **Visibility**: `public`
- **Description**: Timestamp of last state update
- **Current Value**: 0
- **Unit**: Unix timestamp
- **Purpose**: Tracks when state was last modified

---

## 2. MinimalPoolManager

**Category**: Protocol  
**Network**: Mainnet  
**Status**: Active  
**Version**: 1.0.0

### State Variables

#### poolCount
- **Type**: `uint256`
- **Visibility**: `public`
- **Description**: Number of managed pools
- **Current Value**: 0
- **Purpose**: Tracks total number of pools

#### owner
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Owner/admin address
- **Current Value**: 0x...
- **Purpose**: Controls pool manager administration

---

## 3. FhenixEncryptionManager

**Category**: FHENIX  
**Network**: Amoy (Testnet)  
**Status**: Active  
**Version**: 1.0.0

### State Variables

#### encryptionLevel
- **Type**: `uint256`
- **Visibility**: `public`
- **Description**: Current encryption level in bits
- **Current Value**: 192
- **Unit**: Bits
- **Valid Values**: 128, 192, 256
- **Purpose**: Determines encryption strength

#### isEncryptionActive
- **Type**: `bool`
- **Visibility**: `public`
- **Description**: Whether encryption is currently active
- **Current Value**: true
- **Purpose**: Controls encryption activation state

#### publicKey
- **Type**: `bytes`
- **Visibility**: `public`
- **Description**: FHENIX public key for encryption
- **Current Value**: 0x0123456789abcdef...
- **Purpose**: Used for all encryption operations

#### owner
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Owner/admin address
- **Current Value**: 0x...
- **Purpose**: Controls encryption manager administration

#### initialized
- **Type**: `bool`
- **Visibility**: `public`
- **Description**: Whether encryption has been initialized
- **Current Value**: true
- **Purpose**: Prevents re-initialization

---

## 4. EncryptedMintCeiling

**Category**: FHENIX  
**Network**: Amoy (Testnet)  
**Status**: Active  
**Version**: 1.0.0

### State Variables

#### encryptedCeiling
- **Type**: `bytes`
- **Visibility**: `public`
- **Description**: Encrypted mint ceiling value
- **Current Value**: 0x...
- **Purpose**: Stores encrypted ceiling parameter

#### encryptionManager
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Reference to FhenixEncryptionManager
- **Current Value**: 0x...
- **Purpose**: Used for encryption/decryption operations

#### owner
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Owner/admin address
- **Current Value**: 0x...
- **Purpose**: Controls module administration

---

## 5. EncryptedPegDeviation

**Category**: FHENIX  
**Network**: Amoy (Testnet)  
**Status**: Active  
**Version**: 1.0.0

### State Variables

#### encryptedDeviation
- **Type**: `bytes`
- **Visibility**: `public`
- **Description**: Encrypted peg deviation sensitivity value
- **Current Value**: 0x...
- **Purpose**: Stores encrypted deviation parameter

#### encryptionManager
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Reference to FhenixEncryptionManager
- **Current Value**: 0x...
- **Purpose**: Used for encryption/decryption operations

#### owner
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Owner/admin address
- **Current Value**: 0x...
- **Purpose**: Controls module administration

---

## 6. EncryptedCurveParameters

**Category**: FHENIX  
**Network**: Amoy (Testnet)  
**Status**: Active  
**Version**: 1.0.0

### State Variables

#### encryptedParameters
- **Type**: `bytes`
- **Visibility**: `public`
- **Description**: Encrypted stabilization curve parameters
- **Current Value**: 0x...
- **Purpose**: Stores encrypted curve parameters

#### encryptionManager
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Reference to FhenixEncryptionManager
- **Current Value**: 0x...
- **Purpose**: Used for encryption/decryption operations

#### owner
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Owner/admin address
- **Current Value**: 0x...
- **Purpose**: Controls module administration

---

## 7. FhenixComputationEngine

**Category**: FHENIX  
**Network**: Amoy (Testnet)  
**Status**: Active  
**Version**: 1.0.0

### State Variables

*No public state variables*

**Description**: Stateless contract for homomorphic operations

---

## 8. FhenixDecryptionHandler

**Category**: FHENIX  
**Network**: Amoy (Testnet)  
**Status**: Active  
**Version**: 1.0.0

### State Variables

#### encryptionManager
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Reference to FhenixEncryptionManager
- **Current Value**: 0x...
- **Purpose**: Used for decryption operations

#### owner
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Owner/admin address
- **Current Value**: 0x...
- **Purpose**: Controls decryption handler administration

#### authorizedDecryptors
- **Type**: `mapping(address => bool)`
- **Visibility**: `public`
- **Description**: Authorized addresses for decryption
- **Purpose**: Controls who can perform decryption

---

## 9. EncryptionOrchestrator

**Category**: FHENIX  
**Network**: Amoy (Testnet)  
**Status**: Active  
**Version**: 1.0.0

### State Variables

#### encryptedPathEnabled
- **Type**: `bool`
- **Visibility**: `public`
- **Description**: Whether encrypted path is enabled
- **Current Value**: false
- **Purpose**: Controls encrypted parameter usage

#### encryptionManager
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Reference to FhenixEncryptionManager
- **Current Value**: 0x...
- **Purpose**: Coordinates encryption operations

#### mintCeiling
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Reference to EncryptedMintCeiling
- **Current Value**: 0x...
- **Purpose**: Accesses encrypted mint ceiling

#### pegDeviation
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Reference to EncryptedPegDeviation
- **Current Value**: 0x...
- **Purpose**: Accesses encrypted peg deviation

#### curveParameters
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Reference to EncryptedCurveParameters
- **Current Value**: 0x...
- **Purpose**: Accesses encrypted curve parameters

#### computationEngine
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Reference to FhenixComputationEngine
- **Current Value**: 0x...
- **Purpose**: Performs homomorphic operations

#### decryptionHandler
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Reference to FhenixDecryptionHandler
- **Current Value**: 0x...
- **Purpose**: Handles decryption operations

#### owner
- **Type**: `address`
- **Visibility**: `public`
- **Description**: Owner/admin address
- **Current Value**: 0x...
- **Purpose**: Controls orchestrator administration

---

## Summary

### Total State Variables: 28

### By Contract:
- StabilizerVault: 4
- MinimalPoolManager: 2
- FhenixEncryptionManager: 4
- EncryptedMintCeiling: 3
- EncryptedPegDeviation: 3
- EncryptedCurveParameters: 3
- FhenixComputationEngine: 0
- FhenixDecryptionHandler: 3
- EncryptionOrchestrator: 8

### By Type:
- `address`: 13
- `uint256`: 3
- `bool`: 3
- `bytes`: 3
- `mapping`: 1
- Other: 5

### By Visibility:
- `public`: 28
- `private`: 0
- `internal`: 0

---

## Last Updated

**Date**: January 8, 2026  
**Status**: Complete  
**Next Review**: After next deployment

