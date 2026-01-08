// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../../src/fhenix/core/FhenixEncryptionManager.sol";
import "../../../src/fhenix/core/EncryptedMintCeiling.sol";
import "../../../src/fhenix/core/EncryptedPegDeviation.sol";
import "../../../src/fhenix/core/EncryptedCurveParameters.sol";
import "../../../src/fhenix/core/FhenixComputationEngine.sol";
import "../../../src/fhenix/core/FhenixDecryptionHandler.sol";
import "../../../src/fhenix/orchestration/EncryptionOrchestrator.sol";
import "../../../src/fhenix/errors/FhenixErrors.sol";

/**
 * @title OrchestratorIntegration
 * @notice Integration tests for EncryptionOrchestrator routing and coordination
 */
contract OrchestratorIntegration is Test {
    FhenixEncryptionManager public encryptionManager;
    EncryptedMintCeiling public encryptedMintCeiling;
    EncryptedPegDeviation public encryptedPegDeviation;
    EncryptedCurveParameters public encryptedCurveParameters;
    FhenixComputationEngine public computationEngine;
    FhenixDecryptionHandler public decryptionHandler;
    EncryptionOrchestrator public orchestrator;

    address public owner;
    address public authorizedUser;
    bytes public testPublicKey;

    function setUp() public {
        owner = address(this);
        authorizedUser = address(0x1234);

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

        testPublicKey = hex"0123456789abcdef";
        encryptionManager.initializeEncryption(testPublicKey, 256);
        decryptionHandler.authorizeDecryptor(authorizedUser);
    }

    /**
     * @notice Test routing to unencrypted path when feature flag is disabled
     */
    function test_RoutingToUnencryptedPath_MintCeiling() public {
        // Feature flag is disabled by default
        assertFalse(orchestrator.isEncryptedPathEnabled());

        // Should route to unencrypted path (returns true)
        bool result = orchestrator.checkMintCeiling(1000000);
        assertTrue(result);
    }

    /**
     * @notice Test routing to encrypted path when feature flag is enabled
     */
    function test_RoutingToEncryptedPath_MintCeiling() public {
        // Enable encrypted path
        orchestrator.setEncryptedPathEnabled(true);
        assertTrue(orchestrator.isEncryptedPathEnabled());

        // Set encrypted mint ceiling
        bytes memory encryptedValue = hex"fedcba9876543210";
        encryptedMintCeiling.setEncryptedMintCeiling(encryptedValue);

        // Should route to encrypted path
        bool result = orchestrator.checkMintCeiling(1000000);
        assertTrue(result);
    }

    /**
     * @notice Test feature flag controls path selection for peg deviation
     */
    function test_FeatureFlagControlsPath_PegDeviation() public {
        bytes memory encryptedValue = hex"fedcba9876543210";
        encryptedPegDeviation.setEncryptedPegDeviation(encryptedValue);

        // With feature flag disabled, should return empty bytes
        bytes memory resultDisabled = orchestrator.calculatePegAdjustment(100);
        assertEq(resultDisabled.length, 0);

        // Enable encrypted path
        orchestrator.setEncryptedPathEnabled(true);

        // With feature flag enabled, should return encrypted value
        bytes memory resultEnabled = orchestrator.calculatePegAdjustment(100);
        assertEq(resultEnabled, encryptedValue);
    }

    /**
     * @notice Test feature flag controls path selection for curve evaluation
     */
    function test_FeatureFlagControlsPath_CurveParameters() public {
        bytes[] memory coefficients = new bytes[](1);
        coefficients[0] = hex"0123456789abcdef";
        encryptedCurveParameters.setEncryptedCurveParameters(coefficients);

        // With feature flag disabled, should return empty bytes
        bytes memory resultDisabled = orchestrator.evaluateCurve(100);
        assertEq(resultDisabled.length, 0);

        // Enable encrypted path
        orchestrator.setEncryptedPathEnabled(true);

        // With feature flag enabled, should return encrypted value
        bytes memory resultEnabled = orchestrator.evaluateCurve(100);
        assertEq(resultEnabled, coefficients[0]);
    }

    /**
     * @notice Test fallback behavior when encryption is not initialized
     */
    function test_FallbackBehavior_EncryptionNotInitialized() public {
        // Create new orchestrator with uninitialized encryption manager
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

        // Should revert when encryption is not initialized
        vm.expectRevert(EncryptionNotInitialized.selector);
        newOrchestrator.checkMintCeiling(1000000);
    }

    /**
     * @notice Test homomorphic operations through orchestrator
     */
    function test_HomomorphicOperations_Addition() public {
        bytes memory a = hex"0123456789abcdef";
        bytes memory b = hex"fedcba9876543210";

        bytes memory result = orchestrator.add(a, b);

        // Result should be concatenation of both values
        assertEq(result.length, a.length + b.length);
    }

    /**
     * @notice Test homomorphic scalar multiplication through orchestrator
     */
    function test_HomomorphicOperations_ScalarMultiply() public {
        bytes memory encrypted = hex"0123456789abcdef";

        bytes memory result = orchestrator.scalarMultiply(encrypted, 5);

        // Result should be the encrypted value (identity for scalar 1)
        assertEq(result, encrypted);
    }

    /**
     * @notice Test homomorphic comparison through orchestrator
     */
    function test_HomomorphicOperations_Compare() public {
        bytes memory encrypted = hex"0123456789abcdef";

        bytes memory result = orchestrator.compare(encrypted, 100);

        // Result should be a single byte (encrypted boolean)
        assertEq(result.length, 1);
    }

    /**
     * @notice Test decryption through orchestrator with authorization
     */
    function test_DecryptionWithAuthorization() public {
        bytes memory encrypted = hex"0123456789abcdef";

        // Authorize orchestrator for decryption
        decryptionHandler.authorizeDecryptor(address(orchestrator));

        // Should succeed
        uint256 result = orchestrator.decrypt(encrypted);
        assertEq(result, 0); // Placeholder implementation returns 0
    }

    /**
     * @notice Test module update and routing to new module
     */
    function test_ModuleUpdateAndRouting() public {
        FhenixComputationEngine newEngine = new FhenixComputationEngine();

        // Update computation engine
        orchestrator.updateModule("computationEngine", address(newEngine));

        // Verify new module is used
        assertEq(address(orchestrator.computationEngine()), address(newEngine));

        // Test that operations still work with new module
        bytes memory a = hex"0123456789abcdef";
        bytes memory b = hex"fedcba9876543210";
        bytes memory result = orchestrator.add(a, b);
        assertEq(result.length, a.length + b.length);
    }

    /**
     * @notice Test coordinated operations across multiple modules
     */
    function test_CoordinatedOperations_MultipleModules() public {
        orchestrator.setEncryptedPathEnabled(true);

        // Set up encrypted parameters
        bytes memory encryptedMintCeilingValue = hex"0123456789abcdef";
        bytes memory encryptedPegDeviationValue = hex"fedcba9876543210";
        bytes[] memory curveCoefficients = new bytes[](2);
        curveCoefficients[0] = hex"1111111111111111";
        curveCoefficients[1] = hex"2222222222222222";

        encryptedMintCeiling.setEncryptedMintCeiling(encryptedMintCeilingValue);
        encryptedPegDeviation.setEncryptedPegDeviation(encryptedPegDeviationValue);
        encryptedCurveParameters.setEncryptedCurveParameters(curveCoefficients);

        // Perform coordinated operations
        bool mintCheckResult = orchestrator.checkMintCeiling(1000000);
        assertTrue(mintCheckResult);

        bytes memory pegAdjustment = orchestrator.calculatePegAdjustment(100);
        assertEq(pegAdjustment, encryptedPegDeviationValue);

        bytes memory curveResult = orchestrator.evaluateCurve(100);
        assertEq(curveResult, curveCoefficients[0]);

        // Perform homomorphic operations on results
        bytes memory addResult = orchestrator.add(pegAdjustment, curveResult);
        assertEq(addResult.length, pegAdjustment.length + curveResult.length);
    }

    /**
     * @notice Test feature flag toggle behavior
     */
    function test_FeatureFlagToggle() public {
        bytes memory encryptedValue = hex"fedcba9876543210";
        encryptedMintCeiling.setEncryptedMintCeiling(encryptedValue);

        // Initially disabled
        assertFalse(orchestrator.isEncryptedPathEnabled());
        bytes memory resultDisabled = orchestrator.calculatePegAdjustment(100);
        assertEq(resultDisabled.length, 0);

        // Enable
        orchestrator.setEncryptedPathEnabled(true);
        assertTrue(orchestrator.isEncryptedPathEnabled());

        // Disable again
        orchestrator.setEncryptedPathEnabled(false);
        assertFalse(orchestrator.isEncryptedPathEnabled());
        bytes memory resultDisabledAgain = orchestrator.calculatePegAdjustment(100);
        assertEq(resultDisabledAgain.length, 0);
    }

    /**
     * @notice Test encryption state consistency through orchestrator
     */
    function test_EncryptionStateConsistency() public {
        // Encryption should be active
        assertTrue(orchestrator.isEncryptionActive());

        // Should be able to perform operations
        bytes memory a = hex"0123456789abcdef";
        bytes memory b = hex"fedcba9876543210";
        bytes memory result = orchestrator.add(a, b);
        assertEq(result.length, a.length + b.length);

        // Encryption state should remain consistent
        assertTrue(orchestrator.isEncryptionActive());
    }

    /**
     * @notice Test authorization enforcement through orchestrator
     */
    function test_AuthorizationEnforcement() public {
        bytes memory encrypted = hex"0123456789abcdef";

        // Authorize the orchestrator for decryption
        decryptionHandler.authorizeDecryptor(address(orchestrator));

        // Orchestrator should be able to decrypt
        uint256 result = orchestrator.decrypt(encrypted);
        assertEq(result, 0);
    }

    /**
     * @notice Test all modules are properly coordinated
     */
    function test_AllModulesCoordinated() public {
        // Verify all modules are registered
        assertEq(address(orchestrator.encryptionManager()), address(encryptionManager));
        assertEq(address(orchestrator.encryptedMintCeiling()), address(encryptedMintCeiling));
        assertEq(address(orchestrator.encryptedPegDeviation()), address(encryptedPegDeviation));
        assertEq(address(orchestrator.encryptedCurveParameters()), address(encryptedCurveParameters));
        assertEq(address(orchestrator.computationEngine()), address(computationEngine));
        assertEq(address(orchestrator.decryptionHandler()), address(decryptionHandler));

        // All modules should be accessible
        assertTrue(orchestrator.isEncryptionActive());
        assertFalse(orchestrator.isEncryptedPathEnabled());
    }

    /**
     * @notice Test owner-only operations
     */
    function test_OwnerOnlyOperations() public {
        address nonOwner = address(0x5678);

        // Non-owner should not be able to enable encrypted path
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPermissions(address)", nonOwner));
        orchestrator.setEncryptedPathEnabled(true);

        // Non-owner should not be able to update modules
        FhenixComputationEngine newEngine = new FhenixComputationEngine();
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPermissions(address)", nonOwner));
        orchestrator.updateModule("computationEngine", address(newEngine));
    }
}
