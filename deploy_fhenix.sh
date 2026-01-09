#!/bin/bash

# FHENIX Phase 1 Deployment Script for Polygon Amoy

set -e

echo "=========================================="
echo "FHENIX Phase 1 Deployment - Polygon Amoy"
echo "=========================================="
echo ""

# Set environment variables
export AMOY_RPC_URL="https://rpc-amoy.polygon.technology"
# Sensitive values redacted — load real secrets from environment or secret manager.
export AMOY_PRIVATE_KEY="<REDACTED_PRIVATE_KEY>"
export ETHERSCAN_API_KEY="<REDACTED_ETHERSCAN_API_KEY>"

# Navigate to contracts directory
cd packages/contracts

echo "Step 1: Building contracts..."
/home/ed/.foundry/bin/forge build
echo "✓ Build successful"
echo ""

echo "Step 2: Running dry run..."
/home/ed/.foundry/bin/forge script script/DeployFhenixPhase1.s.sol:DeployFhenixPhase1 \
  --rpc-url $AMOY_RPC_URL \
  --private-key $AMOY_PRIVATE_KEY \
  --dry-run
echo "✓ Dry run successful"
echo ""

echo "Step 3: Deploying to Amoy..."
/home/ed/.foundry/bin/forge script script/DeployFhenixPhase1.s.sol:DeployFhenixPhase1 \
  --rpc-url $AMOY_RPC_URL \
  --private-key $AMOY_PRIVATE_KEY \
  --broadcast \
  --verify \
  --verifier etherscan \
  --etherscan-api-key $ETHERSCAN_API_KEY

echo ""
echo "=========================================="
echo "✓ Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check deployment addresses above"
echo "2. Verify contracts on Amoy Polygonscan"
echo "3. Save addresses to deployments.json"
echo ""
