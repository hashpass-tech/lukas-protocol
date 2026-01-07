// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../src/fhenix/core/FhenixEncryptionManager.sol";
import "../../src/fhenix/core/EncryptedCurveParameters.sol";
import "../../src/fhenix/errors/FhenixErrors.sol";

contract EncryptedCurveParametersTest is Test {
    FhenixEncryptionManager public encryptionManager;
    EncryptedCurveParameters public encryptedCurveParameters;
    address public owner;
    bytes public testPublicKey;
    bytes[] public encryptedCoefficients;

    function setUp() public {
        owner = address(this);
        encryptionManager = new FhenixEncryptionManager(owner);
        encryptedCurveParameters = new EncryptedCurveParameters(address(encryptionManager), owner);

        testPublicKey = hex"0123456789abcdef";

        encryptedCoefficients.push(hex"0011223344556677");
        encryptedCoefficients.push(hex"8899aabbccddeeff");
        encryptedCoefficients.push(hex"ffeeddccbbaa9988");

        encryptionManager.initializeEncryption(testPublicKey, 256);
    }

    function test_SetEncryptedCurveParameters() public {
        encryptedCurveParameters.setEncryptedCurveParameters(encryptedCoefficients);

        assertTrue(encryptedCurveParameters.isActive());
        assertEq(encryptedCurveParameters.getCoefficientCount(), 3);
    }

    function test_SetEncryptedCurveParameters_EmptyArray() public {
        bytes[] memory empty = new bytes[](0);
        vm.expectRevert(abi.encodeWithSignature("InvalidParameterValue(string)", "No coefficients provided"));
        encryptedCurveParameters.setEncryptedCurveParameters(empty);
    }

    function test_SetEncryptedCurveParameters_InvalidCoefficient() public {
        bytes[] memory invalid = new bytes[](1);
        invalid[0] = hex"";

        vm.expectRevert(InvalidEncryptedValue.selector);
        encryptedCurveParameters.setEncryptedCurveParameters(invalid);
    }

    function test_SetEncryptedCurveParameters_OnlyOwner() public {
        address nonOwner = address(0x1234);
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPermissions(address)", nonOwner));
        encryptedCurveParameters.setEncryptedCurveParameters(encryptedCoefficients);
    }

    function test_GetEncryptedCurveParameters() public {
        encryptedCurveParameters.setEncryptedCurveParameters(encryptedCoefficients);

        bytes[] memory result = encryptedCurveParameters.getEncryptedCurveParameters();

        assertEq(result.length, 3);
        assertEq(result[0], encryptedCoefficients[0]);
        assertEq(result[1], encryptedCoefficients[1]);
        assertEq(result[2], encryptedCoefficients[2]);
    }

    function test_GetEncryptedCurveParameters_NotActive() public {
        vm.expectRevert(ParameterNotActive.selector);
        encryptedCurveParameters.getEncryptedCurveParameters();
    }

    function test_EvaluateEncryptedCurve() public {
        encryptedCurveParameters.setEncryptedCurveParameters(encryptedCoefficients);

        bytes memory result = encryptedCurveParameters.evaluateEncryptedCurve(100);

        // Should return first coefficient (placeholder implementation)
        assertEq(result, encryptedCoefficients[0]);
    }

    function test_EvaluateEncryptedCurve_NotActive() public {
        vm.expectRevert(ParameterNotActive.selector);
        encryptedCurveParameters.evaluateEncryptedCurve(100);
    }

    function test_DecryptCurveParameters() public {
        encryptedCurveParameters.setEncryptedCurveParameters(encryptedCoefficients);

        uint256[] memory result = encryptedCurveParameters.decryptCurveParameters();

        // Should return array of same length (placeholder implementation)
        assertEq(result.length, 3);
    }

    function test_DecryptCurveParameters_Unauthorized() public {
        encryptedCurveParameters.setEncryptedCurveParameters(encryptedCoefficients);

        address nonOwner = address(0x1234);
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("DecryptionUnauthorized(address)", nonOwner));
        encryptedCurveParameters.decryptCurveParameters();
    }

    function test_DecryptCurveParameters_NotActive() public {
        vm.expectRevert(ParameterNotActive.selector);
        encryptedCurveParameters.decryptCurveParameters();
    }

    function test_DeactivateParameters() public {
        encryptedCurveParameters.setEncryptedCurveParameters(encryptedCoefficients);

        encryptedCurveParameters.deactivateParameters();

        assertFalse(encryptedCurveParameters.isActive());
    }
}
