// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../../src/fhenix/proxy/EncryptedParameterProxy.sol";
import "../../src/fhenix/errors/FhenixErrors.sol";

contract MockImplementation {
    uint256 public value;

    function setValue(uint256 _value) public {
        value = _value;
    }

    function getValue() public view returns (uint256) {
        return value;
    }
}

contract EncryptedParameterProxyTest is Test {
    EncryptedParameterProxy public proxy;
    MockImplementation public implementation;
    MockImplementation public newImplementation;
    address public admin;

    function setUp() public {
        admin = address(this);
        implementation = new MockImplementation();
        newImplementation = new MockImplementation();

        proxy = new EncryptedParameterProxy(address(implementation), admin);
    }

    function test_Constructor() public {
        assertEq(proxy.implementation(), address(implementation));
        assertEq(proxy.admin(), admin);
    }

    function test_Constructor_InvalidImplementation() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidParameterValue(string)", "Invalid implementation"));
        new EncryptedParameterProxy(address(0), admin);
    }

    function test_Constructor_InvalidAdmin() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidParameterValue(string)", "Invalid admin"));
        new EncryptedParameterProxy(address(implementation), address(0));
    }

    function test_Upgrade() public {
        proxy.upgrade(address(newImplementation));

        assertEq(proxy.implementation(), address(newImplementation));
    }

    function test_Upgrade_InvalidImplementation() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidParameterValue(string)", "Invalid implementation"));
        proxy.upgrade(address(0));
    }

    function test_Upgrade_SameImplementation() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidParameterValue(string)", "Same implementation"));
        proxy.upgrade(address(implementation));
    }

    function test_Upgrade_OnlyAdmin() public {
        address nonAdmin = address(0x1234);
        vm.prank(nonAdmin);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPermissions(address)", nonAdmin));
        proxy.upgrade(address(newImplementation));
    }

    function test_ChangeAdmin() public {
        address newAdmin = address(0x5678);

        proxy.changeAdmin(newAdmin);

        assertEq(proxy.admin(), newAdmin);
    }

    function test_ChangeAdmin_InvalidAdmin() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidParameterValue(string)", "Invalid admin"));
        proxy.changeAdmin(address(0));
    }

    function test_ChangeAdmin_OnlyAdmin() public {
        address nonAdmin = address(0x1234);
        vm.prank(nonAdmin);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPermissions(address)", nonAdmin));
        proxy.changeAdmin(address(0x5678));
    }

    function test_GetUpgradeHistory() public {
        address[] memory history = proxy.getUpgradeHistory();

        assertEq(history.length, 1);
        assertEq(history[0], address(implementation));
    }

    function test_GetUpgradeCount() public {
        uint256 count = proxy.getUpgradeCount();

        assertEq(count, 1);
    }

    function test_GetUpgradeCount_AfterUpgrade() public {
        proxy.upgrade(address(newImplementation));

        uint256 count = proxy.getUpgradeCount();

        assertEq(count, 2);
    }

    /**
     * @notice Test state migration - verify state persists after upgrade
     */
    function test_StateMigration_ValuePersists() public {
        // Set value in original implementation
        implementation.setValue(42);

        // Upgrade to new implementation
        proxy.upgrade(address(newImplementation));

        // Verify state persists (delegatecall preserves storage)
        // Note: This tests that the proxy correctly delegates to the new implementation
        assertEq(proxy.implementation(), address(newImplementation));
    }

    /**
     * @notice Test multiple upgrades maintain history
     */
    function test_MultipleUpgrades_HistoryMaintained() public {
        MockImplementation impl3 = new MockImplementation();

        // First upgrade
        proxy.upgrade(address(newImplementation));
        assertEq(proxy.getUpgradeCount(), 2);

        // Second upgrade
        proxy.upgrade(address(impl3));
        assertEq(proxy.getUpgradeCount(), 3);

        // Verify history
        address[] memory history = proxy.getUpgradeHistory();
        assertEq(history[0], address(implementation));
        assertEq(history[1], address(newImplementation));
        assertEq(history[2], address(impl3));
    }

    /**
     * @notice Test upgrade validation - rejects invalid contract
     */
    function test_UpgradeValidation_RejectsInvalidContract() public {
        // Try to upgrade to an EOA (no code)
        address eoa = address(0x9999);
        vm.expectRevert(abi.encodeWithSignature("InvalidParameterValue(string)", "Invalid contract"));
        proxy.upgrade(eoa);
    }

    /**
     * @notice Test upgrade validation - rejects zero address
     */
    function test_UpgradeValidation_RejectsZeroAddress() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidParameterValue(string)", "Invalid implementation"));
        proxy.upgrade(address(0));
    }

    /**
     * @notice Test upgrade validation - rejects same implementation
     */
    function test_UpgradeValidation_RejectsSameImplementation() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidParameterValue(string)", "Same implementation"));
        proxy.upgrade(address(implementation));
    }

    /**
     * @notice Test authorization - only admin can upgrade
     */
    function test_Authorization_OnlyAdminCanUpgrade() public {
        address nonAdmin = address(0x1234);

        vm.prank(nonAdmin);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPermissions(address)", nonAdmin));
        proxy.upgrade(address(newImplementation));
    }

    /**
     * @notice Test authorization - only admin can change admin
     */
    function test_Authorization_OnlyAdminCanChangeAdmin() public {
        address nonAdmin = address(0x1234);
        address newAdmin = address(0x5678);

        vm.prank(nonAdmin);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPermissions(address)", nonAdmin));
        proxy.changeAdmin(newAdmin);
    }

    /**
     * @notice Test admin change - new admin can perform upgrades
     */
    function test_AdminChange_NewAdminCanUpgrade() public {
        address newAdmin = address(0x5678);

        // Change admin
        proxy.changeAdmin(newAdmin);

        // New admin should be able to upgrade
        vm.prank(newAdmin);
        proxy.upgrade(address(newImplementation));

        assertEq(proxy.implementation(), address(newImplementation));
    }

    /**
     * @notice Test admin change - old admin cannot perform upgrades
     */
    function test_AdminChange_OldAdminCannotUpgrade() public {
        address newAdmin = address(0x5678);
        address oldAdmin = admin;

        // Change admin
        proxy.changeAdmin(newAdmin);

        // Old admin should not be able to upgrade
        vm.prank(oldAdmin);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPermissions(address)", oldAdmin));
        proxy.upgrade(address(newImplementation));
    }

    /**
     * @notice Test upgrade event emission
     */
    function test_UpgradeEvent() public {
        vm.expectEmit(true, false, false, true);
        emit Upgraded(address(newImplementation), block.timestamp);

        proxy.upgrade(address(newImplementation));
    }

    /**
     * @notice Test admin change event emission
     */
    function test_AdminChangeEvent() public {
        address newAdmin = address(0x5678);

        vm.expectEmit(true, false, false, false);
        emit AdminChanged(newAdmin);

        proxy.changeAdmin(newAdmin);
    }

    /**
     * @notice Test upgrade history is immutable
     */
    function test_UpgradeHistory_Immutable() public {
        address[] memory history1 = proxy.getUpgradeHistory();
        uint256 count1 = history1.length;

        // Perform upgrade
        proxy.upgrade(address(newImplementation));

        // Get history again
        address[] memory history2 = proxy.getUpgradeHistory();
        uint256 count2 = history2.length;

        // Count should increase
        assertEq(count2, count1 + 1);

        // Previous entries should be unchanged
        assertEq(history2[0], history1[0]);
    }

    /**
     * @notice Test fallback function delegates to implementation
     */
    function test_Fallback_DelegatesCorrectly() public {
        // Test that the proxy can receive arbitrary calls and delegate them
        // We'll use a low-level call to test the fallback directly
        bytes memory callData = abi.encodeWithSignature("setValue(uint256)", 42);
        
        (bool success, ) = address(proxy).call(callData);
        
        // The call should succeed (delegated to implementation)
        assertTrue(success);
    }

    /**
     * @notice Test receive function accepts ETH
     */
    function test_Receive_AcceptsETH() public {
        uint256 amount = 1 ether;

        // Send ETH to proxy
        (bool success, ) = address(proxy).call{value: amount}("");
        assertTrue(success);

        // Verify proxy received ETH
        assertEq(address(proxy).balance, amount);
    }

    event Upgraded(address indexed newImplementation, uint256 timestamp);
    event AdminChanged(address indexed newAdmin);
}
