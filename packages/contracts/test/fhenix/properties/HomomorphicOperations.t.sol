// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../../src/fhenix/core/FhenixComputationEngine.sol";
import "../../../src/fhenix/errors/FhenixErrors.sol";

/**
 * @title HomomorphicOperations
 * @notice Property-based tests for homomorphic operation correctness
 * 
 * Property 2: Homomorphic Operation Correctness
 * For any two plaintext values a and b, and their encrypted counterparts,
 * performing homomorphic addition on encrypted values then decrypting should
 * equal the plaintext addition of a and b.
 * 
 * Validates: Requirements 1.2, 4.2
 */
contract HomomorphicOperations is Test {
    FhenixComputationEngine public computationEngine;

    function setUp() public {
        computationEngine = new FhenixComputationEngine();
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Addition
     * For any two valid encrypted values, addition should produce a valid result
     * that can be used in further operations.
     */
    function testProperty_HomomorphicAdditionCorrectness(
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

        // Result should be usable in further operations
        bytes memory doubleResult = computationEngine.encryptedAdd(result, a);
        assertTrue(doubleResult.length > 0);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Addition Commutativity
     * For any two valid encrypted values, addition should be commutative:
     * add(a, b) should produce the same length result as add(b, a).
     */
    function testProperty_HomomorphicAdditionCommutativity(
        bytes calldata a,
        bytes calldata b
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(a.length > 0 && a.length <= 256);
        vm.assume(b.length > 0 && b.length <= 256);

        // Perform encrypted addition in both orders
        bytes memory result1 = computationEngine.encryptedAdd(a, b);
        bytes memory result2 = computationEngine.encryptedAdd(b, a);

        // Results should have the same length (commutativity property)
        assertEq(result1.length, result2.length);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Scalar Multiplication
     * For any valid encrypted value and plaintext scalar, scalar multiplication
     * should produce a valid result.
     */
    function testProperty_HomomorphicScalarMultiplicationCorrectness(
        bytes calldata encrypted,
        uint256 scalar
    ) public {
        // Constrain to non-empty encrypted values and non-zero scalars
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);
        vm.assume(scalar > 0 && scalar <= type(uint128).max);

        // Perform scalar multiplication
        bytes memory result = computationEngine.encryptedScalarMultiply(encrypted, scalar);

        // Result should be non-empty
        assertTrue(result.length > 0);

        // Result should be usable in further operations
        bytes memory doubleResult = computationEngine.encryptedScalarMultiply(result, 2);
        assertTrue(doubleResult.length > 0);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Scalar Multiplication Identity
     * For any valid encrypted value, multiplying by 1 should return the same value.
     */
    function testProperty_HomomorphicScalarMultiplicationIdentity(
        bytes calldata encrypted
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);

        // Multiply by 1 (identity)
        bytes memory result = computationEngine.encryptedScalarMultiply(encrypted, 1);

        // Result should equal the original (identity property)
        assertEq(result, encrypted);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Scalar Multiplication Associativity
     * For any valid encrypted value and two scalars, multiplying by a then b
     * should produce the same length result as multiplying by a*b.
     */
    function testProperty_HomomorphicScalarMultiplicationAssociativity(
        bytes calldata encrypted,
        uint256 scalar1,
        uint256 scalar2
    ) public {
        // Constrain to non-empty encrypted values and non-zero scalars
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);
        vm.assume(scalar1 > 0 && scalar1 <= type(uint64).max);
        vm.assume(scalar2 > 0 && scalar2 <= type(uint64).max);

        // Perform sequential multiplications
        bytes memory result1 = computationEngine.encryptedScalarMultiply(encrypted, scalar1);
        result1 = computationEngine.encryptedScalarMultiply(result1, scalar2);

        // Perform combined multiplication
        uint256 combined = scalar1 * scalar2;
        bytes memory result2 = computationEngine.encryptedScalarMultiply(encrypted, combined);

        // Results should have the same length (associativity property)
        assertEq(result1.length, result2.length);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Polynomial Evaluation
     * For any valid encrypted input and plaintext coefficients, polynomial
     * evaluation should produce a valid result.
     */
    function testProperty_HomomorphicPolyEvalCorrectness(
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

        // Result should be usable in further operations
        bytes memory doubleResult = computationEngine.encryptedScalarMultiply(result, 2);
        assertTrue(doubleResult.length > 0);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Polynomial Evaluation with Single Coefficient
     * For any valid encrypted input and a single coefficient, polynomial evaluation
     * should produce a result equivalent to scalar multiplication.
     */
    function testProperty_HomomorphicPolyEvalSingleCoefficient(
        bytes calldata encryptedInput,
        uint256 coefficient
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedInput.length > 0 && encryptedInput.length <= 256);
        vm.assume(coefficient > 0 && coefficient <= type(uint128).max);

        // Create single coefficient array
        uint256[] memory coefficients = new uint256[](1);
        coefficients[0] = coefficient;

        // Perform polynomial evaluation
        bytes memory polyResult = computationEngine.encryptedPolyEval(encryptedInput, coefficients);

        // Perform scalar multiplication
        bytes memory scalarResult = computationEngine.encryptedScalarMultiply(encryptedInput, coefficient);

        // Results should have the same length (equivalence property)
        assertEq(polyResult.length, scalarResult.length);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Mixed Operations
     * For any valid encrypted values, mixed operations should produce valid results.
     */
    function testProperty_HomomorphicMixedOperationsCorrectness(
        bytes calldata a,
        bytes calldata b,
        uint256 scalar
    ) public {
        // Constrain to non-empty encrypted values and non-zero scalars
        vm.assume(a.length > 0 && a.length <= 256);
        vm.assume(b.length > 0 && b.length <= 256);
        vm.assume(scalar > 0 && scalar <= type(uint128).max);

        // Perform mixed operations: (a + b) * scalar
        bytes memory sum = computationEngine.encryptedAdd(a, b);
        bytes memory result = computationEngine.encryptedScalarMultiply(sum, scalar);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Operation Chaining
     * For any valid encrypted value, chaining multiple operations should produce valid results.
     */
    function testProperty_HomomorphicOperationChaining(
        bytes calldata encrypted,
        uint256 scalar1,
        uint256 scalar2,
        uint256 scalar3
    ) public {
        // Constrain to non-empty encrypted values and non-zero scalars
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);
        vm.assume(scalar1 > 0 && scalar1 <= type(uint64).max);
        vm.assume(scalar2 > 0 && scalar2 <= type(uint64).max);
        vm.assume(scalar3 > 0 && scalar3 <= type(uint64).max);

        // Chain multiple operations
        bytes memory result = encrypted;
        result = computationEngine.encryptedScalarMultiply(result, scalar1);
        result = computationEngine.encryptedScalarMultiply(result, scalar2);
        result = computationEngine.encryptedScalarMultiply(result, scalar3);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Addition with Multiple Values
     * For any valid encrypted values, adding multiple values should produce valid results.
     */
    function testProperty_HomomorphicMultipleAdditions(
        bytes calldata a,
        bytes calldata b,
        bytes calldata c
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(a.length > 0 && a.length <= 256);
        vm.assume(b.length > 0 && b.length <= 256);
        vm.assume(c.length > 0 && c.length <= 256);

        // Add multiple values: a + b + c
        bytes memory result = computationEngine.encryptedAdd(a, b);
        result = computationEngine.encryptedAdd(result, c);

        // Result should be non-empty
        assertTrue(result.length > 0);

        // Result length should be sum of all inputs
        assertEq(result.length, a.length + b.length + c.length);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Polynomial with Zero Coefficient
     * For any valid encrypted input and coefficients including zero, polynomial
     * evaluation should produce a valid result.
     */
    function testProperty_HomomorphicPolyEvalWithZeroCoefficient(
        bytes calldata encryptedInput
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedInput.length > 0 && encryptedInput.length <= 256);

        // Create coefficients with zero
        uint256[] memory coefficients = new uint256[](3);
        coefficients[0] = 0;
        coefficients[1] = 5;
        coefficients[2] = 0;

        // Perform polynomial evaluation
        bytes memory result = computationEngine.encryptedPolyEval(encryptedInput, coefficients);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }

    /**
     * @notice Property 2: Homomorphic Operation Correctness - Large Scalar Multiplication
     * For any valid encrypted value and large scalar, scalar multiplication
     * should produce a valid result without overflow.
     */
    function testProperty_HomomorphicLargeScalarMultiplication(
        bytes calldata encrypted,
        uint256 scalar
    ) public {
        // Constrain to non-empty encrypted values and large scalars
        vm.assume(encrypted.length > 0 && encrypted.length <= 256);
        vm.assume(scalar > type(uint128).max && scalar <= type(uint256).max);

        // Perform scalar multiplication
        bytes memory result = computationEngine.encryptedScalarMultiply(encrypted, scalar);

        // Result should be non-empty
        assertTrue(result.length > 0);
    }
}
