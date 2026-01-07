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
}
