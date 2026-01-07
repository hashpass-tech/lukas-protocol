# FHENIX Encrypted Stabilization Module

This directory contains the FHENIX (Fully Homomorphic Encryption) integration for the LUKAS protocol, enabling computation on encrypted stabilization parameters without decryption.

## Directory Structure

```
fhenix/
├── interfaces/              # Core interface definitions
│   ├── IFhenixEncryptionManager.sol
│   ├── IEncryptedMintCeiling.sol
│   ├── IEncryptedPegDeviation.sol
│   ├── IEncryptedCurveParameters.sol
│   ├── IFhenixComputationEngine.sol
│   └── IFhenixDecryptionHandler.sol
├── types/                   # Data structures and types
│   └── EncryptedTypes.sol
├── errors/                  # Error definitions
│   └── FhenixErrors.sol
├── core/                    # Core implementation contracts
│   ├── FhenixEncryptionManager.sol
│   ├── EncryptedMintCeiling.sol
│   ├── EncryptedPegDeviation.sol
│   ├── EncryptedCurveParameters.sol
│   ├── FhenixComputationEngine.sol
│   └── FhenixDecryptionHandler.sol
├── orchestration/           # Orchestration layer
│   └── EncryptionOrchestrator.sol
└── proxy/                   # Upgrade proxy pattern
    └── EncryptedParameterProxy.sol
```

## Core Components

### Interfaces

- **IFhenixEncryptionManager**: Manages encryption keys and lifecycle
- **IEncryptedMintCeiling**: Manages encrypted mint ceiling parameter
- **IEncryptedPegDeviation**: Manages encrypted peg deviation sensitivity
- **IEncryptedCurveParameters**: Manages encrypted stabilization curve parameters
- **IFhenixComputationEngine**: Performs homomorphic operations on encrypted data
- **IFhenixDecryptionHandler**: Manages decryption operations with authorization

### Data Types

- **EncryptedParameter**: Represents an encrypted parameter with metadata
- **EncryptionConfig**: Configuration for FHENIX encryption
- **ComputationResult**: Result of a homomorphic computation

### Error Handling

Custom errors are organized by category:
- **Encryption Errors**: Key management and encryption failures
- **Computation Errors**: Homomorphic operation failures
- **Decryption Errors**: Decryption authorization and operation failures
- **Parameter Errors**: Parameter validation and state errors
- **Authorization Errors**: Permission and state validation errors

## Implementation Phases

### Phase 1: Foundation (Non-Breaking)
- Deploy FHENIX encryption infrastructure
- Implement encryption manager and key management
- Deploy alongside existing unencrypted parameters

### Phase 2: Parameter Encryption (Gradual)
- Encrypt mint ceiling (optional parameter)
- Encrypt peg deviation sensitivity (optional parameter)
- Maintain dual-path execution (encrypted and unencrypted)

### Phase 3: Computation Migration (Controlled)
- Migrate stabilization calculations to use encrypted parameters
- Implement homomorphic computation engine
- Validate results against unencrypted baseline

### Phase 4: Full Integration (Production)
- Complete migration to encrypted parameters
- Deprecate unencrypted paths
- Optimize gas consumption

## Security Considerations

1. **Key Management**: FHENIX keys stored securely with rotation support
2. **Decryption Authorization**: Multi-sig required for emergency decryption
3. **Computation Verification**: All homomorphic operations verified against plaintext baseline
4. **Audit Trail**: All encryption/decryption operations logged
5. **Gradual Rollout**: Encrypted parameters optional initially, enabling rollback

## Testing

Tests are organized in `packages/contracts/test/fhenix/`:
- Unit tests for each component
- Property-based tests for correctness properties
- Integration tests for end-to-end flows

Each property-based test validates universal correctness properties:
- Encryption round-trip consistency
- Homomorphic operation correctness
- Encrypted comparison equivalence
- Polynomial evaluation correctness
- Encryption integrity preservation
- Parameter immutability during computation
- Decryption authorization enforcement
