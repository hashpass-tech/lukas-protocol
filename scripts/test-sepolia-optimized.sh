#!/bin/bash
# Optimized Sepolia Test Script for Flashbots Bundle

set -e

echo "🧪 Flashbots Sepolia Test - Optimized"
echo "======================================"
echo ""

# Load environment
if [ -f "packages/contracts/.env" ]; then
    echo "📁 Loading environment from packages/contracts/.env"
    set -o allexport
    source packages/contracts/.env
    set +o allexport
else
    echo "❌ Error: packages/contracts/.env not found"
    exit 1
fi

# Validate required variables
echo ""
echo "🔍 Validating environment variables..."

if [ -z "$RELAYER_PRIVATE" ]; then
    echo "❌ RELAYER_PRIVATE not set"
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY not set"
    exit 1
fi

if [ -z "$NEW_OWNER" ]; then
    echo "❌ NEW_OWNER not set"
    exit 1
fi

echo "✅ All required variables present"

# Set Sepolia configuration
export PROVIDER_URL="${SEPOLIA_RPC:-https://rpc.sepolia.org}"
export FLASHBOTS_RELAY_URL="${SEPOLIA_RELAY:-https://relay-sepolia.flashbots.net}"
export ENS_REGISTRY="0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
export FUND_VALUE="${FUND_VALUE:-0.005}"

echo ""
echo "⚙️ Configuration:"
echo "  Network: Sepolia Testnet"
echo "  RPC: $PROVIDER_URL"
echo "  Relay: $FLASHBOTS_RELAY_URL"
echo "  Funding: $FUND_VALUE ETH"
echo ""

# Check if validation only
if [ "$1" == "--validate-only" ]; then
    echo "🔍 Running validation only..."
    node scripts/flashbots_bundle_optimized.js --name "${2:-test.eth}" --validate-only
    exit 0
fi

# Check if dry run
if [ "$1" == "--dry-run" ]; then
    echo "🧪 Running dry run..."
    export DRY_RUN=true
    node scripts/flashbots_bundle_optimized.js --name "${2:-test.eth}"
    exit 0
fi

# Get ENS name from argument
ENS_NAME="${1:-test.eth}"

echo "🚀 Starting Flashbots bundle submission..."
echo "  ENS Name: $ENS_NAME"
echo ""

# Run the optimized script
node scripts/flashbots_bundle_optimized.js --name "$ENS_NAME"

echo ""
echo "✅ Test complete!"
echo ""
echo "📊 Next steps:"
echo "  1. Check Sepolia Etherscan for bundle inclusion"
echo "  2. Verify ENS ownership changed"
echo "  3. If successful, proceed to mainnet"
echo ""
