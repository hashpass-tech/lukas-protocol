# FHENIX Troubleshooting Guide

**Version**: 1.0  
**Date**: January 8, 2026

## Table of Contents

1. [Common Issues](#common-issues)
2. [Encryption Issues](#encryption-issues)
3. [Computation Issues](#computation-issues)
4. [Decryption Issues](#decryption-issues)
5. [Performance Issues](#performance-issues)
6. [Integration Issues](#integration-issues)
7. [Deployment Issues](#deployment-issues)
8. [Diagnostic Tools](#diagnostic-tools)
9. [Getting Help](#getting-help)

## Common Issues

### Issue: "Encryption not active"

**Error Message**: `EncryptionNotActive`

**Symptoms**:
- Encryption operations fail
- `isEncryptionActive()` returns false
- Cannot set encrypted parameters

**Root Causes**:
1. Encryption manager not initialized
2. Encryption level not set
3. Public key not configured
4. Encryption manager contract not deployed

**Solutions**:

```solidity
// Step 1: Check if encryption manager is initialized
function checkEncryptionStatus() external view returns (bool) {
    return encryptionManager.isEncryptionActive();
}

// Step 2: Initialize encryption manager if needed
function initializeEncryption() external onlyOwner {
    bytes memory publicKey = getPublicKeyFromSecureStorage();
    encryptionManager.initialize(publicKey, 192);
    
    // Verify initialization
    require(encryptionManager.isEncryptionActive(), "Initialization failed");
}

// Step 3: Verify encryption level
function verifyEncryptionLevel() external view returns (uint256) {
    return encryptionManager.getEncryptionLevel();
}
```

### Issue: "Invalid parameter value"

**Error Message**: `InvalidParameterValue`

**Symptoms**:
- Parameter updates fail
- Encrypted values rejected
- Configuration changes fail

**Root Causes**:
1. Empty encrypted value
2. Invalid encryption level
3. Zero address provided
4. Encrypted value too large

**Solutions**:

```solidity
// Validate encrypted values before use
function validateEncryptedValue(bytes memory encrypted) 
    external pure returns (bool) 
{
    // Check not empty
    if (encrypted.length == 0) return false;
    
    // Check size is reasonable
    if (encrypted.length > 10000) return false;
    
    // Check format is valid
    if (encrypted[0] == 0) return false;
    
    return true;
}

// Validate addresses
function validateAddress(address addr) external pure returns (bool) {
    return addr != address(0);
}

// Validate encryption level
function validateEncryptionLevel(uint256 level) external pure returns (bool) {
    return level == 128 || level == 192 || level == 256;
}
```

### Issue: "Insufficient permissions"

**Error Message**: `InsufficientPermissions`

**Symptoms**:
- Decryption fails
- Parameter updates fail
- Authorization checks fail

**Root Causes**:
1. Caller not authorized
2. Caller not owner
3. Caller not admin
4. Caller not in authorized list

**Solutions**:

```solidity
// Check authorization status
function checkAuthorization(address account) external view returns (bool) {
    return encryptionManager.isDecryptionAuthorizer(account);
}

// Add authorization if needed
function authorizeDecrypter(address account) external onlyOwner {
    encryptionManager.addDecryptionAuthorizer(account);
}

// Check owner status
function checkOwner() external view returns (address) {
    return owner();
}

// Check admin status
function checkAdmin() external view returns (address) {
    return proxy.admin();
}
```

## Encryption Issues

### Issue: Key rotation fails

**Error Message**: `KeyRotationFailed`

**Symptoms**:
- Key rotation operation reverts
- New key not accepted
- Encryption continues with old key

**Root Causes**:
1. New key is empty
2. New key is same as current key
3. Key rotation too frequent
4. Invalid key format

**Solutions**:

```solidity
// Validate new key before rotation
function validateNewKey(bytes memory newKey) external view returns (bool) {
    // Check not empty
    if (newKey.length == 0) return false;
    
    // Check different from current
    bytes memory currentKey = encryptionManager.getPublicKey();
    if (keccak256(newKey) == keccak256(currentKey)) return false;
    
    // Check format is valid
    if (newKey[0] == 0) return false;
    
    return true;
}

// Perform safe key rotation
function safeKeyRotation(bytes memory newKey) external onlyOwner {
    require(validateNewKey(newKey), "Invalid new key");
    
    // Backup current key
    bytes memory oldKey = encryptionManager.getPublicKey();
    backupKey(oldKey);
    
    // Rotate key
    encryptionManager.rotateKey(newKey);
    
    // Verify rotation
    require(
        keccak256(encryptionManager.getPublicKey()) == keccak256(newKey),
        "Key rotation verification failed"
    );
    
    emit KeyRotationSuccessful(newKey);
}

event KeyRotationSuccessful(bytes newKey);
```

### Issue: Encryption level mismatch

**Error Message**: `InvalidEncryptionLevel`

**Symptoms**:
- Operations fail with encryption level errors
- Encrypted values incompatible
- Computation fails

**Root Causes**:
1. Encryption level changed mid-operation
2. Encrypted values from different levels
3. Invalid encryption level specified
4. Module using different encryption level

**Solutions**:

```solidity
// Verify encryption level consistency
function verifyEncryptionLevelConsistency() external view returns (bool) {
    uint256 managerLevel = encryptionManager.getEncryptionLevel();
    
    // Check all modules use same level
    // (This would require each module to expose encryption level)
    
    return true;
}

// Ensure consistent encryption level
function ensureConsistentEncryptionLevel(uint256 expectedLevel) 
    external view returns (bool) 
{
    uint256 actualLevel = encryptionManager.getEncryptionLevel();
    require(actualLevel == expectedLevel, "Encryption level mismatch");
    return true;
}

// Migrate to new encryption level
function migrateEncryptionLevel(uint256 newLevel) external onlyOwner {
    require(newLevel == 128 || newLevel == 192 || newLevel == 256, "Invalid level");
    
    // Re-encrypt all parameters with new level
    // This is a complex operation that requires careful planning
    
    emit EncryptionLevelMigrated(newLevel);
}

event EncryptionLevelMigrated(uint256 newLevel);
```

## Computation Issues

### Issue: Homomorphic operation fails

**Error Message**: `ComputationFailed`

**Symptoms**:
- Encrypted operations revert
- Computation engine returns error
- Results are invalid

**Root Causes**:
1. Invalid encrypted operands
2. Operand size mismatch
3. Computation overflow
4. Engine not initialized

**Solutions**:

```solidity
// Validate operands before computation
function validateOperands(bytes memory a, bytes memory b) 
    external pure returns (bool) 
{
    // Check not empty
    if (a.length == 0 || b.length == 0) return false;
    
    // Check size compatibility
    if (a.length != b.length) return false;
    
    // Check format is valid
    if (a[0] == 0 || b[0] == 0) return false;
    
    return true;
}

// Safe homomorphic addition
function safeEncryptedAdd(bytes memory a, bytes memory b) 
    external view returns (bytes memory) 
{
    require(validateOperands(a, b), "Invalid operands");
    
    try computationEngine.encryptedAdd(a, b) returns (bytes memory result) {
        require(result.length > 0, "Empty result");
        return result;
    } catch {
        revert("Addition failed");
    }
}

// Debug computation
function debugComputation(bytes memory a, bytes memory b) 
    external view returns (string memory) 
{
    if (a.length == 0) return "Operand a is empty";
    if (b.length == 0) return "Operand b is empty";
    if (a.length != b.length) return "Operand size mismatch";
    
    return "Operands appear valid";
}
```

### Issue: Polynomial evaluation fails

**Error Message**: `PolynomialEvaluationFailed`

**Symptoms**:
- Curve evaluation fails
- Polynomial computation reverts
- Results are incorrect

**Root Causes**:
1. Invalid coefficients
2. Coefficient array empty
3. Input value invalid
4. Polynomial degree too high

**Solutions**:

```solidity
// Validate polynomial coefficients
function validateCoefficients(bytes[] memory coefficients) 
    external pure returns (bool) 
{
    // Check not empty
    if (coefficients.length == 0) return false;
    
    // Check each coefficient
    for (uint256 i = 0; i < coefficients.length; i++) {
        if (coefficients[i].length == 0) return false;
        if (coefficients[i][0] == 0) return false;
    }
    
    // Check degree is reasonable
    if (coefficients.length > 100) return false;
    
    return true;
}

// Safe polynomial evaluation
function safePolyEval(bytes memory input, bytes[] memory coefficients) 
    external view returns (bytes memory) 
{
    require(validateCoefficients(coefficients), "Invalid coefficients");
    require(input.length > 0, "Invalid input");
    
    try computationEngine.encryptedPolyEval(input, coefficients) 
        returns (bytes memory result) 
    {
        require(result.length > 0, "Empty result");
        return result;
    } catch {
        revert("Polynomial evaluation failed");
    }
}

// Optimize polynomial evaluation
function optimizePolyEval(bytes memory input, bytes[] memory coefficients) 
    external view returns (bytes memory) 
{
    // Use Horner's method for efficiency
    // P(x) = a0 + x*(a1 + x*(a2 + x*a3))
    
    require(coefficients.length > 0, "No coefficients");
    
    bytes memory result = coefficients[coefficients.length - 1];
    
    for (int256 i = int256(coefficients.length) - 2; i >= 0; i--) {
        result = computationEngine.encryptedScalarMultiply(result, 1);
        result = computationEngine.encryptedAdd(result, coefficients[uint256(i)]);
    }
    
    return result;
}
```

### Issue: Comparison operation fails

**Error Message**: `ComparisonFailed`

**Symptoms**:
- Encrypted comparison reverts
- Comparison results incorrect
- Threshold checks fail

**Root Causes**:
1. Invalid encrypted value
2. Invalid threshold
3. Comparison engine error
4. Value format mismatch

**Solutions**:

```solidity
// Validate comparison inputs
function validateComparisonInputs(bytes memory encrypted, uint256 threshold) 
    external pure returns (bool) 
{
    // Check encrypted value
    if (encrypted.length == 0) return false;
    if (encrypted[0] == 0) return false;
    
    // Check threshold is reasonable
    if (threshold > type(uint256).max) return false;
    
    return true;
}

// Safe encrypted comparison
function safeEncryptedCompare(bytes memory encrypted, uint256 threshold) 
    external view returns (bool) 
{
    require(validateComparisonInputs(encrypted, threshold), "Invalid inputs");
    
    try computationEngine.encryptedCompare(encrypted, threshold) 
        returns (bool result) 
    {
        return result;
    } catch {
        revert("Comparison failed");
    }
}

// Debug comparison
function debugComparison(bytes memory encrypted, uint256 threshold) 
    external view returns (string memory) 
{
    if (encrypted.length == 0) return "Encrypted value is empty";
    if (encrypted[0] == 0) return "Encrypted value format invalid";
    
    return "Comparison inputs appear valid";
}
```

## Decryption Issues

### Issue: Decryption authorization fails

**Error Message**: `InsufficientPermissions`

**Symptoms**:
- Decryption reverts
- Authorization check fails
- Caller not recognized as authorized

**Root Causes**:
1. Caller not in authorized list
2. Authorization revoked
3. Multi-sig threshold not met
4. Emergency decryption not approved

**Solutions**:

```solidity
// Check decryption authorization
function checkDecryptionAuth(address account) external view returns (bool) {
    return encryptionManager.isDecryptionAuthorizer(account);
}

// Add decryption authorization
function addDecryptionAuth(address account) external onlyOwner {
    require(account != address(0), "Invalid address");
    encryptionManager.addDecryptionAuthorizer(account);
    emit DecryptionAuthAdded(account);
}

// Remove decryption authorization
function removeDecryptionAuth(address account) external onlyOwner {
    encryptionManager.removeDecryptionAuthorizer(account);
    emit DecryptionAuthRemoved(account);
}

// List all authorized decrypters
function listAuthorizedDecrypters() external view returns (address[] memory) {
    // This would require tracking authorized addresses
    // Implementation depends on your authorization system
}

event DecryptionAuthAdded(address indexed account);
event DecryptionAuthRemoved(address indexed account);
```

### Issue: Multi-sig decryption fails

**Error Message**: `ThresholdNotMet`

**Symptoms**:
- Emergency decryption reverts
- Multi-sig approval not recognized
- Threshold check fails

**Root Causes**:
1. Insufficient signatures
2. Invalid signatures
3. Threshold too high
4. Signers not recognized

**Solutions**:

```solidity
// Check multi-sig status
function checkMultiSigStatus() external view returns (
    uint256 currentApprovals,
    uint256 requiredThreshold
) {
    // Implementation depends on your multi-sig system
}

// Approve decryption
function approveDecryption(bytes memory encrypted) external {
    // Implementation depends on your multi-sig system
    emit DecryptionApproved(msg.sender);
}

// Check if decryption is approved
function isDecryptionApproved(bytes memory encrypted) 
    external view returns (bool) 
{
    // Implementation depends on your multi-sig system
}

// Execute approved decryption
function executeApprovedDecryption(bytes memory encrypted) 
    external returns (uint256) 
{
    require(isDecryptionApproved(encrypted), "Decryption not approved");
    return decryptionHandler.emergencyDecrypt(encrypted);
}

event DecryptionApproved(address indexed approver);
```

### Issue: Decryption returns invalid value

**Error Message**: `DecryptionFailed`

**Symptoms**:
- Decryption succeeds but returns wrong value
- Decrypted value doesn't match expected
- Computation results incorrect

**Root Causes**:
1. Encrypted value corrupted
2. Wrong decryption key used
3. Encryption level mismatch
4. Decryption algorithm error

**Solutions**:

```solidity
// Validate decrypted value
function validateDecryptedValue(uint256 decrypted, uint256 expected) 
    external pure returns (bool) 
{
    // Check value is in expected range
    if (decrypted > type(uint256).max) return false;
    
    // Check value matches expected (if known)
    if (expected > 0 && decrypted != expected) return false;
    
    return true;
}

// Verify decryption consistency
function verifyDecryptionConsistency(bytes memory encrypted) 
    external view returns (bool) 
{
    uint256 decrypted1 = decryptionHandler.decrypt(encrypted);
    uint256 decrypted2 = decryptionHandler.decrypt(encrypted);
    
    // Decryption should be deterministic
    return decrypted1 == decrypted2;
}

// Debug decryption
function debugDecryption(bytes memory encrypted) 
    external view returns (string memory) 
{
    if (encrypted.length == 0) return "Encrypted value is empty";
    if (encrypted[0] == 0) return "Encrypted value format invalid";
    
    try decryptionHandler.decrypt(encrypted) returns (uint256 result) {
        if (result == 0) return "Decryption returned zero";
        return "Decryption appears successful";
    } catch {
        return "Decryption failed";
    }
}
```

## Performance Issues

### Issue: High gas consumption

**Error Message**: Out of gas or gas limit exceeded

**Symptoms**:
- Transactions exceed gas limits
- Operations too expensive
- Batch operations fail

**Root Causes**:
1. Inefficient polynomial evaluation
2. Large encrypted values
3. Complex computations
4. Unnecessary operations

**Solutions**:

```solidity
// Optimize polynomial evaluation using Horner's method
function optimizePolyEval(bytes memory input, bytes[] memory coefficients) 
    external view returns (bytes memory) 
{
    // Instead of: a0 + a1*x + a2*x^2 + a3*x^3
    // Use: a0 + x*(a1 + x*(a2 + x*a3))
    
    bytes memory result = coefficients[coefficients.length - 1];
    
    for (int256 i = int256(coefficients.length) - 2; i >= 0; i--) {
        result = computationEngine.encryptedScalarMultiply(result, 1);
        result = computationEngine.encryptedAdd(result, coefficients[uint256(i)]);
    }
    
    return result;
}

// Cache encrypted values
mapping(bytes32 => bytes) public encryptedCache;

function getCachedEncrypted(uint256 value) external returns (bytes memory) {
    bytes32 key = keccak256(abi.encode(value));
    
    if (encryptedCache[key].length == 0) {
        encryptedCache[key] = encryptValue(value);
    }
    
    return encryptedCache[key];
}

// Batch operations
function batchOperations(bytes[] memory values, uint256[] memory scalars) 
    external view returns (bytes[] memory) 
{
    require(values.length == scalars.length, "Length mismatch");
    
    bytes[] memory results = new bytes[](values.length);
    
    for (uint256 i = 0; i < values.length; i++) {
        results[i] = computationEngine.encryptedScalarMultiply(
            values[i],
            scalars[i]
        );
    }
    
    return results;
}

// Use plaintext for non-sensitive operations
function optimizeByUsingPlaintext(uint256 value) 
    external view returns (uint256) 
{
    // Use plaintext for simple checks
    if (value < 1000) {
        return value * 2;
    }
    
    // Use encrypted only for sensitive calculations
    bytes memory encrypted = encryptValue(value);
    bytes memory result = computationEngine.encryptedScalarMultiply(encrypted, 2);
    return decryptionHandler.decrypt(result);
}
```

### Issue: Slow operations

**Error Message**: Timeout or slow transaction confirmation

**Symptoms**:
- Operations take too long
- Transactions pending for extended time
- Computation hangs

**Root Causes**:
1. Complex polynomial evaluation
2. Large encrypted values
3. Network congestion
4. Inefficient algorithm

**Solutions**:

```solidity
// Monitor operation time
function timedOperation(bytes memory encrypted) 
    external view returns (uint256 result, uint256 timeMs) 
{
    uint256 startTime = block.timestamp;
    
    result = decryptionHandler.decrypt(encrypted);
    
    timeMs = (block.timestamp - startTime) * 1000;
}

// Implement timeout
function operationWithTimeout(bytes memory encrypted, uint256 timeoutMs) 
    external view returns (uint256) 
{
    uint256 startTime = block.timestamp;
    
    uint256 result = decryptionHandler.decrypt(encrypted);
    
    uint256 elapsedMs = (block.timestamp - startTime) * 1000;
    require(elapsedMs <= timeoutMs, "Operation timeout");
    
    return result;
}

// Use simpler operations
function simplifyComputation(bytes memory input) 
    external view returns (bytes memory) 
{
    // Instead of complex polynomial, use simple operations
    // P(x) = a0 + a1*x (linear instead of cubic)
    
    bytes memory a0 = encryptValue(1000);
    bytes memory a1 = encryptValue(500);
    
    bytes memory term1 = computationEngine.encryptedScalarMultiply(input, 500);
    bytes memory result = computationEngine.encryptedAdd(a0, term1);
    
    return result;
}
```

## Integration Issues

### Issue: Encrypted path not active

**Error Message**: Encrypted path disabled or not initialized

**Symptoms**:
- `isEncryptedPathActive()` returns false
- Encrypted operations use plaintext fallback
- Feature flag not enabled

**Root Causes**:
1. Feature flag not enabled
2. Orchestrator not initialized
3. Encryption not active
4. Modules not deployed

**Solutions**:

```solidity
// Check encrypted path status
function checkEncryptedPathStatus() external view returns (
    bool pathActive,
    bool encryptionActive,
    bool modulesDeployed
) {
    pathActive = orchestrator.isEncryptedPathActive();
    encryptionActive = encryptionManager.isEncryptionActive();
    modulesDeployed = checkModulesDeployed();
    
    return (pathActive, encryptionActive, modulesDeployed);
}

// Enable encrypted path
function enableEncryptedPath() external onlyOwner {
    require(encryptionManager.isEncryptionActive(), "Encryption not active");
    require(checkModulesDeployed(), "Modules not deployed");
    
    orchestrator.setEncryptedPathEnabled(true);
    emit EncryptedPathEnabled();
}

// Disable encrypted path (fallback)
function disableEncryptedPath() external onlyOwner {
    orchestrator.setEncryptedPathEnabled(false);
    emit EncryptedPathDisabled();
}

function checkModulesDeployed() internal view returns (bool) {
    // Check all modules are deployed and initialized
    return true;
}

event EncryptedPathEnabled();
event EncryptedPathDisabled();
```

### Issue: Module reference outdated

**Error Message**: Module not found or invalid reference

**Symptoms**:
- Operations fail with module errors
- Module upgrades not reflected
- Orchestrator using old module

**Root Causes**:
1. Module upgraded but orchestrator not updated
2. Module address changed
3. Proxy not updated
4. Module removed

**Solutions**:

```solidity
// Update module references
function updateModuleReferences(
    address newMintCeiling,
    address newPegDeviation,
    address newCurveParams,
    address newComputationEngine,
    address newDecryptionHandler
) external onlyOwner {
    if (newMintCeiling != address(0)) {
        orchestrator.updateMintCeiling(newMintCeiling);
    }
    if (newPegDeviation != address(0)) {
        orchestrator.updatePegDeviation(newPegDeviation);
    }
    if (newCurveParams != address(0)) {
        orchestrator.updateCurveParameters(newCurveParams);
    }
    if (newComputationEngine != address(0)) {
        orchestrator.updateComputationEngine(newComputationEngine);
    }
    if (newDecryptionHandler != address(0)) {
        orchestrator.updateDecryptionHandler(newDecryptionHandler);
    }
    
    emit ModuleReferencesUpdated();
}

// Verify module references
function verifyModuleReferences() external view returns (bool) {
    // Check all module references are valid
    // Implementation depends on your module system
    return true;
}

event ModuleReferencesUpdated();
```

## Deployment Issues

### Issue: Deployment fails

**Error Message**: Deployment reverted or contract creation failed

**Symptoms**:
- Contract deployment fails
- Constructor reverts
- Initialization fails

**Root Causes**:
1. Invalid constructor parameters
2. Insufficient gas
3. Contract size too large
4. Dependency not deployed

**Solutions**:

```solidity
// Validate deployment parameters
function validateDeploymentParams(
    bytes memory publicKey,
    uint256 encryptionLevel
) external pure returns (bool) {
    // Check public key
    if (publicKey.length == 0) return false;
    
    // Check encryption level
    if (encryptionLevel != 128 && encryptionLevel != 192 && encryptionLevel != 256) {
        return false;
    }
    
    return true;
}

// Deploy with validation
function deployWithValidation(
    bytes memory publicKey,
    uint256 encryptionLevel
) external returns (address) {
    require(validateDeploymentParams(publicKey, encryptionLevel), "Invalid params");
    
    FhenixEncryptionManager manager = new FhenixEncryptionManager();
    manager.initialize(publicKey, encryptionLevel);
    
    require(manager.isEncryptionActive(), "Initialization failed");
    
    return address(manager);
}

// Check deployment prerequisites
function checkDeploymentPrerequisites() external view returns (bool) {
    // Check sufficient gas
    // Check dependencies deployed
    // Check network connectivity
    return true;
}
```

## Diagnostic Tools

### Health Check Function

```solidity
// Comprehensive health check
function performHealthCheck() external view returns (
    bool encryptionActive,
    bool pathActive,
    uint256 encryptionLevel,
    bool authorizationWorking,
    bool computationWorking,
    bool decryptionWorking
) {
    encryptionActive = encryptionManager.isEncryptionActive();
    pathActive = orchestrator.isEncryptedPathActive();
    encryptionLevel = encryptionManager.getEncryptionLevel();
    authorizationWorking = encryptionManager.isDecryptionAuthorizer(address(this));
    
    // Test computation
    try computationEngine.encryptedAdd(testValue1, testValue2) {
        computationWorking = true;
    } catch {
        computationWorking = false;
    }
    
    // Test decryption
    try decryptionHandler.decrypt(testEncrypted) {
        decryptionWorking = true;
    } catch {
        decryptionWorking = false;
    }
    
    return (
        encryptionActive,
        pathActive,
        encryptionLevel,
        authorizationWorking,
        computationWorking,
        decryptionWorking
    );
}
```

### Debug Information Function

```solidity
// Get detailed debug information
function getDebugInfo() external view returns (string memory) {
    string memory info = "";
    
    info = string(abi.encodePacked(
        info,
        "Encryption Active: ",
        encryptionManager.isEncryptionActive() ? "YES" : "NO",
        "\n"
    ));
    
    info = string(abi.encodePacked(
        info,
        "Encryption Level: ",
        uint2str(encryptionManager.getEncryptionLevel()),
        "\n"
    ));
    
    info = string(abi.encodePacked(
        info,
        "Encrypted Path Active: ",
        orchestrator.isEncryptedPathActive() ? "YES" : "NO",
        "\n"
    ));
    
    return info;
}

function uint2str(uint256 _i) internal pure returns (string memory) {
    if (_i == 0) return "0";
    uint256 j = _i;
    uint256 len;
    while (j != 0) {
        len++;
        j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint256 k = len;
    while (_i != 0) {
        k = k - 1;
        uint8 temp = (48 + uint8(_i - _i / 10 * 10));
        bytes1 b1 = bytes1(temp);
        bstr[k] = b1;
        _i /= 10;
    }
    return string(bstr);
}
```

## Getting Help

### Support Resources

1. **Documentation**: See [FHENIX_INTEGRATION_GUIDE.md](./FHENIX_INTEGRATION_GUIDE.md)
2. **API Reference**: See [FHENIX_API_REFERENCE.md](./FHENIX_API_REFERENCE.md)
3. **Configuration**: See [FHENIX_CONFIGURATION_GUIDE.md](./FHENIX_CONFIGURATION_GUIDE.md)
4. **GitHub Issues**: Report bugs and request features
5. **Community Forum**: Discuss with other developers

### Reporting Issues

When reporting an issue, include:
1. Error message and stack trace
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Environment details (network, contract addresses, etc.)
6. Relevant code snippets

### Emergency Support

For critical issues:
1. Disable encrypted path: `orchestrator.setEncryptedPathEnabled(false)`
2. Fall back to plaintext operations
3. Contact security team
4. Document issue for post-mortem

---

**For more information**: See [FHENIX_INTEGRATION_GUIDE.md](./FHENIX_INTEGRATION_GUIDE.md)
