#!/bin/bash

# FHENIX Amoy Deployment Command
# Date: January 8, 2026
# Network: Polygon Amoy (Testnet)
# Contracts: 7 minimal FHENIX core infrastructure

set -e

echo "=========================================="
echo "FHENIX Amoy Deployment"
echo "=========================================="
echo ""

# Step 1: Verify environment variables
echo "Step 1: Verifying environment variables..."
if [ -z "$AMOY_RPC_URL" ]; then
  echo "ERROR: AMOY_RPC_URL not set"
  echo "Set with: export AMOY_RPC_URL=\"https://rpc-amoy.polygon.technology/\""
  exit 1
fi

if [ -z "$AMOY_PRIVATE_KEY" ]; then
  echo "ERROR: AMOY_PRIVATE_KEY not set"
  echo "Set with: export AMOY_PRIVATE_KEY=\"0x...\""
  exit 1
fi

if [ -z "$FHENIX_PUBLIC_KEY" ]; then
  echo "ERROR: FHENIX_PUBLIC_KEY not set"
  echo "Set with: export FHENIX_PUBLIC_KEY=\"0x...\""
  exit 1
fi

if [ -z "$ETHERSCAN_API_KEY" ]; then
  echo "ERROR: ETHERSCAN_API_KEY not set"
  echo "Set with: export ETHERSCAN_API_KEY=\"...\""
  exit 1
fi

echo "✓ All environment variables set"
echo ""

# Step 2: Get deployer address
echo "Step 2: Getting deployer address..."
DEPLOYER=$(cast wallet address --private-key $AMOY_PRIVATE_KEY)
echo "Deployer: $DEPLOYER"
echo ""

# Step 3: Check deployer balance
echo "Step 3: Checking deployer balance..."
BALANCE=$(cast balance $DEPLOYER --rpc-url $AMOY_RPC_URL)
BALANCE_MATIC=$(cast to-unit $BALANCE ether)
echo "Balance: $BALANCE_MATIC MATIC"

if (( $(echo "$BALANCE_MATIC < 1" | bc -l) )); then
  echo "ERROR: Insufficient balance. Need at least 1 MATIC"
  echo "Get MATIC from faucet: https://faucet.polygon.technology/"
  exit 1
fi

echo "✓ Sufficient balance"
echo ""

# Step 4: Build contracts
echo "Step 4: Building contracts..."
forge build --root packages/contracts
echo "✓ Contracts built successfully"
echo ""

# Step 5: Dry run
echo "Step 5: Running dry run deployment..."
forge script script/DeployFhenixPhase1.s.sol:DeployFhenixPhase1 \
  --rpc-url $AMOY_RPC_URL \
  --private-key $AMOY_PRIVATE_KEY \
  --dry-run

echo "✓ Dry run successful"
echo ""

# Step 6: Deploy to Amoy
echo "Step 6: Deploying to Amoy..."
echo "This will deploy 7 FHENIX contracts to Polygon Amoy"
echo "Estimated cost: ~0.16 MATIC"
echo ""
read -p "Continue with deployment? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "Deployment cancelled"
  exit 1
fi

echo "Deploying..."
forge script script/DeployFhenixPhase1.s.sol:DeployFhenixPhase1 \
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
echo "1. Check deployment on Amoy Polygonscan: https://amoy.polygonscan.com/"
echo "2. Verify contracts are verified"
echo "3. Save deployment addresses"
echo "4. Run verification checks (see FHENIX_AMOY_DEPLOYMENT_EXECUTION.md)"
echo ""
