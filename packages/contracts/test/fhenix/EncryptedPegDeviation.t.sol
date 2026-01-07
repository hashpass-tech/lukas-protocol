// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../src/fhenix/core/FhenixEncryptionManager.sol";
import "../../src/fhenix/core/EncryptedPegDeviation.sol";
import "../../src/fhenix/errors/FhenixErrors.sol";

contract EncryptedPegDeviationTest is Test {
    FhenixEncryptionManager public encryptionManager;
    EncryptedPegDeviation public encryptedPegDeviation;
    address public owner;
    bytes public testPublicKey;
    bytes public encryptedDeviationValue;

    function setUp() public {
        owner = address(this);
        encryptionManager = new FhenixEncryptionManager(owner);
        encryptedPegDeviation = new EncryptedPegDeviation(address(encryptionManager), owner);

        testPublicKey = hex"0123456789abcdef";
        encryptedDeviationValue = hex"fedcba9876543210";

        encryptionManager.initializeEncryption(testPublicKey, 256);
    }

    function test_SetEncryptedPegDeviation() public {
        encryptedPegDeviation.setEncryptedPegDeviation(encryptedDeviationValue);

        assertEq(encryptedPegDeviation.getEncryptedPegDeviation(), encryptedDeviationValue);
    }

    function test_SetEncryptedPegDeviation_InvalidValue() public {
        vm.expectRevert(InvalidEncryptedValue.selector);
        encryptedPegDeviation.setEncryptedPegDeviation(hex"");
    }

    function test_SetEncryptedPegDeviation_OnlyOwner() public {
        address nonOwner = address(0x1234);
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPermissions(address)", nonOwner));
        encryptedPegDeviation.setEncryptedPegDeviation(encryptedDeviationValue);
    }

    function test_GetEncryptedPegDeviation_NotActive() public {
        vm.expectRevert(ParameterNotActive.selector);
        encryptedPegDeviation.getEncryptedPegDeviation();
    }

    function test_CalculateEncryptedAdjustment() public {
        encryptedPegDeviation.setEncryptedPegDeviation(encryptedDeviationValue);

        bytes memory result = encryptedPegDeviation.calculateEncryptedAdjustment(100);

        // Should return the encrypted deviation value (placeholder implementation)
        assertEq(result, encryptedDeviationValue);
    }

    function test_CalculateEncryptedAdjustment_NotActive() public {
        vm.expectRevert(ParameterNotActive.selector);
        encryptedPegDeviation.calculateEncryptedAdjustment(100);
    }

    function test_DecryptPegDeviation() public {
        encryptedPegDeviation.setEncryptedPegDeviation(encryptedDeviationValue);

        // Should return 0 (placeholder implementation)
        uint256 result = encryptedPegDeviation.decryptPegDeviation();
        assertEq(result, 0);
    }

    function test_DecryptPegDeviation_Unauthorized() public {
        encryptedPegDeviation.setEncryptedPegDeviation(encryptedDeviationValue);

        address nonOwner = address(0x1234);
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("DecryptionUnauthorized(address)", nonOwner));
        encryptedPegDeviation.decryptPegDeviation();
    }

    function test_DecryptPegDeviation_NotActive() public {
        vm.expectRevert(ParameterNotActive.selector);
        encryptedPegDeviation.decryptPegDeviation();
    }

    function test_DeactivateDeviation() public {
        encryptedPegDeviation.setEncryptedPegDeviation(encryptedDeviationValue);

        encryptedPegDeviation.deactivateDeviation();

        vm.expectRevert(ParameterNotActive.selector);
        encryptedPegDeviation.getEncryptedPegDeviation();
    }
}
