#!/usr/bin/env node
const fs = require('fs');
const ethers = require('ethers');
const minimist = require('minimist');

async function main(){
  const argv = minimist(process.argv.slice(2));
  const blocksToScan = parseInt(argv.blocks || argv.b || '2000', 10);
  const concurrency = parseInt(argv.concurrency || argv.c || '6', 10);
  // owner from packages/contracts/.env or via ENS
  let owner = process.env.DEPLOYER_ADDRS || process.env.OWNER_ADDR || process.env.NEW_OWNER;
  const envPath = 'packages/contracts/.env';
  if(!owner && fs.existsSync(envPath)){
    const raw = fs.readFileSync(envPath,'utf8');
    const m = raw.match(/DEPLOYER_ADDRS\s*=\s*"?([^"\n]+)"?/i);
    if(m) owner = m[1];
  }
  if(!owner){
    // fallback: query ENS
    const PROVIDER_URL = process.env.MAINNET_RPC_URL || process.env.PROVIDER_URL || 'https://eth.llamarpc.com';
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    try{
      const ENS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
      const namehash = ethers.namehash('lukas-lat.eth');
      const iface = new ethers.Interface(['function owner(bytes32 node) view returns (address)']);
      const res = await provider.call({ to: ENS, data: iface.encodeFunctionData('owner', [namehash]) });
      const dec = iface.decodeFunctionResult('owner', res);
      owner = dec[0];
    }catch(e){
      console.error('Could not determine owner address from env or ENS:', e.message||e);
      process.exit(1);
    }
  }

  owner = ethers.getAddress(owner);
  console.log('Scanning for owner:', owner);

  const PROVIDER_URL = process.env.MAINNET_RPC_URL || process.env.PROVIDER_URL || 'https://eth.llamarpc.com';
  const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  const latest = await provider.getBlockNumber();
  const start = Math.max(0, latest - blocksToScan + 1);
  console.log('Latest block:', latest, 'scanning from', start, 'to', latest, `(${blocksToScan} blocks)`);

  const found = [];
  const blockNumbers =[];
  for(let b = start; b<=latest; b++) blockNumbers.push(b);

  // process in batches
  async function fetchBlock(bn){
    try{
      // Use eth_getBlockByNumber to get transactions array (some providers don't implement getBlockWithTransactions)
      const blockHex = ethers.toBeHex(bn);
      const block = await provider.send('eth_getBlockByNumber', [blockHex, true]);
      if(!block || !block.transactions) return [];
      const hits = block.transactions.filter(tx=>{
        if(!tx) return false;
        try{
          const from = tx.from?ethers.getAddress(tx.from):null;
          const to = tx.to?ethers.getAddress(tx.to):null;
          return (from === owner) || (to === owner);
        }catch(e){ return false; }
      }).map(tx=>({
        hash: tx.hash,
        blockNumber: parseInt(block.number,16),
        timestamp: parseInt(block.timestamp,16),
        from: tx.from,
        to: tx.to,
        value: tx.value?ethers.formatEther(tx.value):null,
        nonce: tx.nonce,
        gasLimit: tx.gas || tx.gasLimit,
        gasPrice: tx.maxFeePerGas || tx.gasPrice,
        data: tx.input && tx.input !== '0x' ? tx.input : null
      }));
      return hits;
    }catch(e){
      console.error('block fetch error', bn, e && e.message?e.message:e);
      return [];
    }
  }

  // simple concurrency pool
  let i = 0;
  async function worker(){
    while(true){
      let idx;
      // lock
      if(i>=blockNumbers.length) return;
      idx = i; i++;
      const bn = blockNumbers[idx];
      const hits = await fetchBlock(bn);
      for(const h of hits) found.push(h);
      if(idx % 100 === 0) process.stdout.write(`.${idx}`);
    }
  }

  const workers = [];
  for(let w=0; w<concurrency; w++) workers.push(worker());
  await Promise.all(workers);

  console.log('\nFound', found.length, 'matching transactions');
  // sort by blockNumber desc
  found.sort((a,b)=>b.blockNumber - a.blockNumber);
  fs.writeFileSync('owner_txs.json', JSON.stringify({owner, scannedFrom:start, scannedTo:latest, count:found.length, txs:found.slice(0,200)}, null, 2));
  console.log('Wrote owner_txs.json (top 200 entries)');
  if(found.length>0){
    console.log('Sample (latest 10):');
    console.log(found.slice(0,10));
  }
}

main().catch(e=>{ console.error(e && e.stack?e.stack:e); process.exit(1); });
