#!/usr/bin/env node
const ethers = require('ethers');
(async ()=>{
  try{
    const pk = process.env.PRIVATE_KEY;
    if(!pk){ console.error('no PRIVATE_KEY'); process.exit(1); }
    const w = new ethers.Wallet(pk);
    console.log('Addr from PRIVATE_KEY:', await w.getAddress());
    console.log('DEPLOYER_ADDRS:', process.env.DEPLOYER_ADDRS);
    console.log('NEW_OWNER env:', process.env.NEW_OWNER);
    const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL || process.env.PROVIDER_URL || 'https://eth.llamarpc.com');
    const ENS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
    const namehash = ethers.namehash('lukas-lat.eth');
    const iface = new ethers.Interface(['function owner(bytes32 node) view returns (address)']);
    const res = await provider.call({ to: ENS, data: iface.encodeFunctionData('owner', [namehash]) });
    const dec = iface.decodeFunctionResult('owner', res);
    console.log('ENS owner:', dec[0]);
    const code = await provider.getCode(dec[0]);
    console.log('ENS owner code length:', code.length, 'isEOA?', code === '0x');
  }catch(e){ console.error('err', e.message || e); process.exit(1); }
})();
