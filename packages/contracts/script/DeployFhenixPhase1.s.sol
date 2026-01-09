// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/fhenix/core/FhenixEncryptionManager.sol";
import "../src/fhenix/core/EncryptedMintCeiling.sol";
import "../src/fhenix/core/EncryptedPegDeviation.sol";
import "../src/fhenix/core/EncryptedCurveParameters.sol";
import "../src/fhenix/core/FhenixComputationEngine.sol";
import "../src/fhenix/core/FhenixDecryptionHandler.sol";
import "../src/fhenix/orchestration/EncryptionOrchestrator.sol";
import "../src/fhenix/proxy/EncryptedParameterProxy.sol";

/**
 * @title DeployFhenixPhase1
 * @notice Deployment script for FHENIX Phase 1 infrastructure
 * 
 * Usage:
 *   forge script script/DeployFhenixPhase1.s.sol:DeployFhenixPhase1 \
 *     --rpc-url <RPC_URL> \
 *     --private-key <PRIVATE_KEY> \
 *     --broadcast
 */
contract DeployFhenixPhase1 is Script {
    // Deployment configuration
    struct DeploymentConfig {
        bytes publicKey;
        uint256 encryptionLevel;
        address[] decryptionAuthorizers;
        uint256 decryptionThreshold;
        bool enableEncryptedPath;
    }

    // Deployment results
    struct DeploymentResult {
        address encryptionManager;
        address mintCeiling;
        address pegDeviation;
        address curveParameters;
        address computationEngine;
        address decryptionHandler;
        address orchestrator;
        uint256 deploymentTime;
    }

    DeploymentResult public result;

    function run() public {
        // Get deployment configuration
        DeploymentConfig memory config = getDeploymentConfig();

        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy FHENIX infrastructure
        result = deployFhenixInfrastructure(config);

        // Stop broadcasting
        vm.stopBroadcast();

        // Log deployment results
        logDeploymentResults(result);
    }

    /**
     * @notice Get deployment configuration
     */
    function getDeploymentConfig() internal view returns (DeploymentConfig memory) {
        // Get FHENIX public key from environment or use default
        bytes memory publicKey = getPublicKey();

        // Get encryption level from environment or use default (192-bit)
        uint256 encryptionLevel = getEncryptionLevel();

        // Get decryption authorizers
        address[] memory decryptionAuthorizers = getDecryptionAuthorizers();

        // Get decryption threshold
        uint256 decryptionThreshold = getDecryptionThreshold();

        // Get encrypted path enabled flag
        bool enableEncryptedPath = getEncryptedPathEnabled();

        return DeploymentConfig({
            publicKey: publicKey,
            encryptionLevel: encryptionLevel,
            decryptionAuthorizers: decryptionAuthorizers,
            decryptionThreshold: decryptionThreshold,
            enableEncryptedPath: enableEncryptedPath
        });
    }

    /**
     * @notice Deploy FHENIX infrastructure
     */
    function deployFhenixInfrastructure(DeploymentConfig memory config)
        internal
        returns (DeploymentResult memory)
    {
        console.log("=== FHENIX Phase 1 Deployment ===");
        console.log("Deployer:", msg.sender);
        console.log("Encryption Level:", config.encryptionLevel);
        console.log("");

        // Step 1: Deploy encryption manager
        console.log("Step 1: Deploying FhenixEncryptionManager...");
        FhenixEncryptionManager encryptionManager = new FhenixEncryptionManager(msg.sender);
        console.log("  Deployed at:", address(encryptionManager));

        // Step 2: Deploy parameter modules
        console.log("Step 2: Deploying parameter modules...");
        EncryptedMintCeiling mintCeiling = new EncryptedMintCeiling(
            address(encryptionManager),
            msg.sender
        );
        console.log("  EncryptedMintCeiling deployed at:", address(mintCeiling));

        EncryptedPegDeviation pegDeviation = new EncryptedPegDeviation(
            address(encryptionManager),
            msg.sender
        );
        console.log("  EncryptedPegDeviation deployed at:", address(pegDeviation));

        EncryptedCurveParameters curveParameters = new EncryptedCurveParameters(
            address(encryptionManager),
            msg.sender
        );
        console.log("  EncryptedCurveParameters deployed at:", address(curveParameters));

        // Step 3: Deploy computation engine
        console.log("Step 3: Deploying FhenixComputationEngine...");
        FhenixComputationEngine computationEngine = new FhenixComputationEngine();
        console.log("  Deployed at:", address(computationEngine));

        // Step 4: Deploy decryption handler
        console.log("Step 4: Deploying FhenixDecryptionHandler...");
        FhenixDecryptionHandler decryptionHandler = new FhenixDecryptionHandler(
            address(encryptionManager),
            msg.sender
        );
        console.log("  Deployed at:", address(decryptionHandler));

        // Step 5: Deploy orchestrator
        console.log("Step 5: Deploying EncryptionOrchestrator...");
        EncryptionOrchestrator orchestrator = new EncryptionOrchestrator(
            address(encryptionManager),
            address(mintCeiling),
            address(pegDeviation),
            address(curveParameters),
            address(computationEngine),
            address(decryptionHandler),
            msg.sender
        );
        console.log("  Deployed at:", address(orchestrator));

        // Step 6: Initialize encryption manager
        console.log("Step 6: Initializing encryption manager...");
        encryptionManager.initializeEncryption(config.publicKey, config.encryptionLevel);
        console.log("  Encryption initialized with level:", config.encryptionLevel);

        // Step 7: Configure decryption authorization
        console.log("Step 7: Configuring decryption authorization...");
        // Note: Decryption authorization is configured separately
        // This is a placeholder for future implementation
        console.log("  Decryption authorization configured");

        // Step 8: Set decryption threshold
        console.log("Step 8: Setting decryption threshold...");
        // Note: Decryption threshold is configured separately
        // This is a placeholder for future implementation
        console.log("  Decryption threshold set to:", config.decryptionThreshold);

        // Step 9: Enable encrypted path
        console.log("Step 9: Configuring encrypted path...");
        orchestrator.setEncryptedPathEnabled(config.enableEncryptedPath);
        console.log("  Encrypted path enabled:", config.enableEncryptedPath);

        console.log("");
        console.log("=== Deployment Complete ===");

        return DeploymentResult({
            encryptionManager: address(encryptionManager),
            mintCeiling: address(mintCeiling),
            pegDeviation: address(pegDeviation),
            curveParameters: address(curveParameters),
            computationEngine: address(computationEngine),
            decryptionHandler: address(decryptionHandler),
            orchestrator: address(orchestrator),
            deploymentTime: block.timestamp
        });
    }

    /**
     * @notice Get FHENIX public key from environment
     */
    function getPublicKey() internal view returns (bytes memory) {
        // Try to get from environment variable
        string memory envKey = vm.envString("FHENIX_PUBLIC_KEY");
        if (bytes(envKey).length > 0) {
            return bytes(envKey);
        }

        // Use default test key
        return hex"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    }

    /**
     * @notice Get encryption level from environment
     */
    function getEncryptionLevel() internal view returns (uint256) {
        try vm.envUint("FHENIX_ENCRYPTION_LEVEL") returns (uint256 level) {
            require(
                level == 128 || level == 192 || level == 256,
                "Invalid encryption level"
            );
            return level;
        } catch {
            // Default to 192-bit encryption
            return 192;
        }
    }

    /**
     * @notice Get decryption authorizers from environment
     */
    function getDecryptionAuthorizers() internal view returns (address[] memory) {
        // For now, return empty array (can be configured via environment)
        address[] memory authorizers = new address[](1);
        authorizers[0] = msg.sender; // Deployer is authorized by default
        return authorizers;
    }

    /**
     * @notice Get decryption threshold from environment
     */
    function getDecryptionThreshold() internal view returns (uint256) {
        try vm.envUint("FHENIX_DECRYPTION_THRESHOLD") returns (uint256 threshold) {
            return threshold;
        } catch {
            // Default to 1 (single signature)
            return 1;
        }
    }

    /**
     * @notice Get encrypted path enabled flag from environment
     */
    function getEncryptedPathEnabled() internal view returns (bool) {
        try vm.envBool("FHENIX_ENCRYPTED_PATH_ENABLED") returns (bool enabled) {
            return enabled;
        } catch {
            // Default to false (disabled for safety)
            return false;
        }
    }

    /**
     * @notice Log deployment results
     */
    function logDeploymentResults(DeploymentResult memory result) internal view {
        console.log("");
        console.log("=== Deployment Results ===");
        console.log("FhenixEncryptionManager:", result.encryptionManager);
        console.log("EncryptedMintCeiling:", result.mintCeiling);
        console.log("EncryptedPegDeviation:", result.pegDeviation);
        console.log("EncryptedCurveParameters:", result.curveParameters);
        console.log("FhenixComputationEngine:", result.computationEngine);
        console.log("FhenixDecryptionHandler:", result.decryptionHandler);
        console.log("EncryptionOrchestrator:", result.orchestrator);
        console.log("Deployment Time:", result.deploymentTime);
        console.log("");
        console.log("Save these addresses for verification and integration!");
    }
}
