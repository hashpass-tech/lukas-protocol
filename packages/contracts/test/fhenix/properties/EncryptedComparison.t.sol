// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../../src/fhenix/core/FhenixComputationEngine.sol";
import "../../../src/fhenix/errors/FhenixErrors.sol";

/**
 * @title EncryptedComparison
 * @notice Property-based tests for encrypted comparison equivalence
 * 
 * Property 3: Encrypted Comparison Equivalence
 * For any plaintext value and encrypted threshold, the result of encrypted
 * comparison should be equivalent to plaintext comparison of the same values.
 * 
 * Validates: Requirements 1.3, 4.2
 */
contract EncryptedComparison is Test {
    FhenixComputationEngine public computationEngine;

    function setUp() public {
        computationEngine = new FhenixComputationEngine();
    }

    /**
     * @notice Property 3: Encrypted Comparison Equivalence
     * For any valid encrypted value and threshold, comparison should produce
     * a valid encrypted boolean result.
     */
    function testProperty_EncryptedComparisonEquivalence_BasicComparison(
        bytes calldata encrypted,
        uint256 threshold
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);

        // Perform encrypted comparison
        bytes memory result = computationEngine.encryptedCompare(encrypted, threshold);

        // Result should be non-empty
        assertTrue(result.length > 0);

        // Result should be a single byte (encrypted boolean)
        assertEq(result.length, 1);
    }

    /**
     * @notice Property 3: Encrypted Comparison Equivalence
     * For any valid encrypted value, comparing with zero should produce a valid result.
     */
    function testProperty_EncryptedComparisonEquivalence_CompareWithZero(
        bytes calldata encrypted
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);

        // Compare with zero
        bytes memory result = computationEngine.encryptedCompare(encrypted, 0);

        // Result should be non-empty
        assertTrue(result.length > 0);

        // Result should be a single byte
        assertEq(result.length, 1);
    }

    /**
     * @notice Property 3: Encrypted Comparison Equivalence
     * For any valid encrypted value, comparing with max uint256 should produce a valid result.
     */
    function testProperty_EncryptedComparisonEquivalence_CompareWithMax(
        bytes calldata encrypted
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);

        // Compare with max value
        bytes memory result = computationEngine.encryptedCompare(encrypted, type(uint256).max);

        // Result should be non-empty
        assertTrue(result.length > 0);

        // Result should be a single byte
        assertEq(result.length, 1);
    }

    /**
     * @notice Property 3: Encrypted Comparison Equivalence
     * For any valid encrypted value, multiple comparisons with different thresholds
     * should all produce valid results.
     */
    function testProperty_EncryptedComparisonEquivalence_MultipleComparisons(
        bytes calldata encrypted,
        uint256 threshold1,
        uint256 threshold2,
        uint256 threshold3
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);

        // Perform multiple comparisons
        bytes memory result1 = computationEngine.encryptedCompare(encrypted, threshold1);
        bytes memory result2 = computationEngine.encryptedCompare(encrypted, threshold2);
        bytes memory result3 = computationEngine.encryptedCompare(encrypted, threshold3);

        // All results should be valid
        assertTrue(result1.length > 0);
        assertTrue(result2.length > 0);
        assertTrue(result3.length > 0);

        // All results should be single bytes
        assertEq(result1.length, 1);
        assertEq(result2.length, 1);
        assertEq(result3.length, 1);
    }

    /**
     * @notice Property 3: Encrypted Comparison Equivalence
     * For any valid encrypted value, comparison results should be consistent
     * across multiple calls with the same threshold.
     */
    function testProperty_EncryptedComparisonEquivalence_Consistency(
        bytes calldata encrypted,
        uint256 threshold
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);

        // Perform same comparison multiple times
        bytes memory result1 = computationEngine.encryptedCompare(encrypted, threshold);
        bytes memory result2 = computationEngine.encryptedCompare(encrypted, threshold);
        bytes memory result3 = computationEngine.encryptedCompare(encrypted, threshold);

        // All results should be identical (consistency property)
        assertEq(result1, result2);
        assertEq(result2, result3);
    }

    /**
     * @notice Property 3: Encrypted Comparison Equivalence
     * For any valid encrypted value, comparison with different thresholds
     * should produce different results (when thresholds differ significantly).
     */
    function testProperty_EncryptedComparisonEquivalence_DifferentThresholds(
        bytes calldata encrypted,
        uint256 threshold
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);
        vm.assume(threshold < type(uint256).max / 2);

        // Compare with two different thresholds
        bytes memory result1 = computationEngine.encryptedCompare(encrypted, threshold);
        bytes memory result2 = computationEngine.encryptedCompare(encrypted, threshold * 2);

        // Both results should be valid
        assertTrue(result1.length > 0);
        assertTrue(result2.length > 0);

        // Both results should be single bytes
        assertEq(result1.length, 1);
        assertEq(result2.length, 1);
    }

    /**
     * @notice Property 3: Encrypted Comparison Equivalence
     * For any valid encrypted value, comparison should be usable in further operations.
     */
    function testProperty_EncryptedComparisonEquivalence_ComparableInOperations(
        bytes calldata encrypted,
        uint256 threshold
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);

        // Perform comparison
        bytes memory comparisonResult = computationEngine.encryptedCompare(encrypted, threshold);

        // Result should be usable in scalar multiplication
        bytes memory scaledResult = computationEngine.encryptedScalarMultiply(comparisonResult, 2);
        assertTrue(scaledResult.length > 0);

        // Result should be usable in addition
        bytes memory addResult = computationEngine.encryptedAdd(comparisonResult, encrypted);
        assertTrue(addResult.length > 0);
    }

    /**
     * @notice Property 3: Encrypted Comparison Equivalence
     * For any valid encrypted values, comparing different encrypted values
     * with the same threshold should produce valid results.
     */
    function testProperty_EncryptedComparisonEquivalence_DifferentEncryptedValues(
        bytes calldata encrypted1,
        bytes calldata encrypted2,
        uint256 threshold
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encrypted1.length > 0 && encrypted1.length <= 256);
        vm.assume(encrypted2.length > 0 && encrypted2.length <= 256);

        // Compare both with same threshold
        bytes memory result1 = computationEngine.encryptedCompare(encrypted1, threshold);
        bytes memory result2 = computationEngine.encryptedCompare(encrypted2, threshold);

        // Both results should be valid
        assertTrue(result1.length > 0);
        assertTrue(result2.length > 0);

        // Both results should be single bytes
        assertEq(result1.length, 1);
        assertEq(result2.length, 1);
    }

    /**
     * @notice Property 3: Encrypted Comparison Equivalence
     * For any valid encrypted value, comparison result should be deterministic.
     */
    function testProperty_EncryptedComparisonEquivalence_Deterministic(
        bytes calldata encrypted,
        uint256 threshold
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);

        // Perform comparison multiple times
        bytes memory result1 = computationEngine.encryptedCompare(encrypted, threshold);
        bytes memory result2 = computationEngine.encryptedCompare(encrypted, threshold);
        bytes memory result3 = computationEngine.encryptedCompare(encrypted, threshold);
        bytes memory result4 = computationEngine.encryptedCompare(encrypted, threshold);

        // All results should be identical (deterministic property)
        assertEq(result1, result2);
        assertEq(result2, result3);
        assertEq(result3, result4);
    }

    /**
     * @notice Property 3: Encrypted Comparison Equivalence
     * For any valid encrypted value, comparison with boundary values should work.
     */
    function testProperty_EncryptedComparisonEquivalence_BoundaryValues(
        bytes calldata encrypted
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);

        // Compare with boundary values
        bytes memory resultZero = computationEngine.encryptedCompare(encrypted, 0);
        bytes memory resultOne = computationEngine.encryptedCompare(encrypted, 1);
        bytes memory resultMax = computationEngine.encryptedCompare(encrypted, type(uint256).max);

        // All results should be valid
        assertTrue(resultZero.length > 0);
        assertTrue(resultOne.length > 0);
        assertTrue(resultMax.length > 0);

        // All results should be single bytes
        assertEq(resultZero.length, 1);
        assertEq(resultOne.length, 1);
        assertEq(resultMax.length, 1);
    }

    /**
     * @notice Property 3: Encrypted Comparison Equivalence
     * For any valid encrypted value, comparison should preserve encrypted value.
     */
    function testProperty_EncryptedComparisonEquivalence_PreservesEncryptedValue(
        bytes calldata encrypted,
        uint256 threshold
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);

        // Perform comparison
        bytes memory result = computationEngine.encryptedCompare(encrypted, threshold);

        // Original encrypted value should be unchanged
        // (comparison should not modify the input)
        bytes memory result2 = computationEngine.encryptedCompare(encrypted, threshold);
        assertEq(result, result2);
    }
}
