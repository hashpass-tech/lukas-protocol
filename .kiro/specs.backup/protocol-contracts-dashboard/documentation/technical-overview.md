# Technical Overview Documentation

**Version**: 1.0  
**Date**: January 8, 2026  
**Status**: Complete

## Overview

This document provides comprehensive technical details for all deployed contracts in the LUKAS protocol, including source code locations, sizes, gas costs, interfaces, functions, and error types.

---

## 1. StabilizerVault

**Category**: Vault  
**Network**: Mainnet  
**Status**: Active  
**Version**: 1.0.0

### Source Code
- **Location**: `packages/contracts/src/StabilizerVault.sol`
- **Lines of Code**: ~500
- **Language**: Solidity 0.8.26

### Contract Metrics
- **Contract Size**: 5,000 bytes
- **Deployment Gas**: ~500,000
- **Initialization Gas**: ~50,000

### Implemented Interfaces
- `IStabilizerVault` - Main vault interface

### Key Functions

#### deposit
```solidity
function deposit(uint256 assets, address receiver) external returns (uint256 shares)
```
- **Visibility**: External
- **State Mutability**: Nonpayable
- **Description**: Deposit assets into vault
- **Parameters**:
  - `assets` (uint256): Amount of assets to deposit
  - `receiver` (address): Address to receive shares
- **Returns**: `shares` (uint256) - Shares minted

#### withdraw
```solidity
function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares)
```
- **Visibility**: External
- **State Mutability**: Nonpayable
- **Description**: Withdraw assets from vault
- **Parameters**:
  - `assets` (uint256): Amount of assets to withdraw
  - `receiver` (address): Address to receive assets
  - `owner` (address): Owner of shares
- **Returns**: `shares` (uint256) - Shares burned

### Custom Errors
- `InsufficientBalance` - Insufficient balance for operation
- `InvalidAmount` - Invalid amount provided
- `Unauthorized` - Caller not authorized

### Events
- `Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares)`
- `Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)`

---

## 2. MinimalPoolManager

**Category**: Protocol  
**Network**: Mainnet  
**Status**: Active  
**Version**: 1.0.0

### Source Code
- **Location**: `packages/contracts/src/MinimalPoolManager.sol`
- **Lines of Code**: ~400
- **Language**: Solidity 0.8.26

### Contract Metrics
- **Contract Size**: 4,000 bytes
- **Deployment Gas**: ~400,000
- **Initialization Gas**: ~30,000

### Implemented Interfaces
- None (standalone contract)

### Key Functions

#### createPool
```solidity
function createPool(address token0, address token1, uint24 fee) external returns (address pool)
```
- **Visibility**: External
- **State Mutability**: Nonpayable
- **Description**: Create new Uniswap V4 pool
- **Parameters**:
  - `token0` (address): First token address
  - `token1` (address): Second token address
  - `fee` (uint24): Pool fee tier
- **Returns**: `pool` (address) - New pool address

#### getPoolState
```solidity
function getPoolState(address pool) external view returns (PoolState memory)
```
- **Visibility**: External
- **State Mutability**: View
- **Description**: Get current pool state
- **Parameters**:
  - `pool` (address): Pool address
- **Returns**: `PoolState` - Current pool state

### Custom Errors
- `PoolExists` - Pool already exists
- `InvalidTokens` - Invalid token addresses
- `InvalidFee` - Invalid fee tier

### Events
- `PoolCreated(address indexed token0, address indexed token1, uint24 fee, address pool)`

---

## 3. FhenixEncryptionManager

**Category**: FHENIX  
**Network**: Amoy (Testnet)  
**Status**: Active  
**Version**: 1.0.0

### Source Code
- **Location**: `packages/contracts/src/fhenix/core/FhenixEncryptionManager.sol`
- **Lines of Code**: ~150
- **Language**: Solidity 0.8.26

### Contract Metrics
- **Contract Size**: 3,000 bytes
- **Deployment Gas**: ~500,000
- **Initialization Gas**: ~100,000

### Implemented Interfaces
- `IFhenixEncryptionManager` - Encryption manager interface

