# FHENIX API Reference

**Version**: 1.0  
**Date**: January 8, 2026

## Table of Contents

1. [FhenixEncryptionManager](#fhenixencryptionmanager)
2. [EncryptedMintCeiling](#encryptedmintceiling)
3. [EncryptedPegDeviation](#encryptedpegdeviation)
4. [EncryptedCurveParameters](#encryptedcurveparameters)
5. [FhenixComputationEngine](#fhenixcomputationengine)
6. [FhenixDecryptionHandler](#fhenixdecryptionhandler)
7. [EncryptionOrchestrator](#encryptionorchestrator)
8. [EncryptedParameterProxy](#encryptedparameterproxy)
9. [Data Types](#data-types)
10. [Error Codes](#error-codes)

---

## FhenixEncryptionManager

**File**: `src/fhenix/core/FhenixEncryptionManager.sol`  
**Purpose**: Manages encryption keys, lifecycle, and decryption authorization

### Functions

#### `initialize(bytes memory publicKey, uint256 encryptionLevel)`

Initializes the encryption manager with FHENIX public key and encryption level.

**Parameters**:
- `publicKey` (bytes): FHENIX public key for encryption
- `encryptionLevel` (uint256): Encryption level (128, 192, or 256 bits)

**Requirements**:
- Only owner can call
- Public key must not be empty
- Encryption level must be 128, 192, or 256

**Emits**: `EncryptionInitialized(bytes publicKey, uint256 encryptionLevel)`

**Example**:
```solidity
encryptionManager.initialize(fhenixPublicKey, 192);
```

#### `getPublicKey() → bytes memory`

Returns the current FHENIX public key.

**Returns**: Current public key

**Example**:
```solidity
bytes memory key = encryptionManager.getPublicKey();
```

#### `rotateKey(bytes memory newPublicKey)`

Rotates the encryption key to a new public key.

**Parameters**:
- `newPublicKey` (bytes): New FHENIX public key

**Requirements**:
- Only owner can call
- New key must not be empty
- New key must be different from current key

**Emits**: `KeyRotated(bytes newPublicKey, uint256 timestamp)`

**Example**:
```solidity
encryptionManager.rotateKey(newPublicKey);
```

#### `getEncryptionLevel() → uint256`

Returns the current encryption level.

**Returns**: Encryption level (128, 192, or 256)

**Example**:
```solidity
uint256 level = encryptionManager.getEncryptionLevel();
```

#### `isEncryptionActive() → bool`

Checks if encryption is active and initialized.

**Returns**: true if encryption is active, false otherwise

**Example**:
```solidity
require(encryptionManager.isEncryptionActive(), "Encryption not active");
```

#### `addDecryptionAuthorizer(address authorizer)`

Adds an address to the list of authorized decrypters.

**Parameters**:
- `authorizer` (address): Address to authorize for decryption

**Requirements**:
- Only owner can call
- Address must not be zero
- Address must not already be authorized

**Emits**: `DecryptionAuthorizerAdded(address indexed authorizer)`

**Example**:
```solidity
encryptionManager.addDecryptionAuthorizer(emergencyMultisig);
```

#### `removeDecryptionAuthorizer(address authorizer)`

Removes an address from the list of authorized decrypters.

**Parameters**:
- `authorizer` (address): Address to remove from authorization

**Requirements**:
- Only owner can call
- Address must be currently authorized

**Emits**: `DecryptionAuthorizerRemoved(address indexed authorizer)`

**Example**:
```solidity
encryptionManager.removeDecryptionAuthorizer(oldMultisig);
```

#### `isDecryptionAuthorizer(address account) → bool`

Checks if an address is authorized to decrypt.

**Parameters**:
- `account` (address): Address to check

**Returns**: true if authorized, false otherwise

**Example**:
```solidity
require(
    encryptionManager.isDecryptionAuthorizer(msg.sender),
    "Not authorized to decrypt"
);
```

---

## EncryptedMintCeiling

**File**: `src/fhenix/core/EncryptedMintCeiling.sol`  
**Purpose**: Manages encrypted mint ceiling parameter

### Functions

#### `setEncryptedMintCeiling(bytes memory encryptedValue)`

Sets the encrypted mint ceiling value.

**Parameters**:
- `encryptedValue` (bytes): Encrypted mint ceiling value

**Requirements**:
- Only owner can call
- Encrypted value must not be empty
- Encryption must be active

**Emits**: `EncryptedMintCeilingUpdated(bytes encryptedValue, uint256 timestamp)`

**Example**:
```solidity
bytes memory encrypted = encryptMintCeiling(1000 ether);
mintCeiling.setEncryptedMintCeiling(encrypted);
```

#### `getEncryptedMintCeiling() → bytes memory`

Returns the current encrypted mint ceiling value.

**Returns**: Encrypted mint ceiling

**Requirements**:
- Parameter must be active

**Example**:
```solidity
bytes memory encrypted = mintCeiling.getEncryptedMintCeiling();
```

#### `isSupplyWithinCeiling(bytes memory encryptedSupply) → bool`

Checks if supply is within the encrypted ceiling using homomorphic comparison.

**Parameters**:
- `encryptedSupply` (bytes): Encrypted supply value

**Returns**: true if supply is within ceiling, false otherwise

**Requirements**:
- Parameter must be active
- Encrypted supply must be valid

**Example**:
```solidity
bytes memory encryptedSupply = encryptValue(currentSupply);
bool withinCeiling = mintCeiling.isSupplyWithinCeiling(encryptedSupply);
```

#### `decryptMintCeiling() → uint256`

Decrypts and returns the mint ceiling value.

**Returns**: Plaintext mint ceiling

**Requirements**:
- Caller must be authorized decrypter
- Parameter must be active

**Emits**: `MintCeilingDecrypted(address indexed requester, uint256 timestamp)`

**Example**:
```solidity
uint256 ceiling = mintCeiling.decryptMintCeiling();
```

#### `setActive(bool active)`

Activates or deactivates the parameter.

**Parameters**:
- `active` (bool): true to activate, false to deactivate

**Requirements**:
- Only owner can call

**Emits**: `ParameterActivated(bool active)`

**Example**:
```solidity
mintCeiling.setActive(true);
```

#### `isActive() → bool`

Checks if the parameter is active.

**Returns**: true if active, false otherwise

**Example**:
```solidity
require(mintCeiling.isActive(), "Parameter not active");
```

---

## EncryptedPegDeviation

**File**: `src/fhenix/core/EncryptedPegDeviation.sol`  
**Purpose**: Manages encrypted peg deviation sensitivity parameter

### Functions

#### `setEncryptedPegDeviation(bytes memory encryptedValue)`

Sets the encrypted peg deviation sensitivity value.

**Parameters**:
- `encryptedValue` (bytes): Encrypted peg deviation value

**Requirements**:
- Only owner can call
- Encrypted value must not be empty
- Encryption must be active

**Emits**: `EncryptedPegDeviationUpdated(bytes encryptedValue, uint256 timestamp)`

**Example**:
```solidity
bytes memory encrypted = encryptPegDeviation(5); // 0.5%
pegDeviation.setEncryptedPegDeviation(encrypted);
```

#### `getEncryptedPegDeviation() → bytes memory`

Returns the current encrypted peg deviation value.

**Returns**: Encrypted peg deviation

**Requirements**:
- Parameter must be active

**Example**:
```solidity
bytes memory encrypted = pegDeviation.getEncryptedPegDeviation();
```

#### `calculateEncryptedAdjustment(bytes memory encryptedSupply) → bytes memory`

Calculates encrypted adjustment using homomorphic scalar multiplication.

**Parameters**:
- `encryptedSupply` (bytes): Encrypted supply value

**Returns**: Encrypted adjustment result

**Requirements**:
- Parameter must be active
- Encrypted supply must be valid

**Example**:
```solidity
bytes memory encryptedSupply = encryptValue(supply);
bytes memory adjustment = pegDeviation.calculateEncryptedAdjustment(encryptedSupply);
```

#### `decryptPegDeviation() → uint256`

Decrypts and returns the peg deviation value.

**Returns**: Plaintext peg deviation

**Requirements**:
- Caller must be authorized decrypter
- Parameter must be active

**Emits**: `PegDeviationDecrypted(address indexed requester, uint256 timestamp)`

**Example**:
```solidity
uint256 deviation = pegDeviation.decryptPegDeviation();
```

#### `setActive(bool active)`

Activates or deactivates the parameter.

**Parameters**:
- `active` (bool): true to activate, false to deactivate

**Requirements**:
- Only owner can call

**Emits**: `ParameterActivated(bool active)`

**Example**:
```solidity
pegDeviation.setActive(true);
```

#### `isActive() → bool`

Checks if the parameter is active.

**Returns**: true if active, false otherwise

**Example**:
```solidity
require(pegDeviation.isActive(), "Parameter not active");
```

---

## EncryptedCurveParameters

**File**: `src/fhenix/core/EncryptedCurveParameters.sol`  
**Purpose**: Manages encrypted stabilization curve parameters

### Functions

#### `setEncryptedCurveParameters(bytes[] memory encryptedCoefficients)`

Sets the encrypted curve parameter coefficients.

**Parameters**:
- `encryptedCoefficients` (bytes[]): Array of encrypted polynomial coefficients

**Requirements**:
- Only owner can call
- Array must not be empty
- All coefficients must be valid encrypted values
- Encryption must be active

**Emits**: `EncryptedCurveParametersUpdated(uint256 coefficientCount, uint256 timestamp)`

**Example**:
```solidity
bytes[] memory coeffs = new bytes[](3);
coeffs[0] = encryptValue(1000);  // a0
coeffs[1] = encryptValue(500);   // a1
coeffs[2] = encryptValue(100);   // a2
curveParams.setEncryptedCurveParameters(coeffs);
```

#### `getEncryptedCurveParameters() → bytes[] memory`

Returns the current encrypted curve parameter coefficients.

**Returns**: Array of encrypted coefficients

**Requirements**:
- Parameter must be active

**Example**:
```solidity
bytes[] memory coeffs = curveParams.getEncryptedCurveParameters();
```

#### `evaluateEncryptedCurve(bytes memory encryptedInput) → bytes memory`

Evaluates the encrypted curve using homomorphic polynomial evaluation.

**Parameters**:
- `encryptedInput` (bytes): Encrypted input value

**Returns**: Encrypted evaluation result

**Requirements**:
- Parameter must be active
- Encrypted input must be valid

**Example**:
```solidity
bytes memory encryptedSupply = encryptValue(supply);
bytes memory result = curveParams.evaluateEncryptedCurve(encryptedSupply);
```

#### `decryptCurveParameters() → uint256[] memory`

Decrypts and returns the curve parameter coefficients.

**Returns**: Array of plaintext coefficients

**Requirements**:
- Caller must be authorized decrypter
- Parameter must be active

**Emits**: `CurveParametersDecrypted(address indexed requester, uint256 timestamp)`

**Example**:
```solidity
uint256[] memory coeffs = curveParams.decryptCurveParameters();
```

#### `setActive(bool active)`

Activates or deactivates the parameter.

**Parameters**:
- `active` (bool): true to activate, false to deactivate

**Requirements**:
- Only owner can call

**Emits**: `ParameterActivated(bool active)`

**Example**:
```solidity
curveParams.setActive(true);
```

#### `isActive() → bool`

Checks if the parameter is active.

**Returns**: true if active, false otherwise

**Example**:
```solidity
require(curveParams.isActive(), "Parameter not active");
```

---

## FhenixComputationEngine

**File**: `src/fhenix/core/FhenixComputationEngine.sol`  
**Purpose**: Performs homomorphic operations on encrypted data

### Functions

#### `encryptedAdd(bytes memory a, bytes memory b) → bytes memory`

Performs homomorphic addition on two encrypted values.

**Parameters**:
- `a` (bytes): First encrypted value
- `b` (bytes): Second encrypted value

**Returns**: Encrypted sum (a + b)

**Requirements**:
- Both encrypted values must be valid
- Encryption must be active

**Example**:
```solidity
bytes memory result = computationEngine.encryptedAdd(encrypted1, encrypted2);
```

#### `encryptedScalarMultiply(bytes memory encrypted, uint256 scalar) → bytes memory`

Performs homomorphic scalar multiplication on an encrypted value.

**Parameters**:
- `encrypted` (bytes): Encrypted value
- `scalar` (uint256): Scalar multiplier

**Returns**: Encrypted product (encrypted * scalar)

**Requirements**:
- Encrypted value must be valid
- Encryption must be active

**Example**:
```solidity
bytes memory result = computationEngine.encryptedScalarMultiply(encrypted, 5);
```

#### `encryptedCompare(bytes memory encrypted, uint256 threshold) → bool`

Performs homomorphic comparison on an encrypted value.

**Parameters**:
- `encrypted` (bytes): Encrypted value
- `threshold` (uint256): Comparison threshold

**Returns**: true if encrypted value >= threshold, false otherwise

**Requirements**:
- Encrypted value must be valid
- Encryption must be active

**Example**:
```solidity
bool result = computationEngine.encryptedCompare(encrypted, 1000);
```

#### `encryptedPolyEval(bytes memory encrypted, bytes[] memory coefficients) → bytes memory`

Performs homomorphic polynomial evaluation on an encrypted value.

**Parameters**:
- `encrypted` (bytes): Encrypted input value
- `coefficients` (bytes[]): Array of encrypted polynomial coefficients

**Returns**: Encrypted polynomial evaluation result

**Requirements**:
- Encrypted value must be valid
- Coefficients array must not be empty
- All coefficients must be valid encrypted values
- Encryption must be active

**Example**:
```solidity
bytes memory result = computationEngine.encryptedPolyEval(
    encryptedInput,
    encryptedCoefficients
);
```

---

## FhenixDecryptionHandler

**File**: `src/fhenix/core/FhenixDecryptionHandler.sol`  
**Purpose**: Manages decryption operations with authorization

### Functions

#### `decrypt(bytes memory encrypted) → uint256`

Decrypts an encrypted value with authorization check.

**Parameters**:
- `encrypted` (bytes): Encrypted value to decrypt

**Returns**: Plaintext decrypted value

**Requirements**:
- Caller must be authorized decrypter
- Encrypted value must be valid

**Emits**: `DecryptionPerformed(address indexed requester, uint256 timestamp)`

**Example**:
```solidity
uint256 plaintext = decryptionHandler.decrypt(encrypted);
```

#### `decryptWithThreshold(bytes memory encrypted, uint256 threshold) → uint256`

Decrypts an encrypted value with threshold-based authorization.

**Parameters**:
- `encrypted` (bytes): Encrypted value to decrypt
- `threshold` (uint256): Authorization threshold

**Returns**: Plaintext decrypted value

**Requirements**:
- Caller must have sufficient authorization level
- Encrypted value must be valid

**Emits**: `ThresholdDecryptionPerformed(address indexed requester, uint256 threshold, uint256 timestamp)`

**Example**:
```solidity
uint256 plaintext = decryptionHandler.decryptWithThreshold(encrypted, 2);
```

#### `emergencyDecrypt(bytes memory encrypted) → uint256`

Performs emergency decryption requiring multi-sig approval.

**Parameters**:
- `encrypted` (bytes): Encrypted value to decrypt

**Returns**: Plaintext decrypted value

**Requirements**:
- Caller must be multi-sig contract
- Multi-sig approval must be obtained
- Encrypted value must be valid

**Emits**: `EmergencyDecryptionPerformed(address indexed requester, uint256 timestamp)`

**Example**:
```solidity
uint256 plaintext = decryptionHandler.emergencyDecrypt(encrypted);
```

#### `getDecryptionThreshold() → uint256`

Returns the current decryption threshold.

**Returns**: Current threshold value

**Example**:
```solidity
uint256 threshold = decryptionHandler.getDecryptionThreshold();
```

#### `setDecryptionThreshold(uint256 threshold)`

Sets the decryption threshold.

**Parameters**:
- `threshold` (uint256): New threshold value

**Requirements**:
- Only owner can call

**Emits**: `DecryptionThresholdUpdated(uint256 newThreshold)`

**Example**:
```solidity
decryptionHandler.setDecryptionThreshold(2);
```

---

## EncryptionOrchestrator

**File**: `src/fhenix/orchestration/EncryptionOrchestrator.sol`  
**Purpose**: Coordinates encrypted parameter modules

### Functions

#### `setEncryptedPathEnabled(bool enabled)`

Enables or disables the encrypted computation path.

**Parameters**:
- `enabled` (bool): true to enable, false to disable

**Requirements**:
- Only owner can call

**Emits**: `EncryptedPathToggled(bool enabled, uint256 timestamp)`

**Example**:
```solidity
orchestrator.setEncryptedPathEnabled(true);
```

#### `isEncryptedPathActive() → bool`

Checks if the encrypted computation path is active.

**Returns**: true if encrypted path is active, false otherwise

**Example**:
```solidity
if (orchestrator.isEncryptedPathActive()) {
    // Use encrypted path
} else {
    // Use plaintext path
}
```

#### `isSupplyWithinCeiling(bytes memory encryptedSupply) → bool`

Checks if supply is within the encrypted ceiling.

**Parameters**:
- `encryptedSupply` (bytes): Encrypted supply value

**Returns**: true if within ceiling, false otherwise

**Requirements**:
- Encrypted path must be active
- Encrypted supply must be valid

**Example**:
```solidity
bytes memory encryptedSupply = encryptValue(supply);
bool withinCeiling = orchestrator.isSupplyWithinCeiling(encryptedSupply);
```

#### `calculateEncryptedAdjustment(bytes memory encryptedSupply, bytes memory encryptedDeviation) → bytes memory`

Calculates encrypted stabilization adjustment.

**Parameters**:
- `encryptedSupply` (bytes): Encrypted supply value
- `encryptedDeviation` (bytes): Encrypted deviation sensitivity

**Returns**: Encrypted adjustment result

**Requirements**:
- Encrypted path must be active
- Both encrypted values must be valid

**Example**:
```solidity
bytes memory adjustment = orchestrator.calculateEncryptedAdjustment(
    encryptedSupply,
    encryptedDeviation
);
```

#### `evaluateEncryptedCurve(bytes memory encryptedSupply, bytes[] memory encryptedCoefficients) → bytes memory`

Evaluates the encrypted stabilization curve.

**Parameters**:
- `encryptedSupply` (bytes): Encrypted supply value
- `encryptedCoefficients` (bytes[]): Encrypted curve coefficients

**Returns**: Encrypted curve evaluation result

**Requirements**:
- Encrypted path must be active
- Both encrypted values must be valid

**Example**:
```solidity
bytes memory result = orchestrator.evaluateEncryptedCurve(
    encryptedSupply,
    encryptedCoefficients
);
```

#### `updateMintCeiling(address newModule)`

Updates the mint ceiling module reference.

**Parameters**:
- `newModule` (address): New module address

**Requirements**:
- Only owner can call
- New module must not be zero address

**Emits**: `MintCeilingUpdated(address indexed newModule)`

**Example**:
```solidity
orchestrator.updateMintCeiling(newMintCeilingAddress);
```

#### `updatePegDeviation(address newModule)`

Updates the peg deviation module reference.

**Parameters**:
- `newModule` (address): New module address

**Requirements**:
- Only owner can call
- New module must not be zero address

**Emits**: `PegDeviationUpdated(address indexed newModule)`

**Example**:
```solidity
orchestrator.updatePegDeviation(newPegDeviationAddress);
```

#### `updateCurveParameters(address newModule)`

Updates the curve parameters module reference.

**Parameters**:
- `newModule` (address): New module address

**Requirements**:
- Only owner can call
- New module must not be zero address

**Emits**: `CurveParametersUpdated(address indexed newModule)`

**Example**:
```solidity
orchestrator.updateCurveParameters(newCurveParametersAddress);
```

#### `updateComputationEngine(address newModule)`

Updates the computation engine module reference.

**Parameters**:
- `newModule` (address): New module address

**Requirements**:
- Only owner can call
- New module must not be zero address

**Emits**: `ComputationEngineUpdated(address indexed newModule)`

**Example**:
```solidity
orchestrator.updateComputationEngine(newComputationEngineAddress);
```

#### `updateDecryptionHandler(address newModule)`

Updates the decryption handler module reference.

**Parameters**:
- `newModule` (address): New module address

**Requirements**:
- Only owner can call
- New module must not be zero address

**Emits**: `DecryptionHandlerUpdated(address indexed newModule)`

**Example**:
```solidity
orchestrator.updateDecryptionHandler(newDecryptionHandlerAddress);
```

---

## EncryptedParameterProxy

**File**: `src/fhenix/proxy/EncryptedParameterProxy.sol`  
**Purpose**: Proxy pattern for independent module upgrades

### Functions

#### `upgrade(address newImplementation)`

Upgrades to a new implementation contract.

**Parameters**:
- `newImplementation` (address): New implementation address

**Requirements**:
- Only admin can call
- New implementation must not be zero address
- New implementation must be different from current
- New implementation must have code

**Emits**: `Upgraded(address indexed newImplementation, uint256 timestamp)`

**Example**:
```solidity
proxy.upgrade(newImplementationAddress);
```

#### `changeAdmin(address newAdmin)`

Changes the proxy admin address.

**Parameters**:
- `newAdmin` (address): New admin address

**Requirements**:
- Only current admin can call
- New admin must not be zero address

**Emits**: `AdminChanged(address indexed newAdmin)`

**Example**:
```solidity
proxy.changeAdmin(newAdminAddress);
```

#### `getUpgradeHistory() → address[] memory`

Returns the complete upgrade history.

**Returns**: Array of all implementation addresses in order

**Example**:
```solidity
address[] memory history = proxy.getUpgradeHistory();
```

#### `getUpgradeCount() → uint256`

Returns the number of upgrades performed.

**Returns**: Total upgrade count

**Example**:
```solidity
uint256 count = proxy.getUpgradeCount();
```

#### `implementation() → address`

Returns the current implementation address.

**Returns**: Current implementation address

**Example**:
```solidity
address impl = proxy.implementation();
```

#### `admin() → address`

Returns the current admin address.

**Returns**: Current admin address

**Example**:
```solidity
address currentAdmin = proxy.admin();
```

---

## Data Types

### EncryptedParameter

```solidity
struct EncryptedParameter {
    bytes encryptedValue;      // Encrypted parameter value
    uint256 encryptionLevel;   // Encryption level used (128, 192, 256)
    uint256 timestamp;         // Timestamp of encryption
    bool isActive;             // Whether parameter is active
}
```

### EncryptionConfig

```solidity
struct EncryptionConfig {
    bytes publicKey;           // FHENIX public key
    uint256 encryptionLevel;   // Encryption level (128, 192, 256)
    uint256 keyRotationInterval; // Key rotation interval in seconds
    bool isActive;             // Whether encryption is active
}
```

### ComputationResult

```solidity
struct ComputationResult {
    bytes encryptedResult;     // Encrypted computation result
    uint256 gasUsed;           // Gas used for computation
    uint256 timestamp;         // Timestamp of computation
    bool success;              // Whether computation succeeded
}
```

---

## Error Codes

### Encryption Errors

| Error | Code | Description |
|-------|------|-------------|
| `InvalidParameterValue` | 0x01 | Invalid parameter value provided |
| `EncryptionNotActive` | 0x02 | Encryption is not active |
| `InvalidEncryptionLevel` | 0x03 | Invalid encryption level |
| `KeyRotationFailed` | 0x04 | Key rotation operation failed |

### Computation Errors

| Error | Code | Description |
|-------|------|-------------|
| `ComputationFailed` | 0x10 | Homomorphic computation failed |
| `InvalidOperands` | 0x11 | Invalid operands for computation |
| `PolynomialEvaluationFailed` | 0x12 | Polynomial evaluation failed |
| `ComparisonFailed` | 0x13 | Comparison operation failed |

### Decryption Errors

| Error | Code | Description |
|-------|------|-------------|
| `DecryptionFailed` | 0x20 | Decryption operation failed |
| `InsufficientPermissions` | 0x21 | Caller lacks required permissions |
| `ThresholdNotMet` | 0x22 | Multi-sig threshold not met |
| `InvalidEncryptedValue` | 0x23 | Invalid encrypted value |

### Parameter Errors

| Error | Code | Description |
|-------|------|-------------|
| `ParameterNotActive` | 0x30 | Parameter is not active |
| `InvalidParameterState` | 0x31 | Invalid parameter state |
| `ParameterUpdateFailed` | 0x32 | Parameter update failed |

### Authorization Errors

| Error | Code | Description |
|-------|------|-------------|
| `UnauthorizedAccess` | 0x40 | Unauthorized access attempt |
| `OnlyOwner` | 0x41 | Only owner can call this function |
| `OnlyAdmin` | 0x42 | Only admin can call this function |

---

**For more information**: See [FHENIX_INTEGRATION_GUIDE.md](./FHENIX_INTEGRATION_GUIDE.md)
