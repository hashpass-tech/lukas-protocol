// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../src/fhenix/core/FhenixEncryptionManager.sol";
import "../../src/fhenix/core/EncryptedMintCeiling.sol";
import "../../src/fhenix/errors/FhenixErrors.sol";

contract EncryptedMintCeilingTest is Test {
    FhenixEncryptionManager public encryptionManager;
    EncryptedMintCeiling public encryptedMintCeiling;
    address public owner;
    bytes public testPublicKey;
    bytes public encryptedCeilingValue;

    function setUp() public {
        owner = address(this);
        encryptionManager = new FhenixEncryptionManager(owner);
        encryptedMintCeiling = new EncryptedMintCeiling(address(encryptionManager), owner);

        testPublicKey = hex"0123456789abcdef";
        encryptedCeilingValue = hex"fedcba9876543210";

        encryptionManager.initializeEncryption(testPublicKey, 256);
    }

    function test_SetEncryptedMintCeiling() public {
        encryptedMintCeiling.setEncryptedMintCeiling(encryptedCeilingValue);

        assertEq(encryptedMintCeiling.getEncryptedMintCeiling(), encryptedCeilingValue);
    }

    function test_SetEncryptedMintCeiling_InvalidValue() public {
        vm.expectRevert(InvalidEncryptedValue.selector);
        encryptedMintCeiling.setEncryptedMintCeiling(hex"");
    }

    function test_SetEncryptedMintCeiling_OnlyOwner() public {
        address nonOwner = address(0x1234);
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPermissions(address)", nonOwner));
        encryptedMintCeiling.setEncryptedMintCeiling(encryptedCeilingValue);
    }

    function test_GetEncryptedMintCeiling_NotActive() public {
        vm.expectRevert(ParameterNotActive.selector);
        encryptedMintCeiling.getEncryptedMintCeiling();
    }

    function test_IsSupplyWithinCeiling() public {
        encryptedMintCeiling.setEncryptedMintCeiling(encryptedCeilingValue);

        // Should return true (placeholder implementation)
        assertTrue(encryptedMintCeiling.isSupplyWithinCeiling(1000000));
    }

    function test_IsSupplyWithinCeiling_NotActive() public {
        vm.expectRevert(ParameterNotActive.selector);
        encryptedMintCeiling.isSupplyWithinCeiling(1000000);
    }

    function test_DecryptMintCeiling() public {
        encryptedMintCeiling.setEncryptedMintCeiling(encryptedCeilingValue);

        // Should return 0 (placeholder implementation)
        uint256 result = encryptedMintCeiling.decryptMintCeiling();
        assertEq(result, 0);
    }

    function test_DecryptMintCeiling_Unauthorized() public {
        encryptedMintCeiling.setEncryptedMintCeiling(encryptedCeilingValue);

        address nonOwner = address(0x1234);
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("DecryptionUnauthorized(address)", nonOwner));
        encryptedMintCeiling.decryptMintCeiling();
    }

    function test_DecryptMintCeiling_NotActive() public {
        vm.expectRevert(ParameterNotActive.selector);
        encryptedMintCeiling.decryptMintCeiling();
    }

    function test_DeactivateCeiling() public {
        encryptedMintCeiling.setEncryptedMintCeiling(encryptedCeilingValue);

        encryptedMintCeiling.deactivateCeiling();

        vm.expectRevert(ParameterNotActive.selector);
        encryptedMintCeiling.getEncryptedMintCeiling();
    }
}
