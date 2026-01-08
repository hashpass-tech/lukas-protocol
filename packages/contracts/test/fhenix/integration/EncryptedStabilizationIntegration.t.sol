// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../../src/StabilizerVault.sol";
import "../../../src/StabilizerVaultEncrypted.sol";
import "../../../src/fhenix/core/FhenixEncryptionManager.sol";
import "../../../src/fhenix/core/EncryptedMintCeiling.sol";
import "../../../src/fhenix/core/EncryptedPegDeviation.sol";
import "../../../src/fhenix/core/EncryptedCurveParameters.sol";
import "../../../src/fhenix/core/FhenixComputationEngine.sol";
import "../../../src/fhenix/core/FhenixDecryptionHandler.sol";
import "../../../src/fhenix/orchestration/EncryptionOrchestrator.sol";
import "../../../src/LukasToken.sol";
import "../../../src/interfaces/ILatAmBasketIndex.sol";

/**
 * @title EncryptedStabilizationIntegration
 * @notice Integration tests for encrypted stabilization calculations
 */
contract EncryptedStabilizationIntegration is Test {
    // FHENIX components
    FhenixEncryptionManager public encryptionManager;
    EncryptedMintCeiling public encryptedMintCeiling;
    EncryptedPegDeviation public encryptedPegDeviation;
    EncryptedCurveParameters public encryptedCurveParameters;
    FhenixComputationEngine public computationEngine;
    FhenixDecryptionHandler public decryptionHandler;
    EncryptionOrchestrator public orchestrator;

    // Stabilization components
    LukasToken public lukas;
    StabilizerVault public stabilizerVault;
    StabilizerVaultEncrypted public encryptedStabilizerVault;

    // Mock basket index
    MockLatAmBasketIndex public basketIndex;

    address public owner;
    address public authorizedUser;
    bytes public testPublicKey;

    function setUp() public {
        owner = address(this);
        authorizedUser = address(0x1234);
        testPublicKey = hex"0123456789abcdef";

        // Deploy FHENIX components
        encryptionManager = new FhenixEncryptionManager(owner);
        encryptedMintCeiling = new EncryptedMintCeiling(address(encryptionManager), owner);
        encryptedPegDeviation = new EncryptedPegDeviation(address(encryptionManager), owner);
        encryptedCurveParameters = new EncryptedCurveParameters(address(encryptionManager), owner);
        computationEngine = new FhenixComputationEngine();
        decryptionHandler = new FhenixDecryptionHandler(address(encryptionManager), owner);

        orchestrator = new EncryptionOrchestrator(
            address(encryptionManager),
            address(encryptedMintCeiling),
            address(encryptedPegDeviation),
            address(encryptedCurveParameters),
            address(computationEngine),
            address(decryptionHandler),
            owner
        );

        // Initialize encryption
        encryptionManager.initializeEncryption(testPublicKey, 256);

        // Deploy LUKAS token
        lukas = new LukasToken(1_000_000e18);

        // Deploy mock basket index
        basketIndex = new MockLatAmBasketIndex();

        // Deploy base StabilizerVault
        stabilizerVault = new StabilizerVault(address(lukas), address(basketIndex), address(0));

        // Deploy encrypted StabilizerVault
        encryptedStabilizerVault = new StabilizerVaultEncrypted(
            address(stabilizerVault),
            address(orchestrator),
            owner
        );

        // Authorize users
        stabilizerVault.setAuthorized(authorizedUser, true);
        stabilizerVault.setAuthorized(address(encryptedStabilizerVault), true);
        decryptionHandler.authorizeDecryptor(address(orchestrator));

        // Set cooldown to 0 for testing
        stabilizerVault.setParameters(10_000e18, 10_000e18, 100, 0);
    }

    /**
     * @notice Test encrypted path is disabled by default
     */
    function test_EncryptedPathDisabledByDefault() public {
        assertFalse(encryptedStabilizerVault.encryptedPathEnabled());
    }

    /**
     * @notice Test enabling encrypted path
     */
    function test_EnableEncryptedPath() public {
        encryptedStabilizerVault.setEncryptedPathEnabled(true);
        assertTrue(encryptedStabilizerVault.encryptedPathEnabled());
    }

    /**
     * @notice Test plaintext curve evaluation (fallback)
     */
    function test_EvaluatePlaintextCurve() public {
        // Encrypted path is disabled by default
        assertFalse(encryptedStabilizerVault.encryptedPathEnabled());

        // Evaluate curve with plaintext path
        bytes memory result = encryptedStabilizerVault.evaluateStabilizationCurve(100);

        // Result should be empty (plaintext path)
        assertEq(result.length, 0);
    }

    /**
     * @notice Test encrypted path requires encryption to be active
     */
    function test_EncryptedPathRequiresActiveEncryption() public {
        // Create new orchestrator with uninitialized encryption
        FhenixEncryptionManager newEncryptionManager = new FhenixEncryptionManager(owner);
        EncryptionOrchestrator newOrchestrator = new EncryptionOrchestrator(
            address(newEncryptionManager),
            address(encryptedMintCeiling),
            address(encryptedPegDeviation),
            address(encryptedCurveParameters),
            address(computationEngine),
            address(decryptionHandler),
            owner
        );

        // Create encrypted vault with uninitialized encryption
        StabilizerVaultEncrypted newEncryptedVault = new StabilizerVaultEncrypted(
            address(stabilizerVault),
            address(newOrchestrator),
            owner
        );

        // Try to enable encrypted path (should fail)
        vm.expectRevert(EncryptionNotInitialized.selector);
        newEncryptedVault.setEncryptedPathEnabled(true);
    }

    /**
     * @notice Test plaintext parameters can be updated
     */
    function test_UpdatePlaintextParameters() public {
        uint256 newCeiling = 20_000e18;
        uint256 newSensitivity = 200;

        encryptedStabilizerVault.setPlaintextParameters(newCeiling, newSensitivity);

        assertEq(encryptedStabilizerVault.plainMintCeiling(), newCeiling);
        assertEq(encryptedStabilizerVault.plainPegDeviationSensitivity(), newSensitivity);
    }

    /**
     * @notice Test orchestrator can be updated
     */
    function test_UpdateEncryptionOrchestrator() public {
        // Create new orchestrator
        EncryptionOrchestrator newOrchestrator = new EncryptionOrchestrator(
            address(encryptionManager),
            address(encryptedMintCeiling),
            address(encryptedPegDeviation),
            address(encryptedCurveParameters),
            address(computationEngine),
            address(decryptionHandler),
            owner
        );

        encryptedStabilizerVault.setEncryptionOrchestrator(address(newOrchestrator));

        assertEq(address(encryptedStabilizerVault.encryptionOrchestrator()), address(newOrchestrator));
    }

    /**
     * @notice Test is encrypted path active
     */
    function test_IsEncryptedPathActive() public {
        // Initially disabled
        assertFalse(encryptedStabilizerVault.isEncryptedPathActive());

        // Enable encrypted path
        encryptedStabilizerVault.setEncryptedPathEnabled(true);

        // Should be active now
        assertTrue(encryptedStabilizerVault.isEncryptedPathActive());
    }

    /**
     * @notice Test total minted encrypted counter
     */
    function test_TotalMintedEncryptedCounter() public {
        assertEq(encryptedStabilizerVault.getTotalMintedEncrypted(), 0);
    }

    /**
     * @notice Test total bought back encrypted counter
     */
    function test_TotalBoughtBackEncryptedCounter() public {
        assertEq(encryptedStabilizerVault.getTotalBoughtBackEncrypted(), 0);
    }
}

/**
 * @title MockLatAmBasketIndex
 * @notice Mock implementation of ILatAmBasketIndex for testing
 */
contract MockLatAmBasketIndex {
    function getLukasFairPriceInUSDC() external pure returns (uint256) {
        return 1e18; // 1 USDC per LUKAS
    }

    function getLatAmBasketIndexPrice() external pure returns (uint256) {
        return 1e18;
    }

    function getLatAmBasketIndexPriceInUSDC() external pure returns (uint256) {
        return 1e18;
    }

    function getIndexUSD() external view returns (uint256 indexValue, uint256 lastUpdated) {
        return (1e18, block.timestamp);
    }

    function getCurrencyPrice(string calldata) external pure returns (uint256 price, uint256 weight) {
        return (1e18, 1e18);
    }

    function hasStaleFeeds() external pure returns (bool) {
        return false;
    }

    function getWeights() external pure returns (string[] memory currencies, uint256[] memory weights) {
        currencies = new string[](0);
        weights = new uint256[](0);
    }
}
