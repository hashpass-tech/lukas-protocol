ENS transfer script

This folder contains `transfer_ens.js`, a small Node script to safely transfer an ENS name to another address and optionally set the name's address record prior to transfer.

Requirements:
- Node.js (16+)
- Install dependencies: `npm install ethers minimist` in the repo root (or globally)

Quick usage:

```bash
# dry run (shows action plan)
PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_KEY" \
  PRIVATE_KEY="0xYOUR_CURRENT_OWNER_PRIVATE_KEY" \
  node scripts/transfer_ens.js --name lukas-lat.eth --to 0x99E4b05A02E0060a4cD5dFD82731aa9F7EA37ACb

# execute (add --yes to perform txs)
PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_KEY" \
  PRIVATE_KEY="0xYOUR_CURRENT_OWNER_PRIVATE_KEY" \
  node scripts/transfer_ens.js --name lukas-lat.eth --to 0x99E4b05A02E0060a4cD5dFD82731aa9F7EA37ACb --yes
```

Notes & Safety:
- The script will abort if the supplied private key does not match the current owner on-chain.
- If you want to set the ENS address record before transferring ownership, use `--set-address <address>`; the script will set the record only if a resolver is present and you're the owner.
- Do NOT store private keys in the repository. Use secrets managers or environment variables.
