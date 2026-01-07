// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IEncryptedCurveParameters.sol";
import "../interfaces/IFhenixEncryptionManager.sol";
import "../types/EncryptedTypes.sol";
import "../errors/FhenixErrors.sol";

/**
 * @title EncryptedCurveParameters
 * @notice Manages encrypted stabilization curve parameters
 */
contract EncryptedCurveParameters is IEncryptedCurveParameters {
    /// @notice Reference to encryption manager
    IFhenixEncryptionManager public encryptionManager;

    /// @notice Encrypted curve coefficients
    bytes[] public encryptedCoefficients;

    /// @notice Whether curve parameters are active
    bool public isActive;

    /// @notice Owner/admin address
    address public owner;

    /// @notice Timestamp of last parameter update
    uint256 public lastUpdateTimestamp;

    event CurveParametersSet(uint256 coefficientCount, uint256 timestamp);
    event CurveParametersDecrypted(uint256 coefficientCount, uint256 timestamp);

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
        isActive = false;
    }

    /**
     * @notice Set encrypted curve parameters (coefficients)
     * @param _encryptedCoefficients Array of encrypted polynomial coefficients
     */
    function setEncryptedCurveParameters(bytes[] calldata _encryptedCoefficients)
        external
        onlyOwner
        onlyEncryptionActive
    {
        if (_encryptedCoefficients.length == 0) revert InvalidParameterValue("No coefficients provided");

        // Clear existing coefficients
        delete encryptedCoefficients;

        // Store new coefficients
        for (uint256 i = 0; i < _encryptedCoefficients.length; i++) {
            if (_encryptedCoefficients[i].length == 0) revert InvalidEncryptedValue();
            encryptedCoefficients.push(_encryptedCoefficients[i]);
        }

        isActive = true;
        lastUpdateTimestamp = block.timestamp;

        emit CurveParametersSet(_encryptedCoefficients.length, block.timestamp);
    }

    /**
     * @notice Get encrypted curve parameters
     * @return Array of encrypted polynomial coefficients
     */
    function getEncryptedCurveParameters() external view onlyEncryptionActive returns (bytes[] memory) {
        if (!isActive) revert ParameterNotActive();
        return encryptedCoefficients;
    }

    /**
     * @notice Evaluate curve using encrypted parameters via homomorphic polynomial evaluation
     * @param input The input value for polynomial evaluation
     * @return encryptedOutput The encrypted polynomial evaluation result
     */
    function evaluateEncryptedCurve(uint256 input)
        external
        view
        onlyEncryptionActive
        returns (bytes memory encryptedOutput)
    {
        if (!isActive) revert ParameterNotActive();
        if (encryptedCoefficients.length == 0) revert ParameterNotActive();

        // In a real implementation, this would use homomorphic polynomial evaluation
        // result = c0 + c1*x + c2*x^2 + ... + cn*x^n (all on encrypted data)
        // For now, we return the first coefficient as a placeholder
        return encryptedCoefficients[0];
    }

    /**
     * @notice Decrypt parameters for auditing (requires authorization)
     * @return Array of decrypted polynomial coefficients
     */
    function decryptCurveParameters() external view onlyEncryptionActive returns (uint256[] memory) {
        if (!isActive) revert ParameterNotActive();
        if (msg.sender != owner) revert DecryptionUnauthorized(msg.sender);

        // In a real implementation, this would call the decryption handler
        // For now, we return an empty array as a placeholder
        uint256[] memory result = new uint256[](encryptedCoefficients.length);
        return result;
    }

    /**
     * @notice Get number of encrypted coefficients
     * @return The number of coefficients
     */
    function getCoefficientCount() external view returns (uint256) {
        return encryptedCoefficients.length;
    }

    /**
     * @notice Deactivate the encrypted curve parameters
     */
    function deactivateParameters() external onlyOwner {
        isActive = false;
    }
}
