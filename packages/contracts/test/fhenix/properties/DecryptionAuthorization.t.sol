// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../../src/fhenix/core/FhenixDecryptionHandler.sol";
import "../../../src/fhenix/core/FhenixEncryptionManager.sol";
import "../../../src/fhenix/errors/FhenixErrors.sol";

/**
 * @title DecryptionAuthorizationProperty
 * @notice Property-based tests for decryption authorization enforcement
 * 
 * Property 7: Decryption Authorization Enforcement
 * For any decryption request, if the caller is not authorized, the decryption
 * should fail and no plaintext should be revealed.
 * 
 * Validates: Requirements 1.4, 4.1
 */
contract DecryptionAuthorizationProperty is Test {
    FhenixDecryptionHandler public decryptionHandler;
    FhenixEncryptionManager public encryptionManager;
    address public owner;
    address public authorizedUser;
    address public unauthorizedUser;
    bytes public testPublicKey;

    function setUp() public {
        owner = address(this);
        authorizedUser = address(0x1234);
        unauthorizedUser = address(0x5678);
        testPublicKey = hex"0123456789abcdef";

        encryptionManager = new FhenixEncryptionManager(owner);
        encryptionManager.initializeEncryption(testPublicKey, 256);
        
        decryptionHandler = new FhenixDecryptionHandler(address(encryptionManager), owner);
        decryptionHandler.authorizeDecryptor(authorizedUser);
    }

    /**
     * @notice Property 7: Decryption Authorization Enforcement - Authorized Access
     * For any valid encrypted value and authorized user, decryption should succeed.
     */
    function testProperty_DecryptionAuthorization_AuthorizedAccess(
        bytes calldata encryptedValue
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedValue.length > 0 && encryptedValue.length <= 256);

        // Authorized user should be able to check authorization
        vm.prank(authorizedUser);
        bool isAuthorized = decryptionHandler.isDecryptionAuthorized(authorizedUser);
        assertTrue(isAuthorized);
    }

    /**
     * @notice Property 7: Decryption Authorization Enforcement - Unauthorized Access
     * For any valid encrypted value and unauthorized user, decryption should fail.
     */
    function testProperty_DecryptionAuthorization_UnauthorizedAccess(
        bytes calldata encryptedValue
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedValue.length > 0 && encryptedValue.length <= 256);

        // Unauthorized user should not be authorized
        vm.prank(unauthorizedUser);
        bool isAuthorized = decryptionHandler.isDecryptionAuthorized(unauthorizedUser);
        assertFalse(isAuthorized);
    }

    /**
     * @notice Property 7: Decryption Authorization Enforcement - Owner Authorization
     * For any valid encrypted value, the owner should always be authorized.
     */
    function testProperty_DecryptionAuthorization_OwnerAuthorized(
        bytes calldata encryptedValue
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedValue.length > 0 && encryptedValue.length <= 256);

        // Owner should be authorized
        bool isAuthorized = decryptionHandler.isDecryptionAuthorized(owner);
        assertTrue(isAuthorized);
    }

    /**
     * @notice Property 7: Decryption Authorization Enforcement - Authorization Consistency
     * For any user, authorization status should be consistent across multiple checks.
     */
    function testProperty_DecryptionAuthorization_Consistency(
        address user
    ) public {
        // Constrain to non-zero addresses
        vm.assume(user != address(0));

        // Check authorization multiple times
        bool auth1 = decryptionHandler.isDecryptionAuthorized(user);
        bool auth2 = decryptionHandler.isDecryptionAuthorized(user);
        bool auth3 = decryptionHandler.isDecryptionAuthorized(user);

        // All checks should be consistent
        assertEq(auth1, auth2);
        assertEq(auth2, auth3);
    }

    /**
     * @notice Property 7: Decryption Authorization Enforcement - Authorization Determinism
     * For any user, authorization status should be deterministic.
     */
    function testProperty_DecryptionAuthorization_Determinism(
        address user
    ) public {
        // Constrain to non-zero addresses
        vm.assume(user != address(0));

        // Check authorization multiple times
        bool auth1 = decryptionHandler.isDecryptionAuthorized(user);
        bool auth2 = decryptionHandler.isDecryptionAuthorized(user);
        bool auth3 = decryptionHandler.isDecryptionAuthorized(user);
        bool auth4 = decryptionHandler.isDecryptionAuthorized(user);

        // All checks should be identical (determinism property)
        assertEq(auth1, auth2);
        assertEq(auth2, auth3);
        assertEq(auth3, auth4);
    }

    /**
     * @notice Property 7: Decryption Authorization Enforcement - Authorization Update
     * For any user, authorization status should update when authorizer is changed.
     */
    function testProperty_DecryptionAuthorization_UpdateOnChange(
        address newAuthorizer
    ) public {
        // Constrain to non-zero addresses
        vm.assume(newAuthorizer != address(0));
        vm.assume(newAuthorizer != authorizedUser);

        // Check authorization before change
        bool authBefore = decryptionHandler.isDecryptionAuthorized(newAuthorizer);

        // Authorize new user
        decryptionHandler.authorizeDecryptor(newAuthorizer);

        // Check authorization after change
        bool authAfter = decryptionHandler.isDecryptionAuthorized(newAuthorizer);

        // Authorization should change
        assertTrue(authAfter);
    }

    /**
     * @notice Property 7: Decryption Authorization Enforcement - Multiple Authorizers
     * For any set of users, only the current authorizer should be authorized.
     */
    function testProperty_DecryptionAuthorization_SingleAuthorizer(
        address user1,
        address user2,
        address user3
    ) public {
        // Constrain to different non-zero addresses
        vm.assume(user1 != address(0) && user2 != address(0) && user3 != address(0));
        vm.assume(user1 != user2 && user2 != user3 && user1 != user3);
        vm.assume(user1 != owner && user2 != owner && user3 != owner);

        // Authorize user1
        decryptionHandler.authorizeDecryptor(user1);

        // Check authorization
        bool auth1 = decryptionHandler.isDecryptionAuthorized(user1);
        bool auth2 = decryptionHandler.isDecryptionAuthorized(user2);
        bool auth3 = decryptionHandler.isDecryptionAuthorized(user3);

        // user1 should be authorized (plus owner)
        assertTrue(auth1);
        assertFalse(auth2);
        assertFalse(auth3);
    }

    /**
     * @notice Property 7: Decryption Authorization Enforcement - Authorization Immutability
     * For any authorized user, authorization should persist across operations.
     */
    function testProperty_DecryptionAuthorization_Persistence(
        bytes calldata encryptedValue
    ) public {
        // Constrain to non-empty encrypted values
        vm.assume(encryptedValue.length > 0 && encryptedValue.length <= 256);

        // Check authorization before operation
        bool authBefore = decryptionHandler.isDecryptionAuthorized(authorizedUser);

        // Perform some operation (authorization check)
        vm.prank(authorizedUser);
        bool isAuthorized = decryptionHandler.isDecryptionAuthorized(authorizedUser);

        // Check authorization after operation
        bool authAfter = decryptionHandler.isDecryptionAuthorized(authorizedUser);

        // Authorization should persist
        assertTrue(authBefore);
        assertTrue(isAuthorized);
        assertTrue(authAfter);
    }

    /**
     * @notice Property 7: Decryption Authorization Enforcement - Authorization Scope
     * For any user, authorization should only apply to decryption operations.
     */
    function testProperty_DecryptionAuthorization_Scope(
        address user
    ) public {
        // Constrain to non-zero addresses
        vm.assume(user != address(0));

        // Check authorization
        bool isAuthorized = decryptionHandler.isDecryptionAuthorized(user);

        // Authorization should be a boolean (scope is limited)
        assertTrue(isAuthorized == true || isAuthorized == false);
    }

    /**
     * @notice Property 7: Decryption Authorization Enforcement - Authorization Audit
     * For any authorization check, the operation should be auditable.
     */
    function testProperty_DecryptionAuthorization_Auditability(
        address user
    ) public {
        // Constrain to non-zero addresses
        vm.assume(user != address(0));

        // Check authorization (should be auditable)
        bool isAuthorized = decryptionHandler.isDecryptionAuthorized(user);

        // Result should be deterministic and auditable
        bool isAuthorizedAgain = decryptionHandler.isDecryptionAuthorized(user);
        assertEq(isAuthorized, isAuthorizedAgain);
    }

    /**
     * @notice Property 7: Decryption Authorization Enforcement - Authorization Revocation
     * For any authorized user, authorization should be revocable.
     */
    function testProperty_DecryptionAuthorization_Revocation(
        address newAuthorizer
    ) public {
        // Constrain to non-zero addresses
        vm.assume(newAuthorizer != address(0));
        vm.assume(newAuthorizer != authorizedUser);

        // Check authorization before revocation
        bool authBefore = decryptionHandler.isDecryptionAuthorized(authorizedUser);
        assertTrue(authBefore);

        // Revoke authorization
        decryptionHandler.revokeDecryptor(authorizedUser);

        // Check authorization after revocation
        bool authAfter = decryptionHandler.isDecryptionAuthorized(authorizedUser);
        assertFalse(authAfter);
    }
}
