// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FhenixErrors
 * @notice Custom error definitions for FHENIX encryption operations
 */

// ============ Encryption Errors ============

/**
 * @notice Thrown when FHENIX public key is malformed or invalid
 */
error InvalidPublicKey();

/**
 * @notice Thrown when encryption operation fails
 */
error EncryptionFailed(string reason);

/**
 * @notice Thrown when key rotation operation fails
 */
error KeyRotationFailed(string reason);

/**
 * @notice Thrown when encryption is not initialized
 */
error EncryptionNotInitialized();

// ============ Computation Errors ============

/**
 * @notice Thrown when encrypted value is corrupted or invalid
 */
error InvalidEncryptedValue();

/**
 * @notice Thrown when homomorphic computation would overflow
 */
error ComputationOverflow();

/**
 * @notice Thrown when requested homomorphic operation is not supported
 */
error UnsupportedOperation(string operation);

/**
 * @notice Thrown when computation parameters are invalid
 */
error InvalidComputationParameters();

// ============ Decryption Errors ============

/**
 * @notice Thrown when caller is not authorized to decrypt
 */
error DecryptionUnauthorized(address caller);

/**
 * @notice Thrown when decryption operation fails
 */
error DecryptionFailed(string reason);

/**
 * @notice Thrown when threshold signature requirements are not met
 */
error InvalidDecryptionThreshold();

/**
 * @notice Thrown when decryption is attempted but not authorized
 */
error DecryptionNotAuthorized();

// ============ Parameter Errors ============

/**
 * @notice Thrown when parameter is accessed before encryption
 */
error ParameterNotEncrypted();

/**
 * @notice Thrown when parameter is not currently active
 */
error ParameterNotActive();

/**
 * @notice Thrown when parameter value is outside acceptable range
 */
error InvalidParameterValue(string reason);

/**
 * @notice Thrown when parameter update fails
 */
error ParameterUpdateFailed(string reason);

// ============ Authorization Errors ============

/**
 * @notice Thrown when caller lacks required permissions
 */
error InsufficientPermissions(address caller);

/**
 * @notice Thrown when operation is not allowed in current state
 */
error InvalidOperationState(string state);