### Key Functions

#### initializeEncryption
```solidity
function initializeEncryption(bytes calldata publicKey, uint256 level) external
```
- **Visibility**: External
- **State Mutability**: Nonpayable
- **Description**: Initialize encryption with public key and level
- **Parameters**:
  - `publicKey` (bytes): FHENIX public key
  - `level` (uint256): Encryption level (128, 192, or 256)

#### isEncryptionActive
```solidity
function isEncryptionActive() external view returns (bool)
```
- **Visibility**: External
- **State Mutability**: View
- **Description**: Check if encryption is active
- **Returns**: `bool` - Encryption active status

#### getEncryptionLevel
```solidity
function getEncryptionLevel() external view returns (uint256)
```
- **Visibility**: External
- **State Mutability**: View
- **Description**: Get current encryption level
- **Returns**: `uint256` - Encryption level in bits

#### getPublicKey
```solidity
function getPublicKey() external view returns (bytes memory)
```
- **Visibility**: External
- **State Mutability**: View
- **Description**: Get FHENIX public key
- **Returns**: `bytes` - Public key

### Custom Errors
- `AlreadyInitialized` - Encryption already initialized
- `InvalidLevel` - Invalid encryption level
- `Unauthorized` - Caller not authorized

### Events
- `EncryptionInitialized(uint256 level, bytes publicKey)`

---

## 4. EncryptedMintCeiling

**Category**: FHENIX  
**Network**: Amoy (Testnet)  
**Status**: Active  
**Version**: 1.0.0

### Source Code
- **Location**: `packages/contracts/src/fhenix/core/EncryptedMintCeiling.sol`
- **Lines of Code**: ~120
- **Language**: Solidity 0.8.26

### Contract Metrics
- **Contract Size**: 2,500 bytes
- **Deployment Gas**: ~400,000
- **Initialization Gas**: ~50,000

### Implemented Interfaces
- `IEncryptedMintCeiling` - Encrypted mint ceiling interface

### Key Functions
- Encrypted parameter storage and retrieval functions

### Custom Errors
- `Unauthorized` - Caller not authorized
- `InvalidValue` - Invalid parameter value

### Events
- `CeilingUpdated(bytes encryptedValue)`

---

## 5. EncryptedPegDeviation

**Category**: FHENIX  
**Network**: Amoy (Testnet)  
**Status**: Active  
**Version**: 1.0.0

### Source Code
- **Location**: `packages/contracts/src/fhenix/core/EncryptedPegDeviation.sol`
- **Lines of Code**: ~120
- **Language**: Solidity 0.8.26

### Contract Metrics
- **Contract Size**: 2,500 bytes
- **Deployment Gas**: ~400,000
- **Initialization Gas**: ~50,000

### Implemented Interfaces
- `IEncryptedPegDeviation` - Encrypted peg deviation interface

### Key Functions
- Encrypted parameter storage and retrieval functions

### Custom Errors
- `Unauthorized` - Caller not authorized
- `InvalidValue` - Invalid parameter value

### Events
- `DeviationUpdated(bytes encryptedValue)`

---

## 6. EncryptedCurveParameters

**Category**: FHENIX  
**Network**: Amoy (Testnet)  
**Status**: Active  
**Version**: 1.0.0

### Source Code
- **Location**: `packages/contracts/src/fhenix/core/EncryptedCurveParameters.sol`
- **Lines of Code**: ~160
- **Language**: Solidity 0.8.26

### Contract Metrics
- **Contract Size**: 3,000 bytes
- **Deployment Gas**: ~450,000
- **Initialization Gas**: ~60,000

### Implemented Interfaces
- `IEncryptedCurveParameters` - Encrypted curve parameters interface

### Key Functions
- Encrypted parameter storage and retrieval functions

### Custom Errors
- `Unauthorized` - Caller not authorized
- `InvalidValue` - Invalid parameter value

### Events
- `ParametersUpdated(bytes encryptedValue)`

---

## 7. FhenixComputationEngine

**Category**: FHENIX  
**Network**: Amoy (Testnet)  
**Status**: Active  
**Version**: 1.0.0

