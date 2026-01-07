// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IEncryptedPegDeviation
 * @notice Interface for managing encrypted peg deviation sensitivity parameter
 */
interface IEncryptedPegDeviation {
    /**
     * @notice Set encrypted peg deviation sensitivity
     * @param encryptedValue The encrypted peg deviation sensitivity value
     */
    function setEncryptedPegDeviation(bytes calldata encryptedValue) external;

    /**
     * @notice Get encrypted peg deviation sensitivity
     * @return The encrypted peg deviation sensitivity value
     */
    function getEncryptedPegDeviation() external view returns (bytes memory);

    /**
     * @notice Calculate adjustment using encrypted sensitivity via homomorphic computation
     * @param pegDeviation The peg deviation value
     * @return encryptedAdjustment The encrypted adjustment result
     */
    function calculateEncryptedAdjustment(
        int256 pegDeviation
    ) external view returns (bytes memory encryptedAdjustment);

    /**
     * @notice Decrypt sensitivity for auditing (requires authorization)
     * @return The decrypted peg deviation sensitivity value
     */
    function decryptPegDeviation() external view returns (uint256);
}
