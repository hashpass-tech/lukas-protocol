// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../errors/FhenixErrors.sol";

/**
 * @title EncryptedParameterProxy
 * @notice Proxy pattern for independent module upgrades
 */
contract EncryptedParameterProxy {
    /// @notice Current implementation address
    address public implementation;

    /// @notice Admin address
    address public admin;

    /// @notice Upgrade history
    address[] public upgradeHistory;

    event Upgraded(address indexed newImplementation, uint256 timestamp);
    event AdminChanged(address indexed newAdmin);

    modifier onlyAdmin() {
        if (msg.sender != admin) revert InsufficientPermissions(msg.sender);
        _;
    }

    constructor(address _implementation, address _admin) {
        if (_implementation == address(0)) revert InvalidParameterValue("Invalid implementation");
        if (_admin == address(0)) revert InvalidParameterValue("Invalid admin");

        implementation = _implementation;
        admin = _admin;
        upgradeHistory.push(_implementation);
    }

    /**
     * @notice Upgrade to new implementation
     * @param newImplementation The new implementation address
     */
    function upgrade(address newImplementation) external onlyAdmin {
        if (newImplementation == address(0)) revert InvalidParameterValue("Invalid implementation");
        if (newImplementation == implementation) revert InvalidParameterValue("Same implementation");

        // Validate new implementation has required interface
        // In a real implementation, this would check for specific function signatures
        if (newImplementation.code.length == 0) revert InvalidParameterValue("Invalid contract");

        implementation = newImplementation;
        upgradeHistory.push(newImplementation);

        emit Upgraded(newImplementation, block.timestamp);
    }

    /**
     * @notice Change admin address
     * @param newAdmin The new admin address
     */
    function changeAdmin(address newAdmin) external onlyAdmin {
        if (newAdmin == address(0)) revert InvalidParameterValue("Invalid admin");
        admin = newAdmin;
        emit AdminChanged(newAdmin);
    }

    /**
     * @notice Get upgrade history
     * @return Array of all implementation addresses
     */
    function getUpgradeHistory() external view returns (address[] memory) {
        return upgradeHistory;
    }

    /**
     * @notice Get upgrade history length
     * @return The number of upgrades
     */
    function getUpgradeCount() external view returns (uint256) {
        return upgradeHistory.length;
    }

    /**
     * @notice Fallback function to delegate calls to implementation
     */
    fallback() external payable {
        address impl = implementation;
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), impl, ptr, calldatasize(), 0, 0)
            returndatacopy(ptr, 0, returndatasize())
            switch result
            case 0 {
                revert(ptr, returndatasize())
            }
            default {
                return(ptr, returndatasize())
            }
        }
    }

    /**
     * @notice Receive function to accept ETH
     */
    receive() external payable {}
}
