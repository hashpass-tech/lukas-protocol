// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../src/fhenix/core/FhenixComputationEngine.sol";
import "../../src/fhenix/errors/FhenixErrors.sol";

contract FhenixComputationEngineTest is Test {
    FhenixComputationEngine public computationEngine;
    bytes public encryptedA;
    bytes public encryptedB;

    function setUp() public {
        computationEngine = new FhenixComputationEngine();
        encryptedA = hex"0123456789abcdef";
        encryptedB = hex"fedcba9876543210";
    }

    function test_EncryptedAdd() public {
        bytes memory result = computationEngine.encryptedAdd(encryptedA, encryptedB);

        // Result should contain both encrypted values concatenated
        assertEq(result.length, encryptedA.length + encryptedB.length);
    }

    function test_EncryptedAdd_InvalidA() public {
        vm.expectRevert(InvalidEncryptedValue.selector);
        computationEngine.encryptedAdd(hex"", encryptedB);
    }

    function test_EncryptedAdd_InvalidB() public {
        vm.expectRevert(InvalidEncryptedValue.selector);
        computationEngine.encryptedAdd(encryptedA, hex"");
    }

    function test_EncryptedScalarMultiply() public {
        bytes memory result = computationEngine.encryptedScalarMultiply(encryptedA, 5);

        // Result should be the encrypted value (placeholder implementation)
        assertEq(result, encryptedA);
    }

    function test_EncryptedScalarMultiply_InvalidEncrypted() public {
        vm.expectRevert(InvalidEncryptedValue.selector);
        computationEngine.encryptedScalarMultiply(hex"", 5);
    }

    function test_EncryptedScalarMultiply_ZeroScalar() public {
        vm.expectRevert(InvalidComputationParameters.selector);
        computationEngine.encryptedScalarMultiply(encryptedA, 0);
    }

    function test_EncryptedCompare() public {
        bytes memory result = computationEngine.encryptedCompare(encryptedA, 100);

        // Result should be a single byte (placeholder implementation)
        assertEq(result.length, 1);
        assertEq(uint8(result[0]), uint8(0x01));
    }

    function test_EncryptedCompare_InvalidEncrypted() public {
        vm.expectRevert(InvalidEncryptedValue.selector);
        computationEngine.encryptedCompare(hex"", 100);
    }

    function test_EncryptedPolyEval() public {
        uint256[] memory coefficients = new uint256[](3);
        coefficients[0] = 1;
        coefficients[1] = 2;
        coefficients[2] = 3;

        bytes memory result = computationEngine.encryptedPolyEval(encryptedA, coefficients);

        // Result should be the encrypted input (placeholder implementation)
        assertEq(result, encryptedA);
    }

    function test_EncryptedPolyEval_InvalidEncrypted() public {
        uint256[] memory coefficients = new uint256[](1);
        coefficients[0] = 1;

        vm.expectRevert(InvalidEncryptedValue.selector);
        computationEngine.encryptedPolyEval(hex"", coefficients);
    }

    function test_EncryptedPolyEval_NoCoefficients() public {
        uint256[] memory coefficients = new uint256[](0);

        vm.expectRevert(InvalidComputationParameters.selector);
        computationEngine.encryptedPolyEval(encryptedA, coefficients);
    }
}
