// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../src/fhenix/core/FhenixEncryptionManager.sol";
import "../../src/fhenix/core/FhenixDecryptionHandler.sol";
import "../../src/fhenix/errors/FhenixErrors.sol";

contract FhenixDecryptionHandlerTest is Test {
    FhenixEncryptionManager public encryptionManager;
    FhenixDecryptionHandler public decryptionHandler;
    address public owner;
    bytes public testPublicKey;
    bytes public encryptedValue;

    function setUp() public {
        owner = address(this);
        encryptionManager = new FhenixEncryptionManager(owner);
        decryptionHandler = new FhenixDecryptionHandler(address(encryptionManager), owner);

        testPublicKey = hex"0123456789abcdef";
        encryptedValue = hex"fedcba9876543210";

        encryptionManager.initializeEncryption(testPublicKey, 256);
    }

    function test_Decrypt_Authorized() public {
        uint256 result = decryptionHandler.decrypt(encryptedValue);

        // Should return 0 (placeholder implementation)
        assertEq(result, 0);
    }

    function test_Decrypt_InvalidEncrypted() public {
        vm.expectRevert(InvalidEncryptedValue.selector);
        decryptionHandler.decrypt(hex"");
    }

    function test_Decrypt_Unauthorized() public {
        address nonAuthorized = address(0x1234);
        vm.prank(nonAuthorized);
        vm.expectRevert(abi.encodeWithSignature("DecryptionUnauthorized(address)", nonAuthorized));
        decryptionHandler.decrypt(encryptedValue);
    }

    function test_DecryptWithThreshold() public {
        bytes[] memory signatures = new bytes[](1);
        signatures[0] = hex"0123456789abcdef";

        uint256 result = decryptionHandler.decryptWithThreshold(encryptedValue, signatures);

        // Should return 0 (placeholder implementation)
        assertEq(result, 0);
    }

    function test_DecryptWithThreshold_InvalidEncrypted() public {
        bytes[] memory signatures = new bytes[](1);
        signatures[0] = hex"0123456789abcdef";

        vm.expectRevert(InvalidEncryptedValue.selector);
        decryptionHandler.decryptWithThreshold(hex"", signatures);
    }

    function test_DecryptWithThreshold_InsufficientSignatures() public {
        decryptionHandler.setDecryptionThreshold(2);

        bytes[] memory signatures = new bytes[](1);
        signatures[0] = hex"0123456789abcdef";

        vm.expectRevert(InvalidDecryptionThreshold.selector);
        decryptionHandler.decryptWithThreshold(encryptedValue, signatures);
    }

    function test_IsDecryptionAuthorized() public {
        assertTrue(decryptionHandler.isDecryptionAuthorized(owner));

        address nonAuthorized = address(0x1234);
        assertFalse(decryptionHandler.isDecryptionAuthorized(nonAuthorized));
    }

    function test_AuthorizeDecryptor() public {
        address newDecryptor = address(0x5678);

        decryptionHandler.authorizeDecryptor(newDecryptor);

        assertTrue(decryptionHandler.isDecryptionAuthorized(newDecryptor));
    }

    function test_AuthorizeDecryptor_InvalidAddress() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidParameterValue(string)", "Invalid decryptor address"));
        decryptionHandler.authorizeDecryptor(address(0));
    }

    function test_AuthorizeDecryptor_OnlyOwner() public {
        address nonOwner = address(0x1234);
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPermissions(address)", nonOwner));
        decryptionHandler.authorizeDecryptor(address(0x5678));
    }

    function test_RevokeDecryptor() public {
        address decryptor = address(0x5678);
        decryptionHandler.authorizeDecryptor(decryptor);

        decryptionHandler.revokeDecryptor(decryptor);

        assertFalse(decryptionHandler.isDecryptionAuthorized(decryptor));
    }

    function test_SetDecryptionThreshold() public {
        decryptionHandler.setDecryptionThreshold(3);

        // Verify threshold is set by attempting to decrypt with insufficient signatures
        bytes[] memory signatures = new bytes[](2);
        signatures[0] = hex"0123456789abcdef";
        signatures[1] = hex"fedcba9876543210";

        vm.expectRevert(InvalidDecryptionThreshold.selector);
        decryptionHandler.decryptWithThreshold(encryptedValue, signatures);
    }

    function test_SetDecryptionThreshold_InvalidThreshold() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidParameterValue(string)", "Threshold must be > 0"));
        decryptionHandler.setDecryptionThreshold(0);
    }

    function test_GetDecryptionLogs() public {
        FhenixDecryptionHandler.DecryptionLog[] memory logs = decryptionHandler.getDecryptionLogs();

        assertEq(logs.length, 0);
    }

    function test_GetDecryptionLogCount() public {
        uint256 count = decryptionHandler.getDecryptionLogCount();

        assertEq(count, 0);
    }
}
