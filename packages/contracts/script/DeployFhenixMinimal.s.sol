// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/fhenix/core/FhenixEncryptionManager.sol";

/**
 * @title DeployFhenixMinimal
 * @notice Minimal deployment script - only core encryption manager
 * 
 * Usage:
 *   forge script script/DeployFhenixMinimal.s.sol:DeployFhenixMinimal \
 *     --rpc-url <RPC_URL> \
 *     --private-key <PRIVATE_KEY> \
 *     --broadcast
 */
contract DeployFhenixMinimal is Script {
    function run() public {
        vm.startBroadcast();

        console.log("=== FHENIX Minimal Deployment ===");
        console.log("Deployer:", msg.sender);
        console.log("");

        // Deploy only encryption manager
        console.log("Deploying FhenixEncryptionManager...");
        FhenixEncryptionManager encryptionManager = new FhenixEncryptionManager(msg.sender);
        console.log("Deployed at:", address(encryptionManager));

        // Initialize encryption
        bytes memory publicKey = hex"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        encryptionManager.initializeEncryption(publicKey, 192);
        console.log("Encryption initialized (192-bit)");

        vm.stopBroadcast();

        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("FhenixEncryptionManager:", address(encryptionManager));
        console.log("");
    }
}
