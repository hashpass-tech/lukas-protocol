// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IFhenixEncryptionManager
 * @notice Interface for managing FHENIX encryption keys and lifecycle
 */
interface IFhenixEncryptionManager {
    /**
     * @notice Initialize encryption with FHENIX parameters
     * @param fhenixPublicKey The FHENIX public key for encryption
     * @param encryptionLevel The security level (128, 192, 256 bits)
     */
    function initializeEncryption(
        bytes calldata fhenixPublicKey,
        uint256 encryptionLevel
    ) external;

    /**
     * @notice Get current encryption public key
     * @return The current FHENIX public key
     */
    function getPublicKey() external view returns (bytes memory);

    /**
     * @notice Rotate encryption keys for upgrades
     * @param newPublicKey The new FHENIX public key
     */
    function rotateKeys(bytes calldata newPublicKey) external;

    /**
     * @notice Check if encryption is active
     * @return True if encryption is initialized and active
     */
    function isEncryptionActive() external view returns (bool);
}
