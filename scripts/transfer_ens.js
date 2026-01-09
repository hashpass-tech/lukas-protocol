#!/usr/bin/env node
/*
Safe ENS transfer script

Usage examples:
  PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_KEY" PRIVATE_KEY="0x..." node scripts/transfer_ens.js --name lukas-lat.eth --to 0x99E4b05A02E0060a4cD5dFD82731aa9F7EA37ACb --yes

Options:
  --name <ens name>    ENS name to transfer (required)
  --to <address>       New owner address (required)
  --set-address <addr> Optional: set the ENS "address" record before transfer
  --provider <url>     Optional: provider URL (or set PROVIDER_URL env)
  --yes                Skip interactive confirmation

IMPORTANT: This script requires the current owner's private key available in
the `PRIVATE_KEY` environment variable. Do NOT commit private keys to the repo.
*/

const { ethers } = require("ethers");
const argv = require('minimist')(process.argv.slice(2));

async function main() {
  const name = argv.name;
  const to = argv.to;
  const setAddress = argv['set-address'];
  const providerUrl = argv.provider || process.env.PROVIDER_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!name || !to) {
    console.error('Error: --name and --to are required');
    process.exit(1);
  }
  if (!providerUrl) {
    console.error('Error: provider URL not provided. Set --provider or PROVIDER_URL env var');
    process.exit(1);
  }
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY env not set (private key of current owner)');
    process.exit(1);
  }

  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const signerAddress = await wallet.getAddress();

  console.log('Signer address:', signerAddress);
  console.log('ENS name:', name);
  console.log('Target new owner:', to);
  if (setAddress) console.log('Will set address record to:', setAddress);

  if (!argv.yes) {
    console.log('\nAction plan:');
    if (setAddress) console.log('- set resolver address record (requires you are current owner)');
    console.log('- transfer ENS owner to', to);
    console.log('\nRun with --yes to execute.');
    process.exit(0);
  }

  const namehash = ethers.utils.namehash(name);

  const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
  const ensAbi = [
    'function owner(bytes32 node) view returns (address)',
    'function resolver(bytes32 node) view returns (address)',
    'function setOwner(bytes32 node, address owner)'
  ];

  const ens = new ethers.Contract(ENS_REGISTRY, ensAbi, wallet);
  const currentOwner = await ens.owner(namehash);
  console.log('Current ENS owner:', currentOwner);

  if (currentOwner.toLowerCase() !== signerAddress.toLowerCase()) {
    console.error('Signer is not the current owner of this ENS name. Aborting.');
    process.exit(1);
  }

  // Optionally set address record if requested and a resolver exists
  if (setAddress) {
    const resolverAddr = await ens.resolver(namehash);
    if (resolverAddr === ethers.constants.AddressZero) {
      console.error('No resolver set for name; cannot set address record. Aborting.');
      process.exit(1);
    }
    const resolverAbi = [
      'function setAddr(bytes32 node, address a) external',
      'function addr(bytes32 node) view returns (address)'
    ];
    const resolver = new ethers.Contract(resolverAddr, resolverAbi, wallet);
    console.log('Using resolver:', resolverAddr, ' — setting address to', setAddress);
    const tx1 = await resolver.setAddr(namehash, setAddress);
    console.log('setAddr tx sent:', tx1.hash);
    await tx1.wait();
    console.log('setAddr confirmed');
  }

  // Transfer ownership
  console.log('Transferring ownership to', to);
  const tx = await ens.setOwner(namehash, to);
  console.log('setOwner tx sent:', tx.hash);
  await tx.wait();
  console.log('Ownership transfer confirmed');
}

main().catch(err => { console.error(err); process.exit(1); });
