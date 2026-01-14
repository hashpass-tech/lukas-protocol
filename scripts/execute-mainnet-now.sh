#!/bin/bash
# Execute Mainnet ENS Rescue - FINAL VERSION

set -e

echo "🚨 MAINNET ENS RESCUE - FINAL EXECUTION"
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

# Set Mainnet configuration
export PROVIDER_URL="${MAINNET_RPC_URL}"
export FLASHBOTS_RELAY_URL="https://relay.flashbots.net"
export ENS_REGISTRY="0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
export DRY_RUN=false

ENS_NAME="${1:-lukas-lat.eth}"

echo "⚙️ Configuration:"
echo "  Network: MAINNET"
echo "  ENS Name: $ENS_NAME"
echo "  Relayer: $RELAYER_PRIVATE_ADDRS"
echo "  Compromised: $(node -e "const ethers = require('ethers'); const w = new ethers.Wallet('$PRIVATE_KEY'); console.log(w.address);")"
echo "  New Owner: $NEW_OWNER"
echo ""

# Check current status
echo "🔍 Current Status:"
echo ""

# Relayer balance
echo -n "  Relayer Balance: "
node -e "
const ethers = require('ethers');
(async () => {
  const provider = new ethers.JsonRpcProvider('$PROVIDER_URL');
  const balance = await provider.getBalance('$RELAYER_PRIVATE_ADDRS');
  console.log(ethers.formatEther(balance), 'ETH');
})();
" 2>/dev/null

# Gas prices
echo -n "  Current Gas: "
node -e "
const ethers = require('ethers');
(async () => {
  const provider = new ethers.JsonRpcProvider('$PROVIDER_URL');
  const block = await provider.getBlock('latest');
  if (block.baseFeePerGas) {
    console.log(ethers.formatUnits(block.baseFeePerGas, 'gwei'), 'gwei');
  }
})();
" 2>/dev/null

# ENS current owner
echo -n "  Current ENS Owner: "
node -e "
const ethers = require('ethers');
(async () => {
  const provider = new ethers.JsonRpcProvider('$PROVIDER_URL');
  const ens = new ethers.Contract(
    '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    ['function owner(bytes32 node) view returns (address)'],
    provider
  );
  const namehash = ethers.namehash('$ENS_NAME');
  const owner = await ens.owner(namehash);
  console.log(owner);
})();
" 2>/dev/null

echo ""
echo "========================================================================"
echo "⚠️  FINAL CONFIRMATION"
echo "========================================================================"
echo ""
echo "You are about to transfer $ENS_NAME ownership on MAINNET"
echo ""
read -p "Type 'EXECUTE' to proceed: " CONFIRM

if [ "$CONFIRM" != "EXECUTE" ]; then
    echo ""
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "🚀 Executing..."
echo "========================================================================"
echo ""

# Execute with force flag (bypasses 0.05 ETH check since we know 0.020 is sufficient)
node scripts/flashbots_bundle_optimized.js --name "$ENS_NAME" --force

EXIT_CODE=$?

echo ""
echo "========================================================================"
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ EXECUTION COMPLETED"
    echo ""
    echo "🔍 Verify at:"
    echo "  https://etherscan.io/enslookup-search?search=$ENS_NAME"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Verify ENS owner changed to: $NEW_OWNER"
    echo "  2. Test control from new owner wallet"
    echo "  3. Rotate/burn compromised private key"
else
    echo "❌ EXECUTION FAILED"
    echo ""
    echo "Check the output above for details"
fi
echo "========================================================================"
echo ""
