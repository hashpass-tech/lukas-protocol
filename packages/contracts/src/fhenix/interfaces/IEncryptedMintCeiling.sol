// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IEncryptedMintCeiling
 * @notice Interface for managing encrypted mint ceiling parameter
 */
interface IEncryptedMintCeiling {
    /**
     * @notice Set encrypted mint ceiling
     * @param encryptedValue The encrypted mint ceiling value
     */
    function setEncryptedMintCeiling(bytes calldata encryptedValue) external;

    /**
     * @notice Get encrypted mint ceiling
     * @return The encrypted mint ceiling value
     */
    function getEncryptedMintCeiling() external view returns (bytes memory);

    /**
     * @notice Check if current supply exceeds encrypted ceiling using homomorphic comparison
     * @param currentSupply The current token supply
     * @return True if supply is within ceiling, false otherwise
     */
    function isSupplyWithinCeiling(uint256 currentSupply) external view returns (bool);

    /**
     * @notice Decrypt mint ceiling for emergency operations (requires authorization)
     * @return The decrypted mint ceiling value
     */
    function decryptMintCeiling() external view returns (uint256);
}
