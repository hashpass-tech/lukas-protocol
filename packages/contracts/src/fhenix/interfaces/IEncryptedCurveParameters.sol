// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IEncryptedCurveParameters
 * @notice Interface for managing encrypted stabilization curve parameters
 */
interface IEncryptedCurveParameters {
    /**
     * @notice Set encrypted curve parameters (coefficients)
     * @param encryptedCoefficients Array of encrypted polynomial coefficients
     */
    function setEncryptedCurveParameters(bytes[] calldata encryptedCoefficients) external;

    /**
     * @notice Get encrypted curve parameters
     * @return Array of encrypted polynomial coefficients
     */
    function getEncryptedCurveParameters() external view returns (bytes[] memory);

    /**
     * @notice Evaluate curve using encrypted parameters via homomorphic polynomial evaluation
     * @param input The input value for polynomial evaluation
     * @return encryptedOutput The encrypted polynomial evaluation result
     */
    function evaluateEncryptedCurve(
        uint256 input
    ) external view returns (bytes memory encryptedOutput);

    /**
     * @notice Decrypt parameters for auditing (requires authorization)
     * @return Array of decrypted polynomial coefficients
     */
    function decryptCurveParameters() external view returns (uint256[] memory);
}
