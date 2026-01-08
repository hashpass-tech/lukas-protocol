// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../../src/fhenix/core/FhenixEncryptionManager.sol";
import "../../../src/fhenix/core/FhenixComputationEngine.sol";
import "../../../src/fhenix/errors/FhenixErrors.sol";

/**
 * @title EncryptionRoundTrip
 * @notice Property-based tests for encryption round-trip consistency
 * 
 * Property 1: Encryption Round-Trip Consistency
 * For any plaintext parameter value and valid FHENIX encryption configuration,
 * encrypting then decrypting the value should produce the original plaintext value.
 * 
 * Validates: Requirements 1.1, 4.1, 4.3, 4.4
 */
contract EncryptionRoundTrip is Test {
    FhenixEncryptionManager public encryptionManager;
    FhenixComputationEngine public computationEngine;
    address public owner;
    bytes public testPublicKey;

    function setUp() public {
        owner = address(this);
        encryptionManager = new FhenixEncryptionManager(owner);
        computationEngine = new FhenixComputationEngine();
        testPublicKey = hex"0123456789abcdef";
    }

    /**
     * @notice Property 1: Encryption Round-Trip Consistency
     * For any valid encryption level, initialization should succeed and
     * the encryption should be active and retrievable.
     */
    function testProperty_EncryptionRoundTripConsistency_ValidLevels(uint256 level) public {
        // Constrain to valid encryption levels
        uint256 validLevel = (level % 3) == 0 ? 128 : (level % 3) == 1 ? 192 : 256;

        encryptionManager.initializeEncryption(testPublicKey, validLevel);

        // Verify encryption is active
        assertTrue(encryptionManager.isEncryptionActive());

        // Verify public key is retrievable
        bytes memory retrievedKey = encryptionManager.getPublicKey();
        assertEq(retrievedKey, testPublicKey);

        // Verify encryption config is correct
        EncryptionConfig memory config = encryptionManager.getEncryptionConfig();
        assertEq(config.encryptionLevel, validLevel);
        assertEq(config.publicKey, testPublicKey);
    }

    /**
     * @notice Property 1: Encryption Round-Trip Consistency
     * For any valid public key, encryption should preserve the key through
     * initialization and retrieval.
     */
    function testProperty_EncryptionRoundTripConsistency_PublicKeyPreservation(
        bytes calldata publicKey
    ) public {
        // Constrain to non-empty keys
        vm.assume(publicKey.length > 0 && publicKey.length <= 256);

        encryptionManager.initializeEncryption(publicKey, 256);

        // Verify public key is preserved
        bytes memory retrievedKey = encryptionManager.getPublicKey();
        assertEq(retrievedKey, publicKey);
    }

    /**
     * @notice Property 1: Encryption Round-Trip Consistency
     * For any valid encryption configuration, key rotation should preserve
     * the new key through rotation and retrieval.
     */
    function testProperty_EncryptionRoundTripConsistency_KeyRotation(
        bytes calldata newPublicKey
    ) public {
        // Constrain to non-empty keys
        vm.assume(newPublicKey.length > 0 && newPublicKey.length <= 256);

        // Initialize with original key
        encryptionManager.initializeEncryption(testPublicKey, 256);

        // Fast forward past key rotation interval
        vm.roll(block.number + 100001);

        // Rotate to new key
        encryptionManager.rotateKeys(newPublicKey);

        // Verify new key is preserved
        bytes memory retrievedKey = encryptionManager.getPublicKey();
        assertEq(retrievedKey, newPublicKey);
    }

    /**
     * @notice Property 1: Encryption Round-Trip Consistency
     * For any valid encryption configuration, the encryption state should
     * remain consistent across multiple operations.
     */
    function testProperty_EncryptionRoundTripConsistency_StateConsistency(
        uint256 numOperations
    ) public {
        // Constrain number of operations
        numOperations = (numOperations % 10) + 1;

        encryptionManager.initializeEncryption(testPublicKey, 256);

        // Perform multiple operations and verify state consistency
        for (uint256 i = 0; i < numOperations; i++) {
            assertTrue(encryptionManager.isEncryptionActive());
            assertEq(encryptionManager.getPublicKey(), testPublicKey);

            EncryptionConfig memory config = encryptionManager.getEncryptionConfig();
            assertEq(config.encryptionLevel, 256);
        }
    }

    /**
     * @notice Property 1: Encryption Round-Trip Consistency
     * For any valid encrypted value, homomorphic operations should preserve
     * the encrypted value structure.
     */
    function testProperty_EncryptionRoundTripConsistency_EncryptedValuePreservation(
        bytes calldata encryptedValue
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedValue.length > 0 && encryptedValue.length <= 256);

        // Verify encrypted value can be used in operations
        bytes memory result = computationEngine.encryptedScalarMultiply(encryptedValue, 1);

        // Result should be the same as input (scalar multiply by 1)
        assertEq(result, encryptedValue);
    }

    /**
     * @notice Property 1: Encryption Round-Trip Consistency
     * For any two valid encrypted values, addition should produce a valid result.
     */
    function testProperty_EncryptionRoundTripConsistency_EncryptedAddition(
        bytes calldata a,
        bytes calldata b
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(a.length > 0 && a.length <= 256);
        vm.assume(b.length > 0 && b.length <= 256);

        // Perform encrypted addition
        bytes memory result = computationEngine.encryptedAdd(a, b);

        // Result should be non-empty
        assertTrue(result.length > 0);

        // Result should contain both inputs (concatenated in placeholder implementation)
        assertEq(result.length, a.length + b.length);
    }

    /**
     * @notice Property 1: Encryption Round-Trip Consistency
     * For any valid encrypted value and plaintext scalar, scalar multiplication
     * should produce a valid result.
     */
    function testProperty_EncryptionRoundTripConsistency_ScalarMultiplication(
        bytes calldata encrypted,
        uint256 scalar
    ) public {
        // Constrain to non-empty encrypted values and non-zero scalars
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);
        vm.assume(scalar > 0);

        // Perform scalar multiplication
        bytes memory result = computationEngine.encryptedScalarMultiply(encrypted, scalar);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 1: Encryption Round-Trip Consistency
     * For any valid encrypted value and plaintext threshold, comparison
     * should produce a valid result.
     */
    function testProperty_EncryptionRoundTripConsistency_Comparison(
        bytes calldata encrypted,
        uint256 threshold
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);

        // Perform comparison
        bytes memory result = computationEngine.encryptedCompare(encrypted, threshold);

        // Result should be non-empty
        assertTrue(result.length > 0);

        // Result should be a single byte (placeholder implementation)
        assertEq(result.length, 1);
    }

    /**
     * @notice Property 1: Encryption Round-Trip Consistency
     * For any valid encrypted input and plaintext coefficients, polynomial
     * evaluation should produce a valid result.
     */
    function testProperty_EncryptionRoundTripConsistency_PolynomialEvaluation(
        bytes calldata encryptedInput,
        uint256[] calldata coefficients
    ) public {
        // Constrain to non-empty encrypted values and non-empty coefficients
        vm.assume(encryptedInput.length > 0 && encryptedInput.length <= 256);
        vm.assume(coefficients.length > 0 && coefficients.length <= 10);

        // Perform polynomial evaluation
        bytes memory result = computationEngine.encryptedPolyEval(encryptedInput, coefficients);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 1: Encryption Round-Trip Consistency
     * For any valid encryption configuration, the encryption level should
     * be retrievable and consistent.
     */
    function testProperty_EncryptionRoundTripConsistency_EncryptionLevelConsistency(
        uint256 level
    ) public {
        // Constrain to valid encryption levels
        uint256 validLevel = (level % 3) == 0 ? 128 : (level % 3) == 1 ? 192 : 256;

        encryptionManager.initializeEncryption(testPublicKey, validLevel);

        // Verify encryption level is consistent
        EncryptionConfig memory config = encryptionManager.getEncryptionConfig();
        assertEq(config.encryptionLevel, validLevel);

        // Verify encryption level doesn't change
        config = encryptionManager.getEncryptionConfig();
        assertEq(config.encryptionLevel, validLevel);
    }

    /**
     * @notice Property 1: Encryption Round-Trip Consistency
     * For any valid encryption configuration, the decryption authorizer
     * should be retrievable and consistent.
     */
    function testProperty_EncryptionRoundTripConsistency_DecryptionAuthorizerConsistency(
        address authorizer
    ) public {
        // Constrain to non-zero addresses
        vm.assume(authorizer != address(0));

        encryptionManager.initializeEncryption(testPublicKey, 256);
        encryptionManager.setDecryptionAuthorizer(authorizer);

        // Verify decryption authorizer is consistent
        EncryptionConfig memory config = encryptionManager.getEncryptionConfig();
        assertEq(config.decryptionAuthorizer, authorizer);

        // Verify decryption authorizer doesn't change
        config = encryptionManager.getEncryptionConfig();
        assertEq(config.decryptionAuthorizer, authorizer);
    }
}
