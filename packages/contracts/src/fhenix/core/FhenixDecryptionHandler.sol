// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IFhenixDecryptionHandler.sol";
import "../interfaces/IFhenixEncryptionManager.sol";
import "../errors/FhenixErrors.sol";

/**
 * @title FhenixDecryptionHandler
 * @notice Manages decryption operations with authorization
 */
contract FhenixDecryptionHandler is IFhenixDecryptionHandler {
    /// @notice Reference to encryption manager
    IFhenixEncryptionManager public encryptionManager;

    /// @notice Authorized decryption addresses
    mapping(address => bool) public authorizedDecryptors;

    /// @notice Owner/admin address
    address public owner;

    /// @notice Threshold for multi-sig decryption
    uint256 public decryptionThreshold;

    /// @notice Audit log of decryption events
    struct DecryptionLog {
        address decryptor;
        uint256 timestamp;
        bool success;
    }

    DecryptionLog[] public decryptionLogs;

    event DecryptorAuthorized(address indexed decryptor);
    event DecryptorRevoked(address indexed decryptor);
    event DecryptionAttempted(address indexed decryptor, bool success, uint256 timestamp);
    event ThresholdUpdated(uint256 newThreshold);

    modifier onlyOwner() {
        if (msg.sender != owner) revert InsufficientPermissions(msg.sender);
        _;
    }

    modifier onlyAuthorized() {
        if (!authorizedDecryptors[msg.sender]) revert DecryptionUnauthorized(msg.sender);
        _;
    }

    modifier onlyEncryptionActive() {
        if (!encryptionManager.isEncryptionActive()) revert EncryptionNotInitialized();
        _;
    }

    constructor(address _encryptionManager, address _owner) {
        if (_encryptionManager == address(0)) revert InvalidParameterValue("Invalid encryption manager");
        encryptionManager = IFhenixEncryptionManager(_encryptionManager);
        owner = _owner;
        decryptionThreshold = 1;

        // Owner is authorized by default
        authorizedDecryptors[_owner] = true;
    }

    /**
     * @notice Decrypt value (requires authorization)
     * @param encryptedValue The encrypted value to decrypt
     * @return The decrypted plaintext value
     */
    function decrypt(bytes calldata encryptedValue) external view onlyAuthorized onlyEncryptionActive returns (uint256) {
        if (encryptedValue.length == 0) revert InvalidEncryptedValue();

        // In a real implementation, this would call FHENIX decryption
        // For now, we return a placeholder value
        return 0;
    }

    /**
     * @notice Decrypt with threshold signature (for multi-sig scenarios)
     * @param encryptedValue The encrypted value to decrypt
     * @param signatures Array of signatures from authorized parties
     * @return The decrypted plaintext value
     */
    function decryptWithThreshold(bytes calldata encryptedValue, bytes[] calldata signatures)
        external
        view
        onlyEncryptionActive
        returns (uint256)
    {
        if (encryptedValue.length == 0) revert InvalidEncryptedValue();
        if (signatures.length < decryptionThreshold) revert InvalidDecryptionThreshold();

        // In a real implementation, this would verify signatures and perform threshold decryption
        // For now, we return a placeholder value
        return 0;
    }

    /**
     * @notice Check if decryption is authorized for caller
     * @param caller The address to check authorization for
     * @return True if caller is authorized to decrypt
     */
    function isDecryptionAuthorized(address caller) external view returns (bool) {
        return authorizedDecryptors[caller];
    }

    /**
     * @notice Authorize an address for decryption
     * @param decryptor The address to authorize
     */
    function authorizeDecryptor(address decryptor) external onlyOwner {
        if (decryptor == address(0)) revert InvalidParameterValue("Invalid decryptor address");
        authorizedDecryptors[decryptor] = true;
        emit DecryptorAuthorized(decryptor);
    }

    /**
     * @notice Revoke decryption authorization
     * @param decryptor The address to revoke
     */
    function revokeDecryptor(address decryptor) external onlyOwner {
        authorizedDecryptors[decryptor] = false;
        emit DecryptorRevoked(decryptor);
    }

    /**
     * @notice Set decryption threshold for multi-sig
     * @param threshold The new threshold
     */
    function setDecryptionThreshold(uint256 threshold) external onlyOwner {
        if (threshold == 0) revert InvalidParameterValue("Threshold must be > 0");
        decryptionThreshold = threshold;
        emit ThresholdUpdated(threshold);
    }

    /**
     * @notice Get decryption logs
     * @return Array of decryption log entries
     */
    function getDecryptionLogs() external view returns (DecryptionLog[] memory) {
        return decryptionLogs;
    }

    /**
     * @notice Get number of decryption attempts
     * @return The number of decryption log entries
     */
    function getDecryptionLogCount() external view returns (uint256) {
        return decryptionLogs.length;
    }
}
