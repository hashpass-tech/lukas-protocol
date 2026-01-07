// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title EncryptedTypes
 * @notice Data structures for FHENIX encrypted parameters and configurations
 */

/**
 * @notice Represents an encrypted parameter with metadata
 */
struct EncryptedParameter {
    bytes encryptedValue;           // The encrypted parameter value
    uint256 encryptionTimestamp;    // When parameter was encrypted
    bytes encryptionMetadata;       // FHENIX-specific metadata
    bool isActive;                  // Whether parameter is currently in use
}

/**
 * @notice Configuration for FHENIX encryption
 */
struct EncryptionConfig {
    bytes publicKey;                // FHENIX public key
    uint256 encryptionLevel;        // Security level (128, 192, 256 bits)
    uint256 keyRotationInterval;    // Blocks between key rotations
    address decryptionAuthorizer;   // Address authorized to decrypt
    bool emergencyDecryptEnabled;   // Allow emergency decryption
}

/**
 * @notice Result of a homomorphic computation
 */
struct ComputationResult {
    bytes encryptedResult;          // Result of homomorphic computation
    uint256 computationGas;         // Gas used for computation
    bool requiresDecryption;        // Whether result needs decryption
    uint256 decryptionThreshold;    // Threshold for decryption authorization
}
