#!/usr/bin/env node
const fs = require('fs');
const fetch = global.fetch || require('node-fetch');
const ethers = require('ethers');
const minimist = require('minimist');

(async()=>{
  const argv = minimist(process.argv.slice(2));
  const addr = (argv.address || argv.a || '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9').trim();
  const providerUrl = process.env.MAINNET_RPC_URL || process.env.PROVIDER_URL || 'https://eth.llamarpc.com';
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const pageUrl = `https://etherscan.io/address/${addr}`;
  console.log('Fetching', pageUrl);
  const res = await fetch(pageUrl, {headers: {'User-Agent':'Mozilla/5.0 (compatible; scrape-script/1.0)'}});
  const text = await res.text();
  // find tx links
  const txRegex = /\/tx\/(0x[a-fA-F0-9]{64})/g;
  const txs = new Set();
  let m;
  while((m = txRegex.exec(text)) !== null){ txs.add(m[1]); }
  console.log('Found tx links:', txs.size);
  const out = {address: addr, foundTxs: txs.size, txs:[]};
  const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'.toLowerCase();
  for(const h of Array.from(txs).slice(0,200)){
    try{
      const tx = await provider.getTransaction(h);
      const receipt = await provider.getTransactionReceipt(h);
      if(!tx) continue;
      const entry = {
        hash: h,
        from: tx.from,
        to: tx.to,
        value: tx.value?ethers.formatEther(tx.value):'0',
        input: tx.data || tx.input || null,
        blockNumber: tx.blockNumber || (receipt?receipt.blockNumber:null),
        status: receipt?receipt.status:null
      };
      if(entry.to && entry.to.toLowerCase() === ENS_REGISTRY){ entry.callsENS = true; }
      out.txs.push(entry);
    }catch(e){ console.error('err fetching tx', h, e && e.message?e.message:e); }
  }
  fs.writeFileSync('etherscan_tx_links.json', JSON.stringify(out,null,2));
  console.log('Wrote etherscan_tx_links.json with', out.txs.length, 'entries');
})();
