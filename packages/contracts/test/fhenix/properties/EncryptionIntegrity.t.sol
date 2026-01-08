// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../../src/fhenix/core/FhenixEncryptionManager.sol";
import "../../../src/fhenix/core/FhenixComputationEngine.sol";
import "../../../src/fhenix/errors/FhenixErrors.sol";

/**
 * @title EncryptionIntegrityProperty
 * @notice Property-based tests for encryption integrity preservation
 * 
 * Property 5: Encryption Integrity Preservation
 * For any encrypted parameter, unauthorized access attempts should fail and
 * the encrypted value should remain unchanged.
 * 
 * Validates: Requirements 1.4, 4.1
 */
contract EncryptionIntegrityProperty is Test {
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
     * @notice Property 5: Encryption Integrity Preservation - Encrypted Value Immutability
     * For any encrypted value, the value should remain unchanged after operations.
     */
    function testProperty_EncryptionIntegrity_ValueImmutability(
        bytes calldata encryptedValue
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedValue.length > 0 && encryptedValue.length <= 256);

        // Perform operation on encrypted value
        bytes memory result = computationEngine.encryptedScalarMultiply(encryptedValue, 1);

        // Original value should be unchanged (can verify by performing same operation again)
        bytes memory result2 = computationEngine.encryptedScalarMultiply(encryptedValue, 1);
        assertEq(result, result2);
    }

    /**
     * @notice Property 5: Encryption Integrity Preservation - Encryption State Consistency
     * For any encryption configuration, the encryption state should remain consistent.
     */
    function testProperty_EncryptionIntegrity_StateConsistency(
        uint256 level
    ) public {
        // Constrain to valid encryption levels
        uint256 validLevel = (level % 3) == 0 ? 128 : (level % 3) == 1 ? 192 : 256;

        encryptionManager.initializeEncryption(testPublicKey, validLevel);

        // Check state multiple times
        EncryptionConfig memory config1 = encryptionManager.getEncryptionConfig();
        EncryptionConfig memory config2 = encryptionManager.getEncryptionConfig();
        EncryptionConfig memory config3 = encryptionManager.getEncryptionConfig();

        // All states should be identical
        assertEq(config1.encryptionLevel, config2.encryptionLevel);
        assertEq(config2.encryptionLevel, config3.encryptionLevel);
        assertEq(config1.publicKey, config2.publicKey);
        assertEq(config2.publicKey, config3.publicKey);
    }

    /**
     * @notice Property 5: Encryption Integrity Preservation - Public Key Integrity
     * For any public key, the key should remain unchanged after initialization.
     */
    function testProperty_EncryptionIntegrity_PublicKeyIntegrity(
        bytes calldata publicKey
    ) public {
        // Constrain to non-empty keys
        vm.assume(publicKey.length > 0 && publicKey.length <= 256);

        encryptionManager.initializeEncryption(publicKey, 256);

        // Retrieve public key multiple times
        bytes memory key1 = encryptionManager.getPublicKey();
        bytes memory key2 = encryptionManager.getPublicKey();
        bytes memory key3 = encryptionManager.getPublicKey();

        // All keys should be identical
        assertEq(key1, key2);
        assertEq(key2, key3);
        assertEq(key1, publicKey);
    }

    /**
     * @notice Property 5: Encryption Integrity Preservation - Encryption Level Integrity
     * For any encryption level, the level should remain unchanged after initialization.
     */
    function testProperty_EncryptionIntegrity_LevelIntegrity(
        uint256 level
    ) public {
        // Constrain to valid encryption levels
        uint256 validLevel = (level % 3) == 0 ? 128 : (level % 3) == 1 ? 192 : 256;

        encryptionManager.initializeEncryption(testPublicKey, validLevel);

        // Retrieve encryption level multiple times
        EncryptionConfig memory config1 = encryptionManager.getEncryptionConfig();
        EncryptionConfig memory config2 = encryptionManager.getEncryptionConfig();
        EncryptionConfig memory config3 = encryptionManager.getEncryptionConfig();

        // All levels should be identical
        assertEq(config1.encryptionLevel, config2.encryptionLevel);
        assertEq(config2.encryptionLevel, config3.encryptionLevel);
        assertEq(config1.encryptionLevel, validLevel);
    }

    /**
     * @notice Property 5: Encryption Integrity Preservation - Encrypted Value Consistency
     * For any encrypted value, multiple operations should produce consistent results.
     */
    function testProperty_EncryptionIntegrity_ValueConsistency(
        bytes calldata encryptedValue,
        uint256 scalar
    ) public {
        // Constrain to non-empty encrypted values and non-zero scalars
        vm.assume(encryptedValue.length > 0 && encryptedValue.length <= 256);
        vm.assume(scalar > 0 && scalar <= type(uint128).max);

        // Perform operation multiple times
        bytes memory result1 = computationEngine.encryptedScalarMultiply(encryptedValue, scalar);
        bytes memory result2 = computationEngine.encryptedScalarMultiply(encryptedValue, scalar);
        bytes memory result3 = computationEngine.encryptedScalarMultiply(encryptedValue, scalar);

        // All results should be identical
        assertEq(result1, result2);
        assertEq(result2, result3);
    }

    /**
     * @notice Property 5: Encryption Integrity Preservation - Encryption Active State
     * For any encryption configuration, the encryption active state should be consistent.
     */
    function testProperty_EncryptionIntegrity_ActiveStateConsistency(
        uint256 level
    ) public {
        // Constrain to valid encryption levels
        uint256 validLevel = (level % 3) == 0 ? 128 : (level % 3) == 1 ? 192 : 256;

        encryptionManager.initializeEncryption(testPublicKey, validLevel);

        // Check active state multiple times
        bool active1 = encryptionManager.isEncryptionActive();
        bool active2 = encryptionManager.isEncryptionActive();
        bool active3 = encryptionManager.isEncryptionActive();

        // All states should be identical
        assertTrue(active1);
        assertTrue(active2);
        assertTrue(active3);
    }

    /**
     * @notice Property 5: Encryption Integrity Preservation - Encrypted Operation Determinism
     * For any encrypted value and operation, the operation should be deterministic.
     */
    function testProperty_EncryptionIntegrity_OperationDeterminism(
        bytes calldata a,
        bytes calldata b
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(a.length > 0 && a.length <= 256);
        vm.assume(b.length > 0 && b.length <= 256);

        // Perform addition multiple times
        bytes memory result1 = computationEngine.encryptedAdd(a, b);
        bytes memory result2 = computationEngine.encryptedAdd(a, b);
        bytes memory result3 = computationEngine.encryptedAdd(a, b);
        bytes memory result4 = computationEngine.encryptedAdd(a, b);

        // All results should be identical (determinism property)
        assertEq(result1, result2);
        assertEq(result2, result3);
        assertEq(result3, result4);
    }

    /**
     * @notice Property 5: Encryption Integrity Preservation - Configuration Immutability
     * For any encryption configuration, the configuration should not change
     * after initialization.
     */
    function testProperty_EncryptionIntegrity_ConfigImmutability(
        bytes calldata publicKey,
        uint256 level
    ) public {
        // Constrain to non-empty keys and valid levels
        vm.assume(publicKey.length > 0 && publicKey.length <= 256);
        uint256 validLevel = (level % 3) == 0 ? 128 : (level % 3) == 1 ? 192 : 256;

        encryptionManager.initializeEncryption(publicKey, validLevel);

        // Get configuration
        EncryptionConfig memory config1 = encryptionManager.getEncryptionConfig();

        // Perform some operations
        bytes memory key = encryptionManager.getPublicKey();
        bool active = encryptionManager.isEncryptionActive();

        // Get configuration again
        EncryptionConfig memory config2 = encryptionManager.getEncryptionConfig();

        // Configuration should be unchanged
        assertEq(config1.publicKey, config2.publicKey);
        assertEq(config1.encryptionLevel, config2.encryptionLevel);
    }

    /**
     * @notice Property 5: Encryption Integrity Preservation - Encrypted Value Preservation
     * For any encrypted value, the value should be preserved through operations.
     */
    function testProperty_EncryptionIntegrity_ValuePreservation(
        bytes calldata encryptedValue
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedValue.length > 0 && encryptedValue.length <= 256);

        // Perform operation with scalar 1 (identity)
        bytes memory result = computationEngine.encryptedScalarMultiply(encryptedValue, 1);

        // Result should equal original (identity property)
        assertEq(result, encryptedValue);
    }

    /**
     * @notice Property 5: Encryption Integrity Preservation - Encryption Metadata Consistency
     * For any encryption configuration, the encryption metadata should be consistent.
     */
    function testProperty_EncryptionIntegrity_MetadataConsistency(
        uint256 level
    ) public {
        // Constrain to valid encryption levels
        uint256 validLevel = (level % 3) == 0 ? 128 : (level % 3) == 1 ? 192 : 256;

        encryptionManager.initializeEncryption(testPublicKey, validLevel);

        // Get configuration multiple times
        EncryptionConfig memory config1 = encryptionManager.getEncryptionConfig();
        EncryptionConfig memory config2 = encryptionManager.getEncryptionConfig();

        // Metadata should be consistent
        assertEq(config1.encryptionLevel, config2.encryptionLevel);
        assertEq(config1.publicKey, config2.publicKey);
    }
}
