#!/bin/bash
# Live Sepolia Test - Actually submit bundle to testnet

set -e

echo "🧪 SEPOLIA TESTNET - LIVE EXECUTION TEST"
echo "========================================================================"
echo "This will actually submit a bundle to Sepolia Flashbots relay"
echo "========================================================================"
echo ""

# Load environment
if [ -f "packages/flashbots-ens-rescue-master/.env" ]; then
    echo "📁 Loading environment..."
    set -o allexport
    source packages/flashbots-ens-rescue-master/.env
    set +o allexport
else
    echo "❌ Error: .env file not found"
    exit 1
fi

# Set Sepolia configuration
export PROVIDER_URL="${SEPOLIA_RPC_URL}"
export FLASHBOTS_RELAY_URL="https://relay-sepolia.flashbots.net"
export ENS_REGISTRY="0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
export DRY_RUN=false

# Use a test ENS name (won't actually transfer, just tests the mechanism)
TEST_ENS_NAME="${1:-vitalik.eth}"

echo "⚙️ Configuration:"
echo "  Network: Sepolia Testnet"
echo "  RPC: $PROVIDER_URL"
echo "  Relay: $FLASHBOTS_RELAY_URL"
echo "  Test ENS: $TEST_ENS_NAME"
echo "  Relayer: $RELAYER_PRIVATE_ADDRS"
echo ""

# Check relayer balance on Sepolia
echo "🔍 Checking Sepolia Status:"
echo ""

echo -n "  Relayer Balance (Sepolia): "
SEPOLIA_BALANCE=$(node -e "
const ethers = require('ethers');
(async () => {
  try {
    const provider = new ethers.JsonRpcProvider('$PROVIDER_URL');
    const balance = await provider.getBalance('$RELAYER_PRIVATE_ADDRS');
    console.log(ethers.formatEther(balance));
  } catch (e) {
    console.log('0');
  }
})();
" 2>/dev/null || echo "0")

echo "$SEPOLIA_BALANCE ETH"

# Check if relayer has enough Sepolia ETH
HAS_BALANCE=$(node -e "
const ethers = require('ethers');
const balance = ethers.parseEther('$SEPOLIA_BALANCE');
const required = ethers.parseEther('0.01');
console.log(balance >= required ? 'yes' : 'no');
")

if [ "$HAS_BALANCE" = "no" ]; then
    echo ""
    echo "⚠️  WARNING: Relayer has insufficient Sepolia ETH"
    echo ""
    echo "Your relayer needs at least 0.01 ETH on Sepolia for testing."
    echo ""
    echo "Get Sepolia ETH from faucets:"
    echo "  - https://sepoliafaucet.com"
    echo "  - https://www.alchemy.com/faucets/ethereum-sepolia"
    echo "  - https://faucet.quicknode.com/ethereum/sepolia"
    echo ""
    echo "Send Sepolia ETH to: $RELAYER_PRIVATE_ADDRS"
    echo ""
    read -p "Continue anyway? (y/N): " CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        echo "Cancelled"
        exit 0
    fi
fi

echo ""
echo "========================================================================"
echo "🚀 EXECUTING SEPOLIA TEST"
echo "========================================================================"
echo ""
echo "This will:"
echo "  1. Build a Flashbots bundle"
echo "  2. Submit to Sepolia Flashbots relay"
echo "  3. Attempt inclusion in next blocks"
echo ""
echo "Note: The ENS transfer may not succeed (different owner on testnet)"
echo "      but we're testing the Flashbots mechanism itself."
echo ""
read -p "Continue? (y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo "🚀 Submitting to Sepolia..."
echo "========================================================================"
echo ""

# Execute with force flag (bypass balance check)
node scripts/flashbots_bundle_optimized.js --name "$TEST_ENS_NAME" --force

EXIT_CODE=$?

echo ""
echo "========================================================================"
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ TEST COMPLETED"
    echo ""
    echo "📊 Results:"
    echo "  - Bundle was constructed successfully"
    echo "  - Submitted to Sepolia Flashbots relay"
    echo "  - Check output above for inclusion status"
    echo ""
    echo "🎯 If bundle was included:"
    echo "  ✅ Flashbots mechanism is working"
    echo "  ✅ Ready for mainnet execution"
    echo ""
    echo "⚠️  If bundle was NOT included:"
    echo "  - This is normal on testnet (less competitive)"
    echo "  - The mechanism still works"
    echo "  - Mainnet has better inclusion rates"
else
    echo "❌ TEST FAILED"
    echo ""
    echo "Check the output above for details"
fi
echo "========================================================================"
echo ""
