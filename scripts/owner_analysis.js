#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');
const ethers = require('ethers');

(async ()=>{
  try{
    const envPath = 'packages/contracts/.env';
    let env = {};
    if(fs.existsSync(envPath)){
      const raw = fs.readFileSync(envPath,'utf8');
      raw.split(/\n/).forEach(l=>{
        const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]+)"?/i);
        if(m) env[m[1]] = m[2];
      });
    }
    const PROVIDER_URL = process.env.MAINNET_RPC_URL || process.env.PROVIDER_URL || env.MAINNET_RPC_URL || 'https://eth.llamarpc.com';
    const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY || env.ETHERSCAN_API_KEY;

    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);

    const ENS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
    const namehash = ethers.namehash('lukas-lat.eth');
    const iface = new ethers.Interface(['function owner(bytes32 node) view returns (address)']);
    const res = await provider.call({ to: ENS, data: iface.encodeFunctionData('owner', [namehash]) });
    const dec = iface.decodeFunctionResult('owner', res);
    const owner = dec[0];
    console.log('ENS owner:', owner);

    const code = await provider.getCode(owner);
    console.log('on-chain code length (bytes):', (code.length-2)/2, 'hexlen:', code.length);

    if(!ETHERSCAN_KEY){
      console.warn('No Etherscan API key found in env or packages/contracts/.env — skipping verified-source fetch');
      process.exit(0);
    }

    const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${owner}&apikey=${ETHERSCAN_KEY}`;
    console.log('Querying Etherscan:', url.replace(/apikey=.*$/,'apikey=***'));
    const resp = await fetch(url);
    const j = await resp.json();
    if(!j || !j.result || j.status === '0'){
      console.error('Etherscan query failed or no source. response:', JSON.stringify(j).slice(0,400));
      process.exit(0);
    }
    const result = j.result[0];
    console.log('Etherscan ContractName:', result.ContractName || '(none)');
    const hasSource = result.SourceCode && result.SourceCode.length>0;
    console.log('Has verified source:', !!hasSource);

    let abi = null;
    try{
      abi = JSON.parse(result.ABI);
    }catch(e){
      abi = null;
    }

    if(abi){
      const payableFunctions = abi.filter(a=>a.type==='function' && a.stateMutability && a.stateMutability.includes('payable')).map(a=>a.name);
      const hasReceive = abi.some(a=>a.type==='receive');
      const hasFallback = abi.some(a=>a.type==='fallback');
      const fallbackPayable = abi.some(a=>a.type==='fallback' && a.stateMutability && a.stateMutability.includes('payable'));
      console.log('ABI parsed: functions payable:', payableFunctions.length?payableFunctions.join(', '):'(none)');
      console.log('ABI receive:', hasReceive, 'ABI fallback:', hasFallback, 'fallback payable:', fallbackPayable);
      if(hasReceive || fallbackPayable){
        console.log('Conclusion: Contract accepts plain ETH transfers (receive or payable fallback present).');
      }else{
        console.log('Conclusion: Contract likely rejects plain ETH transfers (no payable receive or payable fallback in ABI).');
      }
    }else{
      console.log('No ABI available from Etherscan to analyze payable functions.');
      console.log('As fallback heuristic: check for DELEGATECALL/proxy patterns in bytecode.');
      // simple heuristic: check for common proxy runtime creation code or immutable admin slot patterns
      const bc = code.toLowerCase();
      if(bc.includes('363d3d373d3d3d363d73') || bc.includes('5af43d82803e903d91602b57fd5bf3')){
        console.log('Bytecode contains patterns suggestive of a proxy/forwarder.');
      }else{
        console.log('No simple proxy pattern detected in bytecode (heuristic).');
      }
    }

    // Save a short report
    const report = {
      owner,
      codeLengthBytes: (code.length-2)/2,
      hasVerifiedSource: !!hasSource,
      contractName: result.ContractName || null
    };
    fs.writeFileSync('owner_analysis_report.json', JSON.stringify(report,null,2));
    console.log('Wrote owner_analysis_report.json');
  }catch(e){
    console.error('err', e && e.stack?e.stack:e);
    process.exit(1);
  }
})();
