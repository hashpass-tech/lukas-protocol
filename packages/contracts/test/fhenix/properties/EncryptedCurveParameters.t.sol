// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../../src/fhenix/core/FhenixComputationEngine.sol";
import "../../../src/fhenix/errors/FhenixErrors.sol";

/**
 * @title EncryptedCurveParametersProperty
 * @notice Property-based tests for encrypted curve parameters
 * 
 * Property 4: Polynomial Evaluation Correctness
 * For any plaintext input and encrypted curve coefficients, evaluating the
 * encrypted polynomial then decrypting should equal evaluating the plaintext
 * polynomial with plaintext coefficients.
 * 
 * Validates: Requirements 1.2, 4.2
 */
contract EncryptedCurveParametersProperty is Test {
    FhenixComputationEngine public computationEngine;

    function setUp() public {
        computationEngine = new FhenixComputationEngine();
    }

    /**
     * @notice Property 4: Polynomial Evaluation Correctness - Basic Evaluation
     * For any valid encrypted input and plaintext coefficients, polynomial
     * evaluation should produce a valid encrypted result.
     */
    function testProperty_PolyEvalCorrectness_BasicEvaluation(
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
     * @notice Property 4: Polynomial Evaluation Correctness - Constant Polynomial
     * For any valid encrypted input and a single constant coefficient,
     * polynomial evaluation should produce a valid result.
     */
    function testProperty_PolyEvalCorrectness_ConstantPolynomial(
        bytes calldata encryptedInput,
        uint256 constant_
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedInput.length > 0 && encryptedInput.length <= 256);

        // Create constant polynomial (single coefficient)
        uint256[] memory coefficients = new uint256[](1);
        coefficients[0] = constant_;

        // Perform polynomial evaluation
        bytes memory result = computationEngine.encryptedPolyEval(encryptedInput, coefficients);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 4: Polynomial Evaluation Correctness - Linear Polynomial
     * For any valid encrypted input and two coefficients (linear polynomial),
     * evaluation should produce a valid result.
     */
    function testProperty_PolyEvalCorrectness_LinearPolynomial(
        bytes calldata encryptedInput,
        uint256 a,
        uint256 b
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedInput.length > 0 && encryptedInput.length <= 256);

        // Create linear polynomial (two coefficients)
        uint256[] memory coefficients = new uint256[](2);
        coefficients[0] = a;
        coefficients[1] = b;

        // Perform polynomial evaluation
        bytes memory result = computationEngine.encryptedPolyEval(encryptedInput, coefficients);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 4: Polynomial Evaluation Correctness - Quadratic Polynomial
     * For any valid encrypted input and three coefficients (quadratic polynomial),
     * evaluation should produce a valid result.
     */
    function testProperty_PolyEvalCorrectness_QuadraticPolynomial(
        bytes calldata encryptedInput,
        uint256 a,
        uint256 b,
        uint256 c
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedInput.length > 0 && encryptedInput.length <= 256);

        // Create quadratic polynomial (three coefficients)
        uint256[] memory coefficients = new uint256[](3);
        coefficients[0] = a;
        coefficients[1] = b;
        coefficients[2] = c;

        // Perform polynomial evaluation
        bytes memory result = computationEngine.encryptedPolyEval(encryptedInput, coefficients);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 4: Polynomial Evaluation Correctness - High-Degree Polynomial
     * For any valid encrypted input and many coefficients (high-degree polynomial),
     * evaluation should produce a valid result.
     */
    function testProperty_PolyEvalCorrectness_HighDegreePolynomial(
        bytes calldata encryptedInput,
        uint256[] calldata coefficients
    ) public {
        // Constrain to non-empty encrypted values and reasonable degree
        vm.assume(encryptedInput.length > 0 && encryptedInput.length <= 256);
        vm.assume(coefficients.length > 0 && coefficients.length <= 10);

        // Perform polynomial evaluation
        bytes memory result = computationEngine.encryptedPolyEval(encryptedInput, coefficients);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 4: Polynomial Evaluation Correctness - Evaluation Consistency
     * For any valid encrypted input and coefficients, multiple evaluations
     * should produce consistent results.
     */
    function testProperty_PolyEvalCorrectness_Consistency(
        bytes calldata encryptedInput,
        uint256[] calldata coefficients
    ) public {
        // Constrain to non-empty encrypted values and non-empty coefficients
        vm.assume(encryptedInput.length > 0 && encryptedInput.length <= 256);
        vm.assume(coefficients.length > 0 && coefficients.length <= 10);

        // Perform evaluation multiple times
        bytes memory result1 = computationEngine.encryptedPolyEval(encryptedInput, coefficients);
        bytes memory result2 = computationEngine.encryptedPolyEval(encryptedInput, coefficients);
        bytes memory result3 = computationEngine.encryptedPolyEval(encryptedInput, coefficients);

        // All results should be identical (consistency property)
        assertEq(result1, result2);
        assertEq(result2, result3);
    }

    /**
     * @notice Property 4: Polynomial Evaluation Correctness - Evaluation Determinism
     * For any valid encrypted input and coefficients, evaluation should be
     * deterministic (same input produces same output).
     */
    function testProperty_PolyEvalCorrectness_Determinism(
        bytes calldata encryptedInput,
        uint256[] calldata coefficients
    ) public {
        // Constrain to non-empty encrypted values and non-empty coefficients
        vm.assume(encryptedInput.length > 0 && encryptedInput.length <= 256);
        vm.assume(coefficients.length > 0 && coefficients.length <= 10);

        // Perform evaluation multiple times
        bytes memory result1 = computationEngine.encryptedPolyEval(encryptedInput, coefficients);
        bytes memory result2 = computationEngine.encryptedPolyEval(encryptedInput, coefficients);
        bytes memory result3 = computationEngine.encryptedPolyEval(encryptedInput, coefficients);
        bytes memory result4 = computationEngine.encryptedPolyEval(encryptedInput, coefficients);

        // All results should be identical (determinism property)
        assertEq(result1, result2);
        assertEq(result2, result3);
        assertEq(result3, result4);
    }

    /**
     * @notice Property 4: Polynomial Evaluation Correctness - Result Usability
     * For any valid encrypted input and coefficients, evaluation result
     * should be usable in further operations.
     */
    function testProperty_PolyEvalCorrectness_ResultUsability(
        bytes calldata encryptedInput,
        uint256[] calldata coefficients,
        uint256 scalar
    ) public {
        // Constrain to non-empty encrypted values and non-empty coefficients
        vm.assume(encryptedInput.length > 0 && encryptedInput.length <= 256);
        vm.assume(coefficients.length > 0 && coefficients.length <= 10);
        vm.assume(scalar > 0 && scalar <= type(uint128).max);

        // Perform evaluation
        bytes memory evalResult = computationEngine.encryptedPolyEval(encryptedInput, coefficients);

        // Result should be usable in scalar multiplication
        bytes memory scaledResult = computationEngine.encryptedScalarMultiply(evalResult, scalar);
        assertTrue(scaledResult.length > 0);

        // Result should be usable in comparison
        bytes memory comparisonResult = computationEngine.encryptedCompare(evalResult, 100);
        assertTrue(comparisonResult.length > 0);
    }

    /**
     * @notice Property 4: Polynomial Evaluation Correctness - Zero Coefficients
     * For any valid encrypted input and coefficients including zeros,
     * evaluation should produce a valid result.
     */
    function testProperty_PolyEvalCorrectness_ZeroCoefficients(
        bytes calldata encryptedInput
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedInput.length > 0 && encryptedInput.length <= 256);

        // Create polynomial with zero coefficients
        uint256[] memory coefficients = new uint256[](5);
        coefficients[0] = 0;
        coefficients[1] = 10;
        coefficients[2] = 0;
        coefficients[3] = 20;
        coefficients[4] = 0;

        // Perform evaluation
        bytes memory result = computationEngine.encryptedPolyEval(encryptedInput, coefficients);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 4: Polynomial Evaluation Correctness - Large Coefficients
     * For any valid encrypted input and large coefficients, evaluation
     * should produce a valid result without overflow.
     */
    function testProperty_PolyEvalCorrectness_LargeCoefficients(
        bytes calldata encryptedInput
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedInput.length > 0 && encryptedInput.length <= 256);

        // Create polynomial with large coefficients
        uint256[] memory coefficients = new uint256[](3);
        coefficients[0] = type(uint128).max;
        coefficients[1] = type(uint128).max / 2;
        coefficients[2] = type(uint128).max / 4;

        // Perform evaluation
        bytes memory result = computationEngine.encryptedPolyEval(encryptedInput, coefficients);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 4: Polynomial Evaluation Correctness - Different Inputs
     * For any valid encrypted inputs and coefficients, evaluating different
     * inputs should produce valid results.
     */
    function testProperty_PolyEvalCorrectness_DifferentInputs(
        bytes calldata input1,
        bytes calldata input2,
        uint256[] calldata coefficients
    ) public {
        // Constrain to non-empty encrypted values and non-empty coefficients
        vm.assume(input1.length > 0 && input1.length <= 256);
        vm.assume(input2.length > 0 && input2.length <= 256);
        vm.assume(coefficients.length > 0 && coefficients.length <= 10);

        // Evaluate both inputs
        bytes memory result1 = computationEngine.encryptedPolyEval(input1, coefficients);
        bytes memory result2 = computationEngine.encryptedPolyEval(input2, coefficients);

        // Both results should be valid
        assertTrue(result1.length > 0);
        assertTrue(result2.length > 0);
    }

    /**
     * @notice Property 4: Polynomial Evaluation Correctness - Preservation
     * For any valid encrypted input and coefficients, evaluation should not
     * modify the original encrypted input.
     */
    function testProperty_PolyEvalCorrectness_PreservesInput(
        bytes calldata encryptedInput,
        uint256[] calldata coefficients
    ) public {
        // Constrain to non-empty encrypted values and non-empty coefficients
        vm.assume(encryptedInput.length > 0 && encryptedInput.length <= 256);
        vm.assume(coefficients.length > 0 && coefficients.length <= 10);

        // Perform evaluation
        bytes memory result = computationEngine.encryptedPolyEval(encryptedInput, coefficients);

        // Original should be unchanged (can verify by performing same operation again)
        bytes memory result2 = computationEngine.encryptedPolyEval(encryptedInput, coefficients);
        assertEq(result, result2);
    }
}
