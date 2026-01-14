#!/usr/bin/env node
const fs = require('fs');
const ethers = require('ethers');
(async ()=>{
  try{
    const envPath = 'packages/contracts/.env';
    if(!fs.existsSync(envPath)) throw new Error('env not found');
    const raw = fs.readFileSync(envPath,'utf8');
    const m = raw.match(/PRIVATE_KEY\s*=\s*"?([^"\n]+)/i);
    if(!m) throw new Error('PRIVATE_KEY not found in .env');
    const pk = m[1].trim();
    const wallet = new ethers.Wallet(pk);
    console.log('Derived address from PRIVATE_KEY:', wallet.address);

    const providerUrl = process.env.MAINNET_RPC_URL || process.env.PROVIDER_URL || 'https://eth.llamarpc.com';
    const provider = new ethers.JsonRpcProvider(providerUrl);

    const ENS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
    const namehash = ethers.namehash('lukas-lat.eth');
    const iface = new ethers.Interface(['function owner(bytes32) view returns (address)']);
    const res = await provider.call({ to: ENS, data: iface.encodeFunctionData('owner', [namehash]) });
    const dec = iface.decodeFunctionResult('owner', res);
    const ensOwner = dec[0];
    console.log('ENS owner:', ensOwner);

    const ownerCode = await provider.getCode(ensOwner);
    console.log('ENS owner code length (bytes):', (ownerCode.length-2)/2);

    const walletBal = await provider.getBalance(wallet.address);
    const ownerBal = await provider.getBalance(ensOwner);
    console.log('Derived key balance (ETH):', ethers.formatEther(walletBal));
    console.log('ENS owner balance (ETH):', ethers.formatEther(ownerBal));

    if(wallet.address.toLowerCase() === ensOwner.toLowerCase()){
      console.log('MATCH: the PRIVATE_KEY controls the ENS owner (EOA).');
    } else {
      console.log('NO MATCH: the PRIVATE_KEY-derived address is NOT the ENS owner. ENS owner is a contract or different address.');
    }
  }catch(e){ console.error('error:', e && e.message?e.message:e); process.exit(1); }
})();
