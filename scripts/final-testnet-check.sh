#!/bin/bash
# Final Testnet Check Before Mainnet Execution

set -e

echo "🧪 FINAL TESTNET CHECK - SEPOLIA"
echo "========================================================================"
echo "This will validate everything before mainnet execution"
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

# Set Sepolia configuration
export PROVIDER_URL="${SEPOLIA_RPC_URL}"
export FLASHBOTS_RELAY_URL="https://relay-sepolia.flashbots.net"
export ENS_REGISTRY="0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"

echo ""
echo "⚙️ Configuration:"
echo "  Network: Sepolia Testnet"
echo "  RPC: $PROVIDER_URL"
echo "  Relay: $FLASHBOTS_RELAY_URL"
echo "  Relayer: $RELAYER_PRIVATE_ADDRS"
echo "  Compromised: $DEPLOYER_ADDRS"
echo "  New Owner: $NEW_OWNER"
echo ""

# Check if we have a test ENS name
if [ -z "$TEST_ENS_NAME" ]; then
    echo "⚠️  No TEST_ENS_NAME set, using 'test.eth' as default"
    export TEST_ENS_NAME="test.eth"
fi

echo "🔍 Step 1: Validate Configuration"
echo "========================================================================"
node scripts/flashbots_bundle_optimized.js --name "$TEST_ENS_NAME" --validate-only

echo ""
echo "🧪 Step 2: Dry Run (Build Bundle Without Submission)"
echo "========================================================================"
export DRY_RUN=true
node scripts/flashbots_bundle_optimized.js --name "$TEST_ENS_NAME"

echo ""
echo "📊 Step 3: Check Relayer Balance on Sepolia"
echo "========================================================================"
node -e "
const ethers = require('ethers');
(async () => {
  const provider = new ethers.JsonRpcProvider('$PROVIDER_URL');
  const balance = await provider.getBalance('$RELAYER_PRIVATE_ADDRS');
  console.log('Relayer Balance:', ethers.formatEther(balance), 'ETH');
  if (balance < ethers.parseEther('0.05')) {
    console.log('⚠️  WARNING: Relayer balance is low on Sepolia');
    console.log('   For testing, you need at least 0.05 ETH on Sepolia');
    console.log('   Get Sepolia ETH from: https://sepoliafaucet.com');
  } else {
    console.log('✅ Relayer balance is sufficient for testing');
  }
})();
"

echo ""
echo "========================================================================"
echo "📋 PRE-MAINNET CHECKLIST"
echo "========================================================================"
echo ""
echo "Before executing on mainnet, verify:"
echo ""
echo "✓ Configuration:"
echo "  [ ] RELAYER_PRIVATE is correct and funded with 0.016+ ETH on MAINNET"
echo "  [ ] PRIVATE_KEY (compromised wallet) is correct"
echo "  [ ] NEW_OWNER address is correct and safe"
echo "  [ ] ENS name is correct (lukas-lat.eth)"
echo ""
echo "✓ Testing:"
echo "  [ ] Sepolia dry run completed successfully (above)"
echo "  [ ] All validation checks passed"
echo "  [ ] Bundle construction works"
echo ""
echo "✓ Network:"
echo "  [ ] Current gas price is reasonable (< 50 gwei)"
echo "  [ ] Mainnet RPC is working"
echo "  [ ] No network issues reported"
echo ""
echo "✓ Safety:"
echo "  [ ] Private keys are secure"
echo "  [ ] Backup of all addresses documented"
echo "  [ ] Ready to execute immediately"
echo ""
echo "========================================================================"
echo "🚀 READY FOR MAINNET?"
echo "========================================================================"
echo ""
echo "If all checks above passed, you can execute on mainnet with:"
echo ""
echo "  export PROVIDER_URL=\"\$MAINNET_RPC_URL\""
echo "  export FLASHBOTS_RELAY_URL=\"https://relay.flashbots.net\""
echo "  export DRY_RUN=false"
echo "  node scripts/flashbots_bundle_optimized.js --name lukas-lat.eth"
echo ""
echo "Or use the mainnet execution script:"
echo "  ./scripts/execute-mainnet-rescue.sh"
echo ""
