# FHENIX Configuration Guide

**Version**: 1.0  
**Date**: January 8, 2026

## Table of Contents

1. [Overview](#overview)
2. [Encryption Level Configuration](#encryption-level-configuration)
3. [Key Management Configuration](#key-management-configuration)
4. [Decryption Authorization Configuration](#decryption-authorization-configuration)
5. [Feature Flag Configuration](#feature-flag-configuration)
6. [Module Configuration](#module-configuration)
7. [Performance Tuning](#performance-tuning)
8. [Security Configuration](#security-configuration)
9. [Monitoring Configuration](#monitoring-configuration)
10. [Best Practices](#best-practices)

## Overview

This guide provides detailed configuration instructions for deploying and managing FHENIX encryption in the LUKAS protocol. Proper configuration is critical for security, performance, and reliability.

## Encryption Level Configuration

### Choosing the Right Encryption Level

FHENIX supports three encryption levels with different security and performance tradeoffs:

| Level | Security | Performance | Use Case | Recommended |
|-------|----------|-------------|----------|------------|
| 128 | Standard | Fast | Development, Testing | ❌ |
| 192 | High | Medium | Production | ✅ |
| 256 | Maximum | Slower | High-Security | ⚠️ |

### Configuration Examples

#### Development Environment (128-bit)

```solidity
// Deploy encryption manager with 128-bit encryption
FhenixEncryptionManager encryptionManager = new FhenixEncryptionManager();
encryptionManager.initialize(devPublicKey, 128);

// Suitable for:
// - Local testing
// - Testnet validation
// - Development iterations
```

#### Production Environment (192-bit)

```solidity
// Deploy encryption manager with 192-bit encryption
FhenixEncryptionManager encryptionManager = new FhenixEncryptionManager();
encryptionManager.initialize(prodPublicKey, 192);

// Suitable for:
// - Mainnet deployment
// - Production use
// - Standard security requirements
```

#### High-Security Environment (256-bit)

```solidity
// Deploy encryption manager with 256-bit encryption
FhenixEncryptionManager encryptionManager = new FhenixEncryptionManager();
encryptionManager.initialize(highSecPublicKey, 256);

// Suitable for:
// - Government/institutional use
// - Maximum security requirements
// - Long-term data protection
```

### Encryption Level Implications

**128-bit Encryption**:
- Gas cost: ~5,000 per operation
- Computation time: ~2ms per operation
- Security: Adequate for short-term protection
- Recommendation: Development only

**192-bit Encryption** (Recommended):
- Gas cost: ~8,500 per operation
- Computation time: ~4ms per operation
- Security: Strong for production use
- Recommendation: Production deployments

**256-bit Encryption**:
- Gas cost: ~12,000 per operation
- Computation time: ~6ms per operation
- Security: Maximum protection
- Recommendation: High-security scenarios

## Key Management Configuration

### Initial Key Setup

```solidity
// Step 1: Generate FHENIX key pair (off-chain)
// Use FHENIX library to generate public/private key pair
// Store private key securely (e.g., HSM, secure enclave)

// Step 2: Deploy encryption manager
FhenixEncryptionManager encryptionManager = new FhenixEncryptionManager();

// Step 3: Initialize with public key
bytes memory publicKey = getPublicKeyFromSecureStorage();
encryptionManager.initialize(publicKey, 192);

// Step 4: Verify initialization
require(encryptionManager.isEncryptionActive(), "Encryption not active");
```

### Key Rotation Strategy

```solidity
// Recommended: Rotate keys every 30 days
contract KeyRotationManager {
    FhenixEncryptionManager public encryptionManager;
    uint256 public constant KEY_ROTATION_INTERVAL = 30 days;
    uint256 public lastKeyRotation;
    
    constructor(address _encryptionManager) {
        encryptionManager = FhenixEncryptionManager(_encryptionManager);
        lastKeyRotation = block.timestamp;
    }
    
    function rotateKeyIfNeeded() external {
        if (block.timestamp >= lastKeyRotation + KEY_ROTATION_INTERVAL) {
            bytes memory newPublicKey = getNewPublicKeyFromSecureStorage();
            encryptionManager.rotateKey(newPublicKey);
            lastKeyRotation = block.timestamp;
            
            emit KeyRotated(block.timestamp);
        }
    }
    
    event KeyRotated(uint256 timestamp);
}
```

### Key Storage Best Practices

```solidity
// ✅ DO: Store keys in secure locations
// - Hardware Security Module (HSM)
// - Secure enclave (Intel SGX, ARM TrustZone)
// - Key management service (AWS KMS, Azure Key Vault)
// - Multi-sig wallet for critical keys

// ❌ DON'T: Store keys in plaintext
// - Don't hardcode keys in contracts
// - Don't store in environment variables
// - Don't commit to version control
// - Don't log key material
```

### Key Backup and Recovery

```solidity
// Implement key backup strategy
contract KeyBackupManager {
    // Store encrypted key backups
    mapping(uint256 => bytes) public keyBackups;
    uint256 public backupCount;
    
    function backupKey(bytes memory encryptedKey) external onlyOwner {
        keyBackups[backupCount] = encryptedKey;
        backupCount++;
        emit KeyBackedUp(backupCount - 1);
    }
    
    function recoverKey(uint256 backupIndex) external onlyOwner {
        require(backupIndex < backupCount, "Invalid backup index");
        bytes memory encryptedKey = keyBackups[backupIndex];
        // Decrypt and restore key
        emit KeyRecovered(backupIndex);
    }
    
    event KeyBackedUp(uint256 indexed backupIndex);
    event KeyRecovered(uint256 indexed backupIndex);
}
```

## Decryption Authorization Configuration

### Single-Sig Authorization

```solidity
// Simple authorization for non-critical operations
contract SimpleDecryptionAuth {
    FhenixEncryptionManager public encryptionManager;
    address public authorizedDecrypter;
    
    constructor(address _encryptionManager, address _decrypter) {
        encryptionManager = FhenixEncryptionManager(_encryptionManager);
        authorizedDecrypter = _decrypter;
        encryptionManager.addDecryptionAuthorizer(_decrypter);
    }
    
    function decrypt(bytes memory encrypted) external view returns (uint256) {
        require(msg.sender == authorizedDecrypter, "Not authorized");
        // Perform decryption
    }
}
```

### Multi-Sig Authorization

```solidity
// Multi-sig authorization for critical operations
contract MultiSigDecryptionAuth {
    FhenixEncryptionManager public encryptionManager;
    address[] public signers;
    uint256 public requiredSignatures;
    
    mapping(bytes32 => uint256) public approvals;
    
    constructor(
        address _encryptionManager,
        address[] memory _signers,
        uint256 _requiredSignatures
    ) {
        encryptionManager = FhenixEncryptionManager(_encryptionManager);
        signers = _signers;
        requiredSignatures = _requiredSignatures;
        
        for (uint256 i = 0; i < _signers.length; i++) {
            encryptionManager.addDecryptionAuthorizer(_signers[i]);
        }
    }
    
    function approveDecryption(bytes memory encrypted) external {
        require(isSigner(msg.sender), "Not a signer");
        
        bytes32 decryptionHash = keccak256(encrypted);
        approvals[decryptionHash]++;
        
        if (approvals[decryptionHash] >= requiredSignatures) {
            // Perform decryption
            emit DecryptionApproved(decryptionHash);
        }
    }
    
    function isSigner(address account) internal view returns (bool) {
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == account) return true;
        }
        return false;
    }
    
    event DecryptionApproved(bytes32 indexed decryptionHash);
}
```

### Threshold-Based Authorization

```solidity
// Threshold-based authorization with levels
contract ThresholdDecryptionAuth {
    FhenixEncryptionManager public encryptionManager;
    
    mapping(address => uint256) public authorizationLevel;
    
    uint256 public constant LEVEL_NONE = 0;
    uint256 public constant LEVEL_STANDARD = 1;
    uint256 public constant LEVEL_SENSITIVE = 2;
    uint256 public constant LEVEL_CRITICAL = 3;
    
    constructor(address _encryptionManager) {
        encryptionManager = FhenixEncryptionManager(_encryptionManager);
    }
    
    function setAuthorizationLevel(address account, uint256 level) 
        external onlyOwner 
    {
        authorizationLevel[account] = level;
        if (level > LEVEL_NONE) {
            encryptionManager.addDecryptionAuthorizer(account);
        }
    }
    
    function decrypt(bytes memory encrypted, uint256 requiredLevel) 
        external view returns (uint256) 
    {
        require(
            authorizationLevel[msg.sender] >= requiredLevel,
            "Insufficient authorization level"
        );
        // Perform decryption
    }
}
```

## Feature Flag Configuration

### Gradual Rollout Strategy

```solidity
// Phase 1: Encrypted path disabled (plaintext only)
contract Phase1Deployment {
    EncryptionOrchestrator public orchestrator;
    
    constructor(address _orchestrator) {
        orchestrator = EncryptionOrchestrator(_orchestrator);
        // Encrypted path disabled by default
        orchestrator.setEncryptedPathEnabled(false);
    }
}

// Phase 2: Encrypted path enabled (dual-path)
contract Phase2Deployment {
    EncryptionOrchestrator public orchestrator;
    
    function enableEncryptedPath() external onlyOwner {
        orchestrator.setEncryptedPathEnabled(true);
        emit EncryptedPathEnabled();
    }
    
    event EncryptedPathEnabled();
}

// Phase 3: Plaintext path deprecated (encrypted only)
contract Phase3Deployment {
    EncryptionOrchestrator public orchestrator;
    
    function disablePlaintextPath() external onlyOwner {
        // Ensure encrypted path is active
        require(orchestrator.isEncryptedPathActive(), "Encrypted path not active");
        // Disable plaintext path
        emit PlaintextPathDisabled();
    }
    
    event PlaintextPathDisabled();
}
```

### Feature Flag Management

```solidity
// Centralized feature flag management
contract FeatureFlagManager {
    mapping(string => bool) public flags;
    
    event FlagUpdated(string indexed flagName, bool value);
    
    function setFlag(string memory flagName, bool value) external onlyOwner {
        flags[flagName] = value;
        emit FlagUpdated(flagName, value);
    }
    
    function isEnabled(string memory flagName) external view returns (bool) {
        return flags[flagName];
    }
    
    // Usage in orchestrator
    function performOperation() external {
        if (flags["encrypted_path_enabled"]) {
            // Use encrypted path
        } else {
            // Use plaintext path
        }
    }
}
```

## Module Configuration

### Module Deployment Order

```solidity
// Correct deployment order
contract ModuleDeployment {
    function deployModules() external returns (
        address encryptionManager,
        address mintCeiling,
        address pegDeviation,
        address curveParams,
        address computationEngine,
        address decryptionHandler,
        address orchestrator
    ) {
        // Step 1: Deploy encryption manager
        encryptionManager = address(new FhenixEncryptionManager());
        
        // Step 2: Deploy parameter modules
        mintCeiling = address(new EncryptedMintCeiling(encryptionManager));
        pegDeviation = address(new EncryptedPegDeviation(encryptionManager));
        curveParams = address(new EncryptedCurveParameters(encryptionManager));
        
        // Step 3: Deploy computation engine
        computationEngine = address(new FhenixComputationEngine(encryptionManager));
        
        // Step 4: Deploy decryption handler
        decryptionHandler = address(new FhenixDecryptionHandler(encryptionManager));
        
        // Step 5: Deploy orchestrator
        orchestrator = address(new EncryptionOrchestrator(
            encryptionManager,
            mintCeiling,
            pegDeviation,
            curveParams,
            computationEngine,
            decryptionHandler
        ));
        
        return (
            encryptionManager,
            mintCeiling,
            pegDeviation,
            curveParams,
            computationEngine,
            decryptionHandler,
            orchestrator
        );
    }
}
```

### Module Upgrade Configuration

```solidity
// Configure module upgrades using proxy pattern
contract ModuleUpgradeConfig {
    mapping(string => address) public moduleProxies;
    
    function upgradeModule(string memory moduleName, address newImplementation) 
        external onlyOwner 
    {
        address proxy = moduleProxies[moduleName];
        require(proxy != address(0), "Module not found");
        
        EncryptedParameterProxy(proxy).upgrade(newImplementation);
        emit ModuleUpgraded(moduleName, newImplementation);
    }
    
    event ModuleUpgraded(string indexed moduleName, address indexed newImplementation);
}
```

## Performance Tuning

### Gas Optimization

```solidity
// Optimize gas usage
contract GasOptimization {
    // Cache encrypted values to avoid recomputation
    mapping(bytes32 => bytes) public encryptedValueCache;
    
    function getOrEncryptValue(uint256 value) 
        external returns (bytes memory) 
    {
        bytes32 key = keccak256(abi.encode(value));
        
        if (encryptedValueCache[key].length == 0) {
            bytes memory encrypted = encryptValue(value);
            encryptedValueCache[key] = encrypted;
        }
        
        return encryptedValueCache[key];
    }
    
    // Batch operations to reduce overhead
    function batchEncryptedOperations(
        bytes[] memory values,
        uint256[] memory scalars
    ) external view returns (bytes[] memory) {
        bytes[] memory results = new bytes[](values.length);
        
        for (uint256 i = 0; i < values.length; i++) {
            results[i] = computationEngine.encryptedScalarMultiply(
                values[i],
                scalars[i]
            );
        }
        
        return results;
    }
}
```

### Computation Optimization

```solidity
// Optimize polynomial evaluation
contract PolyOptimization {
    // Use Horner's method for efficient polynomial evaluation
    // P(x) = a0 + a1*x + a2*x^2 + a3*x^3
    // Horner: P(x) = a0 + x*(a1 + x*(a2 + x*a3))
    
    function evaluateOptimized(
        bytes memory encryptedX,
        bytes[] memory coefficients
    ) external view returns (bytes memory) {
        require(coefficients.length > 0, "No coefficients");
        
        bytes memory result = coefficients[coefficients.length - 1];
        
        for (int256 i = int256(coefficients.length) - 2; i >= 0; i--) {
            result = computationEngine.encryptedScalarMultiply(result, 1); // x
            result = computationEngine.encryptedAdd(result, coefficients[uint256(i)]);
        }
        
        return result;
    }
}
```

## Security Configuration

### Access Control

```solidity
// Implement role-based access control
contract AccessControl {
    bytes32 public constant OWNER_ROLE = keccak256("OWNER");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant DECRYPTER_ROLE = keccak256("DECRYPTER");
    
    mapping(bytes32 => mapping(address => bool)) public roles;
    
    modifier onlyRole(bytes32 role) {
        require(roles[role][msg.sender], "Insufficient permissions");
        _;
    }
    
    function grantRole(bytes32 role, address account) external onlyRole(OWNER_ROLE) {
        roles[role][account] = true;
    }
    
    function revokeRole(bytes32 role, address account) external onlyRole(OWNER_ROLE) {
        roles[role][account] = false;
    }
}
```

### Audit Logging

```solidity
// Comprehensive audit logging
contract AuditLogger {
    event EncryptionInitialized(bytes publicKey, uint256 encryptionLevel, uint256 timestamp);
    event KeyRotated(bytes newPublicKey, uint256 timestamp);
    event DecryptionAttempted(address indexed requester, bool authorized, uint256 timestamp);
    event ParameterUpdated(string indexed parameterName, address indexed updater, uint256 timestamp);
    event ModuleUpgraded(string indexed moduleName, address indexed newImplementation, uint256 timestamp);
    
    function logEncryptionInitialized(bytes memory publicKey, uint256 encryptionLevel) 
        internal 
    {
        emit EncryptionInitialized(publicKey, encryptionLevel, block.timestamp);
    }
    
    function logDecryptionAttempted(address requester, bool authorized) 
        internal 
    {
        emit DecryptionAttempted(requester, authorized, block.timestamp);
    }
}
```

### Rate Limiting

```solidity
// Rate limit sensitive operations
contract RateLimiter {
    mapping(address => uint256) public lastDecryptionTime;
    uint256 public constant DECRYPTION_COOLDOWN = 1 hours;
    
    modifier rateLimited() {
        require(
            block.timestamp >= lastDecryptionTime[msg.sender] + DECRYPTION_COOLDOWN,
            "Rate limit exceeded"
        );
        _;
        lastDecryptionTime[msg.sender] = block.timestamp;
    }
    
    function decrypt(bytes memory encrypted) 
        external rateLimited returns (uint256) 
    {
        // Perform decryption
    }
}
```

## Monitoring Configuration

### Health Checks

```solidity
// Monitor encryption system health
contract HealthMonitor {
    FhenixEncryptionManager public encryptionManager;
    
    struct HealthStatus {
        bool encryptionActive;
        uint256 encryptionLevel;
        uint256 lastKeyRotation;
        uint256 operationCount;
        uint256 failureCount;
    }
    
    function getHealthStatus() external view returns (HealthStatus memory) {
        return HealthStatus({
            encryptionActive: encryptionManager.isEncryptionActive(),
            encryptionLevel: encryptionManager.getEncryptionLevel(),
            lastKeyRotation: getLastKeyRotation(),
            operationCount: getOperationCount(),
            failureCount: getFailureCount()
        });
    }
    
    function isHealthy() external view returns (bool) {
        HealthStatus memory status = getHealthStatus();
        return status.encryptionActive && 
               status.failureCount < 10 &&
               block.timestamp < getLastKeyRotation() + 60 days;
    }
}
```

### Metrics Collection

```solidity
// Collect performance metrics
contract MetricsCollector {
    struct Metrics {
        uint256 totalOperations;
        uint256 successfulOperations;
        uint256 failedOperations;
        uint256 totalGasUsed;
        uint256 averageGasPerOperation;
    }
    
    Metrics public metrics;
    
    function recordOperation(uint256 gasUsed, bool success) internal {
        metrics.totalOperations++;
        metrics.totalGasUsed += gasUsed;
        
        if (success) {
            metrics.successfulOperations++;
        } else {
            metrics.failedOperations++;
        }
        
        metrics.averageGasPerOperation = metrics.totalGasUsed / metrics.totalOperations;
    }
    
    function getSuccessRate() external view returns (uint256) {
        if (metrics.totalOperations == 0) return 0;
        return (metrics.successfulOperations * 100) / metrics.totalOperations;
    }
}
```

## Best Practices

### Configuration Checklist

- [ ] Choose appropriate encryption level (192-bit recommended)
- [ ] Generate and securely store FHENIX keys
- [ ] Configure key rotation (every 30 days)
- [ ] Set up decryption authorization (multi-sig for critical operations)
- [ ] Enable feature flags for gradual rollout
- [ ] Deploy modules in correct order
- [ ] Configure access control and audit logging
- [ ] Set up monitoring and health checks
- [ ] Test all configurations in testnet
- [ ] Document all configuration decisions

### Configuration Validation

```solidity
// Validate configuration before deployment
contract ConfigurationValidator {
    function validateConfiguration(
        address encryptionManager,
        address orchestrator
    ) external view returns (bool) {
        // Check encryption is active
        require(
            FhenixEncryptionManager(encryptionManager).isEncryptionActive(),
            "Encryption not active"
        );
        
        // Check encryption level is valid
        uint256 level = FhenixEncryptionManager(encryptionManager).getEncryptionLevel();
        require(level == 128 || level == 192 || level == 256, "Invalid encryption level");
        
        // Check orchestrator is properly configured
        require(
            EncryptionOrchestrator(orchestrator).isEncryptedPathActive() ||
            !EncryptionOrchestrator(orchestrator).isEncryptedPathActive(),
            "Orchestrator not configured"
        );
        
        return true;
    }
}
```

---

**For more information**: See [FHENIX_INTEGRATION_GUIDE.md](./FHENIX_INTEGRATION_GUIDE.md)
