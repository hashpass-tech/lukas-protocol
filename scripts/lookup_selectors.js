#!/usr/bin/env node
const fs = require('fs');
const fetch = global.fetch || require('node-fetch');
const ethers = require('ethers');
(async ()=>{
  try{
    const owner = '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9';
    const dataPath = 'etherscan_tx_links.json';
    if(!fs.existsSync(dataPath)) return console.error('missing', dataPath);
    const j = JSON.parse(fs.readFileSync(dataPath,'utf8'));
    const txs = j.txs.filter(t=>t.from && t.from.toLowerCase() === owner.toLowerCase());
    const selectors = new Set();
    const txMap = {};
    for(const tx of txs){
      if(tx.input && tx.input.startsWith('0x') && tx.input.length>=10){
        const sel = tx.input.slice(0,10);
        selectors.add(sel);
        txMap[sel] = txMap[sel]||[]; txMap[sel].push(tx);
      }
    }
    const out = {owner, selectorCount: selectors.size, selectors: {}};
    for(const sel of Array.from(selectors)){
      try{
        const url = `https://www.4byte.directory/api/v1/signatures/?hex_signature=${sel}`;
        const r = await fetch(url);
        const res = await r.json();
        const sigs = (res && res.results) ? res.results.map(s=>({text_signature: s.text_signature, created_at: s.created})) : [];
        out.selectors[sel] = {count: txMap[sel].length, txs: txMap[sel].map(t=>({hash:t.hash,to:t.to,block:t.blockNumber})), signatures: sigs};
      }catch(e){ out.selectors[sel] = {error: e.message||String(e), txs: txMap[sel]}; }
    }
    fs.writeFileSync('selector_lookup_report.json', JSON.stringify(out,null,2));
    console.log('Wrote selector_lookup_report.json');
    console.log('Selectors:', Object.keys(out.selectors).length);
  }catch(e){ console.error(e && e.stack?e.stack:e); process.exit(1); }
})();
