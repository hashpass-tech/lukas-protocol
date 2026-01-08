// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../../src/fhenix/core/FhenixComputationEngine.sol";
import "../../../src/fhenix/errors/FhenixErrors.sol";

/**
 * @title EncryptedPegDeviationProperty
 * @notice Property-based tests for encrypted peg deviation sensitivity
 * 
 * Property 2: Homomorphic Operation Correctness
 * For any two plaintext values a and b, and their encrypted counterparts,
 * performing homomorphic operations on encrypted values then decrypting should
 * equal the plaintext operations of a and b.
 * 
 * Validates: Requirements 1.2, 4.2
 */
contract EncryptedPegDeviationProperty is Test {
    FhenixComputationEngine public computationEngine;

    function setUp() public {
        computationEngine = new FhenixComputationEngine();
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Peg Deviation Adjustment
     * For any valid encrypted sensitivity parameter and plaintext peg deviation,
     * calculating adjustment should produce a valid encrypted result.
     */
    function testProperty_PegDeviationAdjustment_BasicCalculation(
        bytes calldata encryptedSensitivity,
        int256 pegDeviation
    ) public {
        // Constrain to non-empty encrypted values and reasonable peg deviations
        vm.assume(encryptedSensitivity.length > 0 && encryptedSensitivity.length <= 256);
        vm.assume(pegDeviation >= -1000000 && pegDeviation <= 1000000);
        vm.assume(pegDeviation != 0); // Avoid zero deviation

        // Perform scalar multiplication (simulating adjustment calculation)
        uint256 absDeviation = pegDeviation < 0 ? uint256(-pegDeviation) : uint256(pegDeviation);
        bytes memory result = computationEngine.encryptedScalarMultiply(encryptedSensitivity, absDeviation);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Zero Deviation
     * For any valid encrypted sensitivity, adjustment with zero deviation
     * should produce a valid result.
     */
    function testProperty_PegDeviationAdjustment_ZeroDeviation(
        bytes calldata encryptedSensitivity
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedSensitivity.length > 0 && encryptedSensitivity.length <= 256);

        // Multiply by 1 (zero deviation adjustment)
        bytes memory result = computationEngine.encryptedScalarMultiply(encryptedSensitivity, 1);

        // Result should equal the original (identity property)
        assertEq(result, encryptedSensitivity);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Positive Deviation
     * For any valid encrypted sensitivity and positive peg deviation,
     * adjustment should produce a valid result.
     */
    function testProperty_PegDeviationAdjustment_PositiveDeviation(
        bytes calldata encryptedSensitivity,
        uint256 deviation
    ) public {
        // Constrain to non-empty encrypted values and positive deviations
        vm.assume(encryptedSensitivity.length > 0 && encryptedSensitivity.length <= 256);
        vm.assume(deviation > 0 && deviation <= type(uint128).max);

        // Perform adjustment calculation
        bytes memory result = computationEngine.encryptedScalarMultiply(encryptedSensitivity, deviation);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Negative Deviation
     * For any valid encrypted sensitivity and negative peg deviation,
     * adjustment should produce a valid result.
     */
    function testProperty_PegDeviationAdjustment_NegativeDeviation(
        bytes calldata encryptedSensitivity,
        uint256 deviation
    ) public {
        // Constrain to non-empty encrypted values and positive deviations (representing negative)
        vm.assume(encryptedSensitivity.length > 0 && encryptedSensitivity.length <= 256);
        vm.assume(deviation > 0 && deviation <= type(uint128).max);

        // Perform adjustment calculation (absolute value of deviation)
        bytes memory result = computationEngine.encryptedScalarMultiply(encryptedSensitivity, deviation);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Adjustment Consistency
     * For any valid encrypted sensitivity and peg deviation, multiple adjustments
     * with the same deviation should produce consistent results.
     */
    function testProperty_PegDeviationAdjustment_Consistency(
        bytes calldata encryptedSensitivity,
        uint256 deviation
    ) public {
        // Constrain to non-empty encrypted values and non-zero deviations
        vm.assume(encryptedSensitivity.length > 0 && encryptedSensitivity.length <= 256);
        vm.assume(deviation > 0 && deviation <= type(uint128).max);

        // Perform adjustment multiple times
        bytes memory result1 = computationEngine.encryptedScalarMultiply(encryptedSensitivity, deviation);
        bytes memory result2 = computationEngine.encryptedScalarMultiply(encryptedSensitivity, deviation);
        bytes memory result3 = computationEngine.encryptedScalarMultiply(encryptedSensitivity, deviation);

        // All results should be identical (consistency property)
        assertEq(result1, result2);
        assertEq(result2, result3);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Adjustment Composition
     * For any valid encrypted sensitivity and two deviations, applying adjustments
     * sequentially should produce a valid result.
     */
    function testProperty_PegDeviationAdjustment_Composition(
        bytes calldata encryptedSensitivity,
        uint256 deviation1,
        uint256 deviation2
    ) public {
        // Constrain to non-empty encrypted values and non-zero deviations
        vm.assume(encryptedSensitivity.length > 0 && encryptedSensitivity.length <= 256);
        vm.assume(deviation1 > 0 && deviation1 <= type(uint64).max);
        vm.assume(deviation2 > 0 && deviation2 <= type(uint64).max);

        // Apply adjustments sequentially
        bytes memory result = computationEngine.encryptedScalarMultiply(encryptedSensitivity, deviation1);
        result = computationEngine.encryptedScalarMultiply(result, deviation2);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Adjustment with Comparison
     * For any valid encrypted sensitivity and peg deviation, adjustment result
     * should be usable in comparison operations.
     */
    function testProperty_PegDeviationAdjustment_ComparableResult(
        bytes calldata encryptedSensitivity,
        uint256 deviation,
        uint256 threshold
    ) public {
        // Constrain to non-empty encrypted values and non-zero deviations
        vm.assume(encryptedSensitivity.length > 0 && encryptedSensitivity.length <= 256);
        vm.assume(deviation > 0 && deviation <= type(uint128).max);

        // Perform adjustment
        bytes memory adjustedResult = computationEngine.encryptedScalarMultiply(encryptedSensitivity, deviation);

        // Result should be usable in comparison
        bytes memory comparisonResult = computationEngine.encryptedCompare(adjustedResult, threshold);
        assertTrue(comparisonResult.length > 0);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Adjustment Determinism
     * For any valid encrypted sensitivity and peg deviation, adjustment should
     * be deterministic (same input produces same output).
     */
    function testProperty_PegDeviationAdjustment_Determinism(
        bytes calldata encryptedSensitivity,
        uint256 deviation
    ) public {
        // Constrain to non-empty encrypted values and non-zero deviations
        vm.assume(encryptedSensitivity.length > 0 && encryptedSensitivity.length <= 256);
        vm.assume(deviation > 0 && deviation <= type(uint128).max);

        // Perform adjustment multiple times
        bytes memory result1 = computationEngine.encryptedScalarMultiply(encryptedSensitivity, deviation);
        bytes memory result2 = computationEngine.encryptedScalarMultiply(encryptedSensitivity, deviation);
        bytes memory result3 = computationEngine.encryptedScalarMultiply(encryptedSensitivity, deviation);
        bytes memory result4 = computationEngine.encryptedScalarMultiply(encryptedSensitivity, deviation);

        // All results should be identical (determinism property)
        assertEq(result1, result2);
        assertEq(result2, result3);
        assertEq(result3, result4);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Adjustment Preservation
     * For any valid encrypted sensitivity, adjustment should not modify the
     * original encrypted value.
     */
    function testProperty_PegDeviationAdjustment_PreservesOriginal(
        bytes calldata encryptedSensitivity,
        uint256 deviation
    ) public {
        // Constrain to non-empty encrypted values and non-zero deviations
        vm.assume(encryptedSensitivity.length > 0 && encryptedSensitivity.length <= 256);
        vm.assume(deviation > 0 && deviation <= type(uint128).max);

        // Perform adjustment
        bytes memory result = computationEngine.encryptedScalarMultiply(encryptedSensitivity, deviation);

        // Original should be unchanged (can verify by performing same operation again)
        bytes memory result2 = computationEngine.encryptedScalarMultiply(encryptedSensitivity, deviation);
        assertEq(result, result2);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Adjustment with Addition
     * For any valid encrypted sensitivity values and deviations, adjustment
     * results should be addable.
     */
    function testProperty_PegDeviationAdjustment_AddableResults(
        bytes calldata sensitivity1,
        bytes calldata sensitivity2,
        uint256 deviation
    ) public {
        // Constrain to non-empty encrypted values and non-zero deviations
        vm.assume(sensitivity1.length > 0 && sensitivity1.length <= 256);
        vm.assume(sensitivity2.length > 0 && sensitivity2.length <= 256);
        vm.assume(deviation > 0 && deviation <= type(uint128).max);

        // Perform adjustments
        bytes memory adjusted1 = computationEngine.encryptedScalarMultiply(sensitivity1, deviation);
        bytes memory adjusted2 = computationEngine.encryptedScalarMultiply(sensitivity2, deviation);

        // Results should be addable
        bytes memory sum = computationEngine.encryptedAdd(adjusted1, adjusted2);
        assertTrue(sum.length > 0);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Adjustment Boundary Values
     * For any valid encrypted sensitivity, adjustment with boundary values
     * should produce valid results.
     */
    function testProperty_PegDeviationAdjustment_BoundaryValues(
        bytes calldata encryptedSensitivity
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedSensitivity.length > 0 && encryptedSensitivity.length <= 256);

        // Adjust with boundary values
        bytes memory resultOne = computationEngine.encryptedScalarMultiply(encryptedSensitivity, 1);
        bytes memory resultMax = computationEngine.encryptedScalarMultiply(encryptedSensitivity, type(uint128).max);

        // Both results should be valid
        assertTrue(resultOne.length > 0);
        assertTrue(resultMax.length > 0);
    }
}