### Source Code
- **Location**: `packages/contracts/src/fhenix/core/FhenixComputationEngine.sol`
- **Lines of Code**: ~110
- **Language**: Solidity 0.8.26

### Contract Metrics
- **Contract Size**: 2,500 bytes
- **Deployment Gas**: ~350,000
- **Initialization Gas**: ~0 (stateless)

### Implemented Interfaces
- `IFhenixComputationEngine` - Computation engine interface

### Key Functions
- Homomorphic operation functions (add, multiply, compare, etc.)

### Custom Errors
- `InvalidInput` - Invalid input provided
- `ComputationFailed` - Computation failed

### Events
- `ComputationPerformed(bytes input, bytes output)`

---

## 8. FhenixDecryptionHandler

**Category**: FHENIX  
**Network**: Amoy (Testnet)  
**Status**: Active  
**Version**: 1.0.0

### Source Code
- **Location**: `packages/contracts/src/fhenix/core/FhenixDecryptionHandler.sol`
- **Lines of Code**: ~180
- **Language**: Solidity 0.8.26

### Contract Metrics
- **Contract Size**: 3,500 bytes
- **Deployment Gas**: ~450,000
- **Initialization Gas**: ~50,000

### Implemented Interfaces
- `IFhenixDecryptionHandler` - Decryption handler interface

### Key Functions
- Decryption authorization and execution functions

### Custom Errors
- `Unauthorized` - Caller not authorized
- `DecryptionFailed` - Decryption failed
- `InvalidSignature` - Invalid signature provided

### Events
- `DecryptionRequested(address indexed requester, bytes encryptedData)`
- `DecryptionCompleted(address indexed requester, bytes decryptedData)`

---

## 9. EncryptionOrchestrator

**Category**: FHENIX  
**Network**: Amoy (Testnet)  
**Status**: Active  
**Version**: 1.0.0

### Source Code
- **Location**: `packages/contracts/src/fhenix/orchestration/EncryptionOrchestrator.sol`
- **Lines of Code**: ~200
- **Language**: Solidity 0.8.26

### Contract Metrics
- **Contract Size**: 4,000 bytes
- **Deployment Gas**: ~600,000
- **Initialization Gas**: ~100,000

### Implemented Interfaces
- None (orchestration contract)

### Key Functions

#### setEncryptedPathEnabled
```solidity
function setEncryptedPathEnabled(bool enabled) external
```
- **Visibility**: External
- **State Mutability**: Nonpayable
- **Description**: Enable/disable encrypted path
- **Parameters**:
  - `enabled` (bool): Whether to enable encrypted path

#### isEncryptedPathActive
```solidity
function isEncryptedPathActive() external view returns (bool)
```
- **Visibility**: External
- **State Mutability**: View
- **Description**: Check if encrypted path is active
- **Returns**: `bool` - Encrypted path active status

### Custom Errors
- `Unauthorized` - Caller not authorized
- `InvalidConfiguration` - Invalid configuration

### Events
- `EncryptedPathEnabled(bool enabled)`

---

## Summary

### Total Contracts: 9

### By Category:
- Protocol: 1
- Vault: 1
- FHENIX: 7

### Total Metrics:
- **Total Size**: ~25,500 bytes
- **Total Deployment Gas**: ~3.85M
- **Total Initialization Gas**: ~440,000

### Interfaces Implemented:
- 8 custom interfaces
- 1 standalone contract

### Total Functions: ~25

### Total Custom Errors: ~20

### Total Events: ~15

---

## Deployment Considerations

### Gas Optimization
- Contracts are optimized for minimal gas usage
- Encrypted operations use efficient algorithms
- State variables are packed for storage efficiency

### Security
- All contracts implement access control
- Custom errors provide clear error messages
- Events enable transaction tracking

### Upgradability
- Contracts use proxy pattern where applicable
- Initialization functions allow configuration
- Owner/admin controls enable updates

---

## Last Updated

**Date**: January 8, 2026  
**Status**: Complete  
**Next Review**: After next deployment

