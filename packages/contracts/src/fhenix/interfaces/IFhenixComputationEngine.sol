// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IFhenixComputationEngine
 * @notice Interface for performing homomorphic operations on encrypted data
 */
interface IFhenixComputationEngine {
    /**
     * @notice Add two encrypted values
     * @param a First encrypted value
     * @param b Second encrypted value
     * @return The encrypted sum of a and b
     */
    function encryptedAdd(
        bytes calldata a,
        bytes calldata b
    ) external pure returns (bytes memory);

    /**
     * @notice Multiply encrypted value by plaintext scalar
     * @param encrypted The encrypted value
     * @param scalar The plaintext scalar multiplier
     * @return The encrypted product
     */
    function encryptedScalarMultiply(
        bytes calldata encrypted,
        uint256 scalar
    ) external pure returns (bytes memory);

    /**
     * @notice Compare encrypted value with plaintext threshold
     * @param encrypted The encrypted value
     * @param plaintext The plaintext value to compare against
     * @return The encrypted comparison result (encrypted boolean)
     */
    function encryptedCompare(
        bytes calldata encrypted,
        uint256 plaintext
    ) external pure returns (bytes memory);

    /**
     * @notice Evaluate polynomial on encrypted input
     * @param encryptedInput The encrypted input value
     * @param coefficients Array of plaintext polynomial coefficients
     * @return The encrypted polynomial evaluation result
     */
    function encryptedPolyEval(
        bytes calldata encryptedInput,
        uint256[] calldata coefficients
    ) external pure returns (bytes memory);
}
