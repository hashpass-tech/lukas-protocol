// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IFhenixDecryptionHandler
 * @notice Interface for managing decryption operations with authorization
 */
interface IFhenixDecryptionHandler {
    /**
     * @notice Decrypt value (requires authorization)
     * @param encryptedValue The encrypted value to decrypt
     * @return The decrypted plaintext value
     */
    function decrypt(bytes calldata encryptedValue) external view returns (uint256);

    /**
     * @notice Decrypt with threshold signature (for multi-sig scenarios)
     * @param encryptedValue The encrypted value to decrypt
     * @param signatures Array of signatures from authorized parties
     * @return The decrypted plaintext value
     */
    function decryptWithThreshold(
        bytes calldata encryptedValue,
        bytes[] calldata signatures
    ) external view returns (uint256);

    /**
     * @notice Check if decryption is authorized for caller
     * @param caller The address to check authorization for
     * @return True if caller is authorized to decrypt
     */
    function isDecryptionAuthorized(address caller) external view returns (bool);
}
