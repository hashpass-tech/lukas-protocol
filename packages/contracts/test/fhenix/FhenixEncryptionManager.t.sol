// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../src/fhenix/core/FhenixEncryptionManager.sol";
import "../../src/fhenix/errors/FhenixErrors.sol";

contract FhenixEncryptionManagerTest is Test {
    FhenixEncryptionManager public encryptionManager;
    address public owner;
    bytes public testPublicKey;

    function setUp() public {
        owner = address(this);
        encryptionManager = new FhenixEncryptionManager(owner);
        testPublicKey = hex"0123456789abcdef";
    }

    function test_InitializeEncryption() public {
        encryptionManager.initializeEncryption(testPublicKey, 256);

        assertTrue(encryptionManager.initialized());
        assertTrue(encryptionManager.isEncryptionActive());
        assertEq(encryptionManager.getPublicKey(), testPublicKey);
    }

    function test_InitializeEncryption_InvalidPublicKey() public {
        vm.expectRevert(InvalidPublicKey.selector);
        encryptionManager.initializeEncryption(hex"", 256);
    }

    function test_InitializeEncryption_InvalidEncryptionLevel() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidParameterValue(string)", "Invalid encryption level"));
        encryptionManager.initializeEncryption(testPublicKey, 512);
    }

    function test_InitializeEncryption_OnlyOwner() public {
        address nonOwner = address(0x1234);
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPermissions(address)", nonOwner));
        encryptionManager.initializeEncryption(testPublicKey, 256);
    }

    function test_GetPublicKey_NotInitialized() public {
        vm.expectRevert(EncryptionNotInitialized.selector);
        encryptionManager.getPublicKey();
    }

    function test_RotateKeys() public {
        encryptionManager.initializeEncryption(testPublicKey, 256);

        bytes memory newPublicKey = hex"fedcba9876543210";

        // Fast forward past key rotation interval
        vm.roll(block.number + 100001);

        encryptionManager.rotateKeys(newPublicKey);

        assertEq(encryptionManager.getPublicKey(), newPublicKey);
    }

    function test_RotateKeys_InvalidPublicKey() public {
        encryptionManager.initializeEncryption(testPublicKey, 256);

        vm.expectRevert(InvalidPublicKey.selector);
        encryptionManager.rotateKeys(hex"");
    }

    function test_RotateKeys_IntervalNotElapsed() public {
        encryptionManager.initializeEncryption(testPublicKey, 256);

        bytes memory newPublicKey = hex"fedcba9876543210";

        vm.expectRevert(abi.encodeWithSignature("KeyRotationFailed(string)", "Key rotation interval not elapsed"));
        encryptionManager.rotateKeys(newPublicKey);
    }

    function test_SetDecryptionAuthorizer() public {
        encryptionManager.initializeEncryption(testPublicKey, 256);

        address newAuthorizer = address(0x5678);
        encryptionManager.setDecryptionAuthorizer(newAuthorizer);

        EncryptionConfig memory config = encryptionManager.getEncryptionConfig();
        assertEq(config.decryptionAuthorizer, newAuthorizer);
    }

    function test_SetEmergencyDecryptEnabled() public {
        encryptionManager.initializeEncryption(testPublicKey, 256);

        encryptionManager.setEmergencyDecryptEnabled(true);

        EncryptionConfig memory config = encryptionManager.getEncryptionConfig();
        assertTrue(config.emergencyDecryptEnabled);
    }

    function test_GetEncryptionConfig() public {
        encryptionManager.initializeEncryption(testPublicKey, 256);

        EncryptionConfig memory config = encryptionManager.getEncryptionConfig();

        assertEq(config.publicKey, testPublicKey);
        assertEq(config.encryptionLevel, 256);
        assertEq(config.decryptionAuthorizer, owner);
        assertFalse(config.emergencyDecryptEnabled);
    }
}
