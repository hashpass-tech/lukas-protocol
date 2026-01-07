// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IEncryptedMintCeiling.sol";
import "../interfaces/IFhenixEncryptionManager.sol";
import "../types/EncryptedTypes.sol";
import "../errors/FhenixErrors.sol";

/**
 * @title EncryptedMintCeiling
 * @notice Manages encrypted mint ceiling parameter
 */
contract EncryptedMintCeiling is IEncryptedMintCeiling {
    /// @notice Reference to encryption manager
    IFhenixEncryptionManager public encryptionManager;

    /// @notice Encrypted mint ceiling parameter
    EncryptedParameter public encryptedCeiling;

    /// @notice Owner/admin address
    address public owner;

    event MintCeilingSet(uint256 timestamp);
    event MintCeilingDecrypted(uint256 value, uint256 timestamp);

    modifier onlyOwner() {
        if (msg.sender != owner) revert InsufficientPermissions(msg.sender);
        _;
    }

    modifier onlyEncryptionActive() {
        if (!encryptionManager.isEncryptionActive()) revert EncryptionNotInitialized();
        _;
    }

    constructor(address _encryptionManager, address _owner) {
        if (_encryptionManager == address(0)) revert InvalidParameterValue("Invalid encryption manager");
        encryptionManager = IFhenixEncryptionManager(_encryptionManager);
        owner = _owner;
    }

    /**
     * @notice Set encrypted mint ceiling
     * @param encryptedValue The encrypted mint ceiling value
     */
    function setEncryptedMintCeiling(bytes calldata encryptedValue) external onlyOwner onlyEncryptionActive {
        if (encryptedValue.length == 0) revert InvalidEncryptedValue();

        encryptedCeiling = EncryptedParameter({
            encryptedValue: encryptedValue,
            encryptionTimestamp: block.timestamp,
            encryptionMetadata: "",
            isActive: true
        });

        emit MintCeilingSet(block.timestamp);
    }

    /**
     * @notice Get encrypted mint ceiling
     * @return The encrypted mint ceiling value
     */
    function getEncryptedMintCeiling() external view onlyEncryptionActive returns (bytes memory) {
        if (!encryptedCeiling.isActive) revert ParameterNotActive();
        return encryptedCeiling.encryptedValue;
    }

    /**
     * @notice Check if current supply exceeds encrypted ceiling using homomorphic comparison
     * @param currentSupply The current token supply
     * @return True if supply is within ceiling, false otherwise
     */
    function isSupplyWithinCeiling(uint256 currentSupply) external view onlyEncryptionActive returns (bool) {
        if (!encryptedCeiling.isActive) revert ParameterNotActive();

        // In a real implementation, this would use homomorphic comparison
        // For now, we return true as a placeholder
        // The actual comparison would be: encrypted_ceiling >= currentSupply
        return true;
    }

    /**
     * @notice Decrypt mint ceiling for emergency operations (requires authorization)
     * @return The decrypted mint ceiling value
     */
    function decryptMintCeiling() external view onlyEncryptionActive returns (uint256) {
        if (!encryptedCeiling.isActive) revert ParameterNotActive();
        if (msg.sender != owner) revert DecryptionUnauthorized(msg.sender);

        // In a real implementation, this would call the decryption handler
        // For now, we return a placeholder value
        return 0;
    }

    /**
     * @notice Deactivate the encrypted ceiling
     */
    function deactivateCeiling() external onlyOwner {
        encryptedCeiling.isActive = false;
    }
}
