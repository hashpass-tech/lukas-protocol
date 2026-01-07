// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IFhenixEncryptionManager.sol";
import "../interfaces/IEncryptedMintCeiling.sol";
import "../interfaces/IEncryptedPegDeviation.sol";
import "../interfaces/IEncryptedCurveParameters.sol";
import "../interfaces/IFhenixComputationEngine.sol";
import "../interfaces/IFhenixDecryptionHandler.sol";
import "../errors/FhenixErrors.sol";

/**
 * @title EncryptionOrchestrator
 * @notice Coordinates encrypted parameter modules and routes operations
 */
contract EncryptionOrchestrator {
    /// @notice Encryption manager reference
    IFhenixEncryptionManager public encryptionManager;

    /// @notice Encrypted parameter module references
    IEncryptedMintCeiling public encryptedMintCeiling;
    IEncryptedPegDeviation public encryptedPegDeviation;
    IEncryptedCurveParameters public encryptedCurveParameters;

    /// @notice Computation engine reference
    IFhenixComputationEngine public computationEngine;

    /// @notice Decryption handler reference
    IFhenixDecryptionHandler public decryptionHandler;

    /// @notice Owner/admin address
    address public owner;

    /// @notice Feature flag for encrypted path
    bool public encryptedPathEnabled;

    event EncryptedPathEnabled(bool enabled);
    event ModuleRegistered(string moduleName, address moduleAddress);

    modifier onlyOwner() {
        if (msg.sender != owner) revert InsufficientPermissions(msg.sender);
        _;
    }

    constructor(
        address _encryptionManager,
        address _encryptedMintCeiling,
        address _encryptedPegDeviation,
        address _encryptedCurveParameters,
        address _computationEngine,
        address _decryptionHandler,
        address _owner
    ) {
        if (_encryptionManager == address(0)) revert InvalidParameterValue("Invalid encryption manager");
        if (_owner == address(0)) revert InvalidParameterValue("Invalid owner");

        encryptionManager = IFhenixEncryptionManager(_encryptionManager);
        encryptedMintCeiling = IEncryptedMintCeiling(_encryptedMintCeiling);
        encryptedPegDeviation = IEncryptedPegDeviation(_encryptedPegDeviation);
        encryptedCurveParameters = IEncryptedCurveParameters(_encryptedCurveParameters);
        computationEngine = IFhenixComputationEngine(_computationEngine);
        decryptionHandler = IFhenixDecryptionHandler(_decryptionHandler);
        owner = _owner;
        encryptedPathEnabled = false;
    }

    /**
     * @notice Enable/disable encrypted path
     * @param enabled Whether to enable encrypted path
     */
    function setEncryptedPathEnabled(bool enabled) external onlyOwner {
        encryptedPathEnabled = enabled;
        emit EncryptedPathEnabled(enabled);
    }

    /**
     * @notice Check if supply is within encrypted ceiling
     * @param currentSupply The current token supply
     * @return True if supply is within ceiling
     */
    function checkMintCeiling(uint256 currentSupply) external view returns (bool) {
        if (!encryptionManager.isEncryptionActive()) {
            revert EncryptionNotInitialized();
        }

        if (encryptedPathEnabled) {
            return encryptedMintCeiling.isSupplyWithinCeiling(currentSupply);
        }

        // Fallback to unencrypted path
        return true;
    }

    /**
     * @notice Calculate encrypted adjustment for peg deviation
     * @param pegDeviation The peg deviation value
     * @return encryptedAdjustment The encrypted adjustment result
     */
    function calculatePegAdjustment(int256 pegDeviation)
        external
        view
        returns (bytes memory encryptedAdjustment)
    {
        if (!encryptionManager.isEncryptionActive()) {
            revert EncryptionNotInitialized();
        }

        if (encryptedPathEnabled) {
            return encryptedPegDeviation.calculateEncryptedAdjustment(pegDeviation);
        }

        // Fallback to unencrypted path
        return "";
    }

    /**
     * @notice Evaluate encrypted stabilization curve
     * @param input The input value for curve evaluation
     * @return encryptedOutput The encrypted curve evaluation result
     */
    function evaluateCurve(uint256 input) external view returns (bytes memory encryptedOutput) {
        if (!encryptionManager.isEncryptionActive()) {
            revert EncryptionNotInitialized();
        }

        if (encryptedPathEnabled) {
            return encryptedCurveParameters.evaluateEncryptedCurve(input);
        }

        // Fallback to unencrypted path
        return "";
    }

    /**
     * @notice Perform homomorphic addition
     * @param a First encrypted value
     * @param b Second encrypted value
     * @return The encrypted sum
     */
    function add(bytes calldata a, bytes calldata b) external view returns (bytes memory) {
        if (!encryptionManager.isEncryptionActive()) {
            revert EncryptionNotInitialized();
        }

        return computationEngine.encryptedAdd(a, b);
    }

    /**
     * @notice Perform homomorphic scalar multiplication
     * @param encrypted The encrypted value
     * @param scalar The plaintext scalar
     * @return The encrypted product
     */
    function scalarMultiply(bytes calldata encrypted, uint256 scalar) external view returns (bytes memory) {
        if (!encryptionManager.isEncryptionActive()) {
            revert EncryptionNotInitialized();
        }

        return computationEngine.encryptedScalarMultiply(encrypted, scalar);
    }

    /**
     * @notice Perform homomorphic comparison
     * @param encrypted The encrypted value
     * @param plaintext The plaintext value to compare
     * @return The encrypted comparison result
     */
    function compare(bytes calldata encrypted, uint256 plaintext) external view returns (bytes memory) {
        if (!encryptionManager.isEncryptionActive()) {
            revert EncryptionNotInitialized();
        }

        return computationEngine.encryptedCompare(encrypted, plaintext);
    }

    /**
     * @notice Decrypt a value (requires authorization)
     * @param encryptedValue The encrypted value
     * @return The decrypted plaintext value
     */
    function decrypt(bytes calldata encryptedValue) external view returns (uint256) {
        if (!encryptionManager.isEncryptionActive()) {
            revert EncryptionNotInitialized();
        }

        return decryptionHandler.decrypt(encryptedValue);
    }

    /**
     * @notice Check if encryption is active
     * @return True if encryption is initialized and active
     */
    function isEncryptionActive() external view returns (bool) {
        return encryptionManager.isEncryptionActive();
    }

    /**
     * @notice Check if encrypted path is enabled
     * @return True if encrypted path is enabled
     */
    function isEncryptedPathEnabled() external view returns (bool) {
        return encryptedPathEnabled;
    }

    /**
     * @notice Update module reference
     * @param moduleName The name of the module to update
     * @param moduleAddress The new module address
     */
    function updateModule(string calldata moduleName, address moduleAddress) external onlyOwner {
        if (moduleAddress == address(0)) revert InvalidParameterValue("Invalid module address");

        if (keccak256(abi.encodePacked(moduleName)) == keccak256(abi.encodePacked("mintCeiling"))) {
            encryptedMintCeiling = IEncryptedMintCeiling(moduleAddress);
        } else if (keccak256(abi.encodePacked(moduleName)) == keccak256(abi.encodePacked("pegDeviation"))) {
            encryptedPegDeviation = IEncryptedPegDeviation(moduleAddress);
        } else if (keccak256(abi.encodePacked(moduleName)) == keccak256(abi.encodePacked("curveParameters"))) {
            encryptedCurveParameters = IEncryptedCurveParameters(moduleAddress);
        } else if (keccak256(abi.encodePacked(moduleName)) == keccak256(abi.encodePacked("computationEngine"))) {
            computationEngine = IFhenixComputationEngine(moduleAddress);
        } else if (keccak256(abi.encodePacked(moduleName)) == keccak256(abi.encodePacked("decryptionHandler"))) {
            decryptionHandler = IFhenixDecryptionHandler(moduleAddress);
        } else {
            revert InvalidParameterValue("Unknown module");
        }

        emit ModuleRegistered(moduleName, moduleAddress);
    }
}
