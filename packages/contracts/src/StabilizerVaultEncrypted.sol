// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IStabilizerVault} from "./interfaces/IStabilizerVault.sol";
import {ILatAmBasketIndex} from "./interfaces/ILatAmBasketIndex.sol";
import {LukasToken} from "./LukasToken.sol";
import {StabilizerVault} from "./StabilizerVault.sol";
import {Owned} from "solmate/src/auth/Owned.sol";
import {EncryptionOrchestrator} from "./fhenix/orchestration/EncryptionOrchestrator.sol";

/**
 * @title StabilizerVaultEncrypted
 * @notice Enhanced StabilizerVault with encrypted parameter support
 * @dev Integrates FHENIX encrypted parameters for secure stabilization
 * 
 * Supports dual-path execution:
 * - Encrypted path: Uses encrypted mint ceiling, peg deviation, and curve parameters
 * - Unencrypted path: Falls back to plaintext parameters for safety during rollout
 */
contract StabilizerVaultEncrypted is Owned {
    /// @notice Reference to the base StabilizerVault
    StabilizerVault public immutable stabilizerVault;

    /// @notice Reference to the EncryptionOrchestrator
    EncryptionOrchestrator public encryptionOrchestrator;

    /// @notice Feature flag for encrypted path
    bool public encryptedPathEnabled;

    /// @notice Plaintext mint ceiling (used when encrypted path is disabled)
    uint256 public plainMintCeiling;

    /// @notice Plaintext peg deviation sensitivity (used when encrypted path is disabled)
    uint256 public plainPegDeviationSensitivity;

    /// @notice Plaintext curve parameters (used when encrypted path is disabled)
    uint256[] public plainCurveParameters;

    /// @notice Total LUKAS minted via encrypted path
    uint256 public totalMintedEncrypted;

    /// @notice Total LUKAS bought back via encrypted path
    uint256 public totalBoughtBackEncrypted;

    event EncryptedPathEnabled(bool enabled);
    event EncryptionOrchestratorUpdated(address indexed newOrchestrator);
    event PlaintextParametersUpdated(uint256 mintCeiling, uint256 pegSensitivity);
    event EncryptedStabilizationMint(uint256 amount, bytes encryptedAdjustment);
    event EncryptedStabilizationBuyback(uint256 amount, bytes encryptedAdjustment);

    error EncryptionNotInitialized();
    error InvalidOrchestratorAddress();
    error ZeroAmount();
    error ExceedsEncryptedMintCeiling();

    modifier onlyAuthorized() {
        if (!stabilizerVault.authorized(msg.sender) && msg.sender != owner) {
            revert("Unauthorized");
        }
        _;
    }

    constructor(
        address _stabilizerVault,
        address _encryptionOrchestrator,
        address _owner
    ) Owned(_owner) {
        if (_stabilizerVault == address(0)) revert("Invalid StabilizerVault");
        if (_encryptionOrchestrator == address(0)) revert InvalidOrchestratorAddress();

        stabilizerVault = StabilizerVault(payable(_stabilizerVault));
        encryptionOrchestrator = EncryptionOrchestrator(_encryptionOrchestrator);
        encryptedPathEnabled = false;

        // Initialize plaintext parameters
        plainMintCeiling = 10_000e18;
        plainPegDeviationSensitivity = 100;
    }

    /**
     * @notice Enable/disable encrypted path
     * @param enabled Whether to enable encrypted path
     */
    function setEncryptedPathEnabled(bool enabled) external onlyOwner {
        if (enabled && !encryptionOrchestrator.isEncryptionActive()) {
            revert EncryptionNotInitialized();
        }
        encryptedPathEnabled = enabled;
        emit EncryptedPathEnabled(enabled);
    }

    /**
     * @notice Update encryption orchestrator reference
     * @param newOrchestrator The new orchestrator address
     */
    function setEncryptionOrchestrator(address newOrchestrator) external onlyOwner {
        if (newOrchestrator == address(0)) revert InvalidOrchestratorAddress();
        encryptionOrchestrator = EncryptionOrchestrator(newOrchestrator);
        emit EncryptionOrchestratorUpdated(newOrchestrator);
    }

    /**
     * @notice Update plaintext parameters (used when encrypted path is disabled)
     * @param _mintCeiling The plaintext mint ceiling
     * @param _pegSensitivity The plaintext peg deviation sensitivity
     */
    function setPlaintextParameters(uint256 _mintCeiling, uint256 _pegSensitivity) external onlyOwner {
        plainMintCeiling = _mintCeiling;
        plainPegDeviationSensitivity = _pegSensitivity;
        emit PlaintextParametersUpdated(_mintCeiling, _pegSensitivity);
    }

    /**
     * @notice Stabilize by minting LUKAS (encrypted or plaintext path)
     * @param amount The amount to mint
     * @param recipient The recipient of minted tokens
     */
    function stabilizeMintEncrypted(uint256 amount, address recipient) external onlyAuthorized {
        if (amount == 0) revert ZeroAmount();

        if (encryptedPathEnabled) {
            // Use encrypted path
            if (!encryptionOrchestrator.isEncryptionActive()) {
                revert EncryptionNotInitialized();
            }

            // Check against encrypted mint ceiling
            bool withinCeiling = encryptionOrchestrator.checkMintCeiling(amount);
            if (!withinCeiling) revert ExceedsEncryptedMintCeiling();

            // Calculate encrypted peg adjustment
            int256 pegDeviation = _calculatePegDeviation();
            bytes memory encryptedAdjustment = encryptionOrchestrator.calculatePegAdjustment(pegDeviation);

            // Perform mint through base vault
            stabilizerVault.stabilizeMint(amount, recipient);

            totalMintedEncrypted += amount;
            emit EncryptedStabilizationMint(amount, encryptedAdjustment);
        } else {
            // Use plaintext path (fallback)
            if (amount > plainMintCeiling) revert ExceedsEncryptedMintCeiling();

            stabilizerVault.stabilizeMint(amount, recipient);
        }
    }

    /**
     * @notice Stabilize by buying back LUKAS (encrypted or plaintext path)
     * @param amount The amount to buy back
     */
    function stabilizeBuybackEncrypted(uint256 amount) external onlyAuthorized {
        if (amount == 0) revert ZeroAmount();

        if (encryptedPathEnabled) {
            // Use encrypted path
            if (!encryptionOrchestrator.isEncryptionActive()) {
                revert EncryptionNotInitialized();
            }

            // Calculate encrypted peg adjustment
            int256 pegDeviation = _calculatePegDeviation();
            bytes memory encryptedAdjustment = encryptionOrchestrator.calculatePegAdjustment(pegDeviation);

            // Perform buyback through base vault
            stabilizerVault.stabilizeBuyback(amount);

            totalBoughtBackEncrypted += amount;
            emit EncryptedStabilizationBuyback(amount, encryptedAdjustment);
        } else {
            // Use plaintext path (fallback)
            stabilizerVault.stabilizeBuyback(amount);
        }
    }

    /**
     * @notice Evaluate encrypted stabilization curve
     * @param input The input value for curve evaluation
     * @return encryptedOutput The encrypted curve evaluation result
     */
    function evaluateStabilizationCurve(uint256 input) external view returns (bytes memory encryptedOutput) {
        if (encryptedPathEnabled) {
            if (!encryptionOrchestrator.isEncryptionActive()) {
                revert EncryptionNotInitialized();
            }
            return encryptionOrchestrator.evaluateCurve(input);
        }

        // Plaintext path returns empty bytes
        return "";
    }

    /**
     * @notice Check if encrypted path is enabled and active
     * @return True if encrypted path is enabled and encryption is active
     */
    function isEncryptedPathActive() external view returns (bool) {
        return encryptedPathEnabled && encryptionOrchestrator.isEncryptionActive();
    }

    /**
     * @notice Get total LUKAS minted via encrypted path
     * @return The total amount minted
     */
    function getTotalMintedEncrypted() external view returns (uint256) {
        return totalMintedEncrypted;
    }

    /**
     * @notice Get total LUKAS bought back via encrypted path
     * @return The total amount bought back
     */
    function getTotalBoughtBackEncrypted() external view returns (uint256) {
        return totalBoughtBackEncrypted;
    }

    /**
     * @notice Calculate current peg deviation
     * @return The peg deviation as a signed integer
     */
    function _calculatePegDeviation() internal view returns (int256) {
        // Get fair price from basket index
        uint256 fairPrice = stabilizerVault.basketIndex().getLukasFairPriceInUSDC();

        // In a real implementation, this would get the current pool price
        // For now, return a placeholder
        if (fairPrice > 0) {
            return int256(fairPrice) - int256(fairPrice); // 0 deviation
        }
        return 0;
    }

    /**
     * @notice Proxy function to base vault's stabilizeMint
     * @param amount The amount to mint
     * @param recipient The recipient of minted tokens
     */
    function stabilizeMint(uint256 amount, address recipient) external onlyAuthorized {
        stabilizerVault.stabilizeMint(amount, recipient);
    }

    /**
     * @notice Proxy function to base vault's stabilizeBuyback
     * @param amount The amount to buy back
     */
    function stabilizeBuyback(uint256 amount) external onlyAuthorized {
        stabilizerVault.stabilizeBuyback(amount);
    }

    /**
     * @notice Proxy function to base vault's addLiquidity
     * @param lukasAmount The amount of LUKAS to add
     * @param usdcAmount The amount of USDC to add
     */
    function addLiquidity(uint256 lukasAmount, uint256 usdcAmount) external onlyAuthorized {
        stabilizerVault.addLiquidity(lukasAmount, usdcAmount);
    }

    /**
     * @notice Proxy function to base vault's removeLiquidity
     * @param liquidity The amount of liquidity to remove
     */
    function removeLiquidity(uint256 liquidity) external onlyAuthorized {
        stabilizerVault.removeLiquidity(liquidity);
    }

    /**
     * @notice Proxy function to base vault's getCollateralBalance
     * @return usdcBalance The USDC balance
     * @return lukasBalance The LUKAS balance
     */
    function getCollateralBalance() external view returns (uint256 usdcBalance, uint256 lukasBalance) {
        return stabilizerVault.getCollateralBalance();
    }
}
