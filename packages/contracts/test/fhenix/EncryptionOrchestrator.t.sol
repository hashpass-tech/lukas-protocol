// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../src/fhenix/core/FhenixEncryptionManager.sol";
import "../../src/fhenix/core/EncryptedMintCeiling.sol";
import "../../src/fhenix/core/EncryptedPegDeviation.sol";
import "../../src/fhenix/core/EncryptedCurveParameters.sol";
import "../../src/fhenix/core/FhenixComputationEngine.sol";
import "../../src/fhenix/core/FhenixDecryptionHandler.sol";
import "../../src/fhenix/orchestration/EncryptionOrchestrator.sol";
import "../../src/fhenix/errors/FhenixErrors.sol";

contract EncryptionOrchestratorTest is Test {
    FhenixEncryptionManager public encryptionManager;
    EncryptedMintCeiling public encryptedMintCeiling;
    EncryptedPegDeviation public encryptedPegDeviation;
    EncryptedCurveParameters public encryptedCurveParameters;
    FhenixComputationEngine public computationEngine;
    FhenixDecryptionHandler public decryptionHandler;
    EncryptionOrchestrator public orchestrator;

    address public owner;
    bytes public testPublicKey;

    function setUp() public {
        owner = address(this);

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
    }

    function test_IsEncryptionActive() public {
        assertTrue(orchestrator.isEncryptionActive());
    }

    function test_IsEncryptedPathEnabled() public {
        assertFalse(orchestrator.isEncryptedPathEnabled());
    }

    function test_SetEncryptedPathEnabled() public {
        orchestrator.setEncryptedPathEnabled(true);

        assertTrue(orchestrator.isEncryptedPathEnabled());
    }

    function test_SetEncryptedPathEnabled_OnlyOwner() public {
        address nonOwner = address(0x1234);
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPermissions(address)", nonOwner));
        orchestrator.setEncryptedPathEnabled(true);
    }

    function test_CheckMintCeiling_EncryptedPathDisabled() public {
        bool result = orchestrator.checkMintCeiling(1000000);

        // Should return true (fallback to unencrypted path)
        assertTrue(result);
    }

    function test_CheckMintCeiling_EncryptedPathEnabled() public {
        orchestrator.setEncryptedPathEnabled(true);

        bytes memory encryptedValue = hex"fedcba9876543210";
        encryptedMintCeiling.setEncryptedMintCeiling(encryptedValue);

        bool result = orchestrator.checkMintCeiling(1000000);

        // Should return true (placeholder implementation)
        assertTrue(result);
    }

    function test_CalculatePegAdjustment_EncryptedPathDisabled() public {
        bytes memory result = orchestrator.calculatePegAdjustment(100);

        // Should return empty bytes (fallback to unencrypted path)
        assertEq(result.length, 0);
    }

    function test_CalculatePegAdjustment_EncryptedPathEnabled() public {
        orchestrator.setEncryptedPathEnabled(true);

        bytes memory encryptedValue = hex"fedcba9876543210";
        encryptedPegDeviation.setEncryptedPegDeviation(encryptedValue);

        bytes memory result = orchestrator.calculatePegAdjustment(100);

        // Should return encrypted value (placeholder implementation)
        assertEq(result, encryptedValue);
    }

    function test_EvaluateCurve_EncryptedPathDisabled() public {
        bytes memory result = orchestrator.evaluateCurve(100);

        // Should return empty bytes (fallback to unencrypted path)
        assertEq(result.length, 0);
    }

    function test_EvaluateCurve_EncryptedPathEnabled() public {
        orchestrator.setEncryptedPathEnabled(true);

        bytes[] memory coefficients = new bytes[](1);
        coefficients[0] = hex"0123456789abcdef";
        encryptedCurveParameters.setEncryptedCurveParameters(coefficients);

        bytes memory result = orchestrator.evaluateCurve(100);

        // Should return encrypted value (placeholder implementation)
        assertEq(result, coefficients[0]);
    }

    function test_Add() public {
        bytes memory a = hex"0123456789abcdef";
        bytes memory b = hex"fedcba9876543210";

        bytes memory result = orchestrator.add(a, b);

        // Result should contain both values concatenated
        assertEq(result.length, a.length + b.length);
    }

    function test_ScalarMultiply() public {
        bytes memory encrypted = hex"0123456789abcdef";

        bytes memory result = orchestrator.scalarMultiply(encrypted, 5);

        // Result should be the encrypted value (placeholder implementation)
        assertEq(result, encrypted);
    }

    function test_Compare() public {
        bytes memory encrypted = hex"0123456789abcdef";

        bytes memory result = orchestrator.compare(encrypted, 100);

        // Result should be a single byte (placeholder implementation)
        assertEq(result.length, 1);
    }

    function test_Decrypt() public {
        bytes memory encrypted = hex"0123456789abcdef";

        // Authorize the orchestrator to decrypt
        decryptionHandler.authorizeDecryptor(address(orchestrator));

        uint256 result = orchestrator.decrypt(encrypted);

        // Should return 0 (placeholder implementation)
        assertEq(result, 0);
    }

    function test_UpdateModule() public {
        FhenixComputationEngine newEngine = new FhenixComputationEngine();

        orchestrator.updateModule("computationEngine", address(newEngine));

        assertEq(address(orchestrator.computationEngine()), address(newEngine));
    }

    function test_UpdateModule_InvalidAddress() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidParameterValue(string)", "Invalid module address"));
        orchestrator.updateModule("computationEngine", address(0));
    }

    function test_UpdateModule_UnknownModule() public {
        FhenixComputationEngine newEngine = new FhenixComputationEngine();

        vm.expectRevert(abi.encodeWithSignature("InvalidParameterValue(string)", "Unknown module"));
        orchestrator.updateModule("unknownModule", address(newEngine));
    }

    function test_UpdateModule_OnlyOwner() public {
        FhenixComputationEngine newEngine = new FhenixComputationEngine();
        address nonOwner = address(0x1234);

        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPermissions(address)", nonOwner));
        orchestrator.updateModule("computationEngine", address(newEngine));
    }
}
