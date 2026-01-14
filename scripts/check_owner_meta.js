#!/usr/bin/env node
const ethers = require('ethers');
(async()=>{
  const PROVIDER_URL = process.env.MAINNET_RPC_URL || process.env.PROVIDER_URL || 'https://eth.llamarpc.com';
  const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  // owner hardcoded from earlier
  const owner = '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9';
  console.log('Owner:', owner);
  const code = await provider.getCode(owner);
  console.log('Bytecode (hex):', code);
  console.log('Bytecode length (bytes):', (code.length-2)/2);

  const tries = [];
  // ERC-1271
  const iface1271 = new ethers.Interface(['function isValidSignature(bytes32,bytes) public view returns (bytes4)']);
  const msgHash = ethers.keccak256(ethers.toUtf8Bytes('test'));
  const payload1271 = iface1271.encodeFunctionData('isValidSignature', [msgHash, '0x']);
  tries.push({name:'ERC-1271 isValidSignature', data: payload1271});

  // owner() view
  const ifaceOwner = new ethers.Interface(['function owner() view returns (address)']);
  tries.push({name:'owner()', data: ifaceOwner.encodeFunctionData('owner', [])});

  // getOwner()
  const ifaceGetOwner = new ethers.Interface(['function getOwner() view returns (address)']);
  tries.push({name:'getOwner()', data: ifaceGetOwner.encodeFunctionData('getOwner', [])});

  // execute(address,uint256,bytes) common exec
  const ifaceExec = new ethers.Interface(['function execute(address to, uint256 value, bytes data)']);
  tries.push({name:'execute(to,value,data)', data: ifaceExec.encodeFunctionData('execute', [owner, 0, '0x'])});

  for(const t of tries){
    try{
      const res = await provider.call({ to: owner, data: t.data });
      console.log(`${t.name} -> returned:`, res);
    }catch(e){
      console.log(`${t.name} -> call reverted or failed:`, e && e.message?e.message:e);
    }
  }
})();
