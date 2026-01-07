// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IEncryptedPegDeviation.sol";
import "../interfaces/IFhenixEncryptionManager.sol";
import "../types/EncryptedTypes.sol";
import "../errors/FhenixErrors.sol";

/**
 * @title EncryptedPegDeviation
 * @notice Manages encrypted peg deviation sensitivity parameter
 */
contract EncryptedPegDeviation is IEncryptedPegDeviation {
    /// @notice Reference to encryption manager
    IFhenixEncryptionManager public encryptionManager;

    /// @notice Encrypted peg deviation sensitivity parameter
    EncryptedParameter public encryptedDeviation;

    /// @notice Owner/admin address
    address public owner;

    event PegDeviationSet(uint256 timestamp);
    event PegDeviationDecrypted(uint256 value, uint256 timestamp);

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
     * @notice Set encrypted peg deviation sensitivity
     * @param encryptedValue The encrypted peg deviation sensitivity value
     */
    function setEncryptedPegDeviation(bytes calldata encryptedValue) external onlyOwner onlyEncryptionActive {
        if (encryptedValue.length == 0) revert InvalidEncryptedValue();

        encryptedDeviation = EncryptedParameter({
            encryptedValue: encryptedValue,
            encryptionTimestamp: block.timestamp,
            encryptionMetadata: "",
            isActive: true
        });

        emit PegDeviationSet(block.timestamp);
    }

    /**
     * @notice Get encrypted peg deviation sensitivity
     * @return The encrypted peg deviation sensitivity value
     */
    function getEncryptedPegDeviation() external view onlyEncryptionActive returns (bytes memory) {
        if (!encryptedDeviation.isActive) revert ParameterNotActive();
        return encryptedDeviation.encryptedValue;
    }

    /**
     * @notice Calculate adjustment using encrypted sensitivity via homomorphic computation
     * @param pegDeviation The peg deviation value
     * @return encryptedAdjustment The encrypted adjustment result
     */
    function calculateEncryptedAdjustment(
        int256 pegDeviation
    ) external view onlyEncryptionActive returns (bytes memory encryptedAdjustment) {
        if (!encryptedDeviation.isActive) revert ParameterNotActive();

        // In a real implementation, this would use homomorphic scalar multiplication
        // adjustment = encrypted_sensitivity * pegDeviation
        // For now, we return a placeholder
        return encryptedDeviation.encryptedValue;
    }

    /**
     * @notice Decrypt sensitivity for auditing (requires authorization)
     * @return The decrypted peg deviation sensitivity value
     */
    function decryptPegDeviation() external view onlyEncryptionActive returns (uint256) {
        if (!encryptedDeviation.isActive) revert ParameterNotActive();
        if (msg.sender != owner) revert DecryptionUnauthorized(msg.sender);

        // In a real implementation, this would call the decryption handler
        // For now, we return a placeholder value
        return 0;
    }

    /**
     * @notice Deactivate the encrypted deviation
     */
    function deactivateDeviation() external onlyOwner {
        encryptedDeviation.isActive = false;
    }
}
