#!/bin/bash
# Execute Mainnet ENS Rescue

set -e

echo "🚨 MAINNET ENS RESCUE EXECUTION"
echo "========================================================================"
echo "⚠️  WARNING: This will execute on MAINNET with REAL ETH"
echo "========================================================================"
echo ""

# Load environment
if [ -f "packages/flashbots-ens-rescue-master/.env" ]; then
    echo "📁 Loading environment from packages/flashbots-ens-rescue-master/.env"
    set -o allexport
    source packages/flashbots-ens-rescue-master/.env
    set +o allexport
else
    echo "❌ Error: packages/flashbots-ens-rescue-master/.env not found"
    exit 1
fi

# Set Mainnet configuration
export PROVIDER_URL="${MAINNET_RPC_URL}"
export FLASHBOTS_RELAY_URL="https://relay.flashbots.net"
export ENS_REGISTRY="0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
export DRY_RUN=false

# Get ENS name from argument or use default
ENS_NAME="${1:-lukas-lat.eth}"

echo ""
echo "⚙️ Configuration:"
echo "  Network: MAINNET"
echo "  RPC: $PROVIDER_URL"
echo "  Relay: $FLASHBOTS_RELAY_URL"
echo "  ENS Name: $ENS_NAME"
echo "  Relayer: $RELAYER_PRIVATE_ADDRS"
echo "  New Owner: $NEW_OWNER"
echo ""

# Safety confirmation
echo "🔍 Pre-flight checks..."
echo ""

# Check relayer balance
echo "Checking relayer balance on mainnet..."
BALANCE=$(node -e "
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

echo "Relayer balance: $BALANCE ETH"
echo ""

# Check gas prices
echo "Checking current gas prices..."
node -e "
const ethers = require('ethers');
(async () => {
  try {
    const provider = new ethers.JsonRpcProvider('$PROVIDER_URL');
    const feeData = await provider.getFeeData();
    const block = await provider.getBlock('latest');
    
    if (block.baseFeePerGas) {
      const baseFee = ethers.formatUnits(block.baseFeePerGas, 'gwei');
      console.log('Current base fee:', baseFee, 'gwei');
      
      const baseFeeNum = parseFloat(baseFee);
      if (baseFeeNum > 100) {
        console.log('⚠️  WARNING: Gas is very high (> 100 gwei)');
        console.log('   Consider waiting for lower gas prices');
      } else if (baseFeeNum > 50) {
        console.log('⚠️  Gas is elevated (> 50 gwei)');
        console.log('   Execution will be more expensive');
      } else {
        console.log('✅ Gas prices are reasonable');
      }
    }
  } catch (e) {
    console.log('Could not fetch gas prices');
  }
})();
"

echo ""
echo "========================================================================"
echo "⚠️  FINAL CONFIRMATION"
echo "========================================================================"
echo ""
echo "You are about to execute a Flashbots bundle on MAINNET to transfer:"
echo "  ENS Name: $ENS_NAME"
echo "  From: $DEPLOYER_ADDRS (compromised)"
echo "  To: $NEW_OWNER (new safe owner)"
echo ""
echo "This will use approximately 0.005-0.01 ETH from your relayer wallet."
echo ""
read -p "Are you ABSOLUTELY SURE you want to proceed? (type 'YES' to continue): " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo ""
    echo "❌ Execution cancelled by user"
    exit 1
fi

echo ""
echo "🚀 Starting mainnet execution..."
echo "========================================================================"
echo ""

# Execute
node scripts/flashbots_bundle_optimized.js --name "$ENS_NAME"

EXIT_CODE=$?

echo ""
echo "========================================================================"
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Execution completed!"
    echo ""
    echo "📊 Next steps:"
    echo "  1. Check Etherscan for bundle inclusion"
    echo "  2. Verify ENS ownership changed"
    echo "  3. Test control from new owner address"
    echo "  4. Rotate/burn compromised private key"
    echo ""
    echo "🔍 Verify at:"
    echo "  https://etherscan.io/enslookup-search?search=$ENS_NAME"
else
    echo "❌ Execution failed with exit code $EXIT_CODE"
    echo ""
    echo "💡 Troubleshooting:"
    echo "  1. Check the error messages above"
    echo "  2. Verify relayer has sufficient ETH"
    echo "  3. Check gas prices aren't too high"
    echo "  4. Try again or increase FUND_VALUE"
fi
echo "========================================================================"
echo ""
