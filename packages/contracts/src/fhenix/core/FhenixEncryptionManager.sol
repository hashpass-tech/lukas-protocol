// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IFhenixEncryptionManager.sol";
import "../types/EncryptedTypes.sol";
import "../errors/FhenixErrors.sol";

/**
 * @title FhenixEncryptionManager
 * @notice Manages FHENIX encryption keys and lifecycle
 */
contract FhenixEncryptionManager is IFhenixEncryptionManager {
    /// @notice Current encryption configuration
    EncryptionConfig public encryptionConfig;

    /// @notice Track key rotation history
    uint256 public lastKeyRotation;

    /// @notice Owner/admin address
    address public owner;

    /// @notice Whether encryption is initialized
    bool public initialized;

    event EncryptionInitialized(uint256 encryptionLevel, uint256 timestamp);
    event KeyRotated(bytes newPublicKey, uint256 timestamp);

    modifier onlyOwner() {
        if (msg.sender != owner) revert InsufficientPermissions(msg.sender);
        _;
    }

    modifier onlyInitialized() {
        if (!initialized) revert EncryptionNotInitialized();
        _;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    /**
     * @notice Initialize encryption with FHENIX parameters
     * @param fhenixPublicKey The FHENIX public key for encryption
     * @param encryptionLevel The security level (128, 192, 256 bits)
     */
    function initializeEncryption(
        bytes calldata fhenixPublicKey,
        uint256 encryptionLevel
    ) external onlyOwner {
        if (fhenixPublicKey.length == 0) revert InvalidPublicKey();
        if (encryptionLevel != 128 && encryptionLevel != 192 && encryptionLevel != 256) {
            revert InvalidParameterValue("Invalid encryption level");
        }

        encryptionConfig = EncryptionConfig({
            publicKey: fhenixPublicKey,
            encryptionLevel: encryptionLevel,
            keyRotationInterval: 100000, // ~2 weeks at 12s blocks
            decryptionAuthorizer: msg.sender,
            emergencyDecryptEnabled: false
        });

        lastKeyRotation = block.number;
        initialized = true;

        emit EncryptionInitialized(encryptionLevel, block.timestamp);
    }

    /**
     * @notice Get current encryption public key
     * @return The current FHENIX public key
     */
    function getPublicKey() external view onlyInitialized returns (bytes memory) {
        return encryptionConfig.publicKey;
    }

    /**
     * @notice Rotate encryption keys for upgrades
     * @param newPublicKey The new FHENIX public key
     */
    function rotateKeys(bytes calldata newPublicKey) external onlyOwner onlyInitialized {
        if (newPublicKey.length == 0) revert InvalidPublicKey();

        uint256 blocksSinceRotation = block.number - lastKeyRotation;
        if (blocksSinceRotation < encryptionConfig.keyRotationInterval) {
            revert KeyRotationFailed("Key rotation interval not elapsed");
        }

        encryptionConfig.publicKey = newPublicKey;
        lastKeyRotation = block.number;

        emit KeyRotated(newPublicKey, block.timestamp);
    }

    /**
     * @notice Check if encryption is active
     * @return True if encryption is initialized and active
     */
    function isEncryptionActive() external view returns (bool) {
        return initialized;
    }

    /**
     * @notice Update decryption authorizer
     * @param newAuthorizer The new decryption authorizer address
     */
    function setDecryptionAuthorizer(address newAuthorizer) external onlyOwner onlyInitialized {
        if (newAuthorizer == address(0)) revert InvalidParameterValue("Invalid authorizer");
        encryptionConfig.decryptionAuthorizer = newAuthorizer;
    }

    /**
     * @notice Enable/disable emergency decryption
     * @param enabled Whether emergency decryption is enabled
     */
    function setEmergencyDecryptEnabled(bool enabled) external onlyOwner onlyInitialized {
        encryptionConfig.emergencyDecryptEnabled = enabled;
    }

    /**
     * @notice Get encryption configuration
     * @return The current encryption configuration
     */
    function getEncryptionConfig() external view onlyInitialized returns (EncryptionConfig memory) {
        return encryptionConfig;
    }
}
