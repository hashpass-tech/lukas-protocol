#!/usr/bin/env node
const fs = require('fs');
const fetch = global.fetch || require('node-fetch');
(async ()=>{
  try{
    const addr = process.argv[2] || '0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547';
    const url = `https://etherscan.io/address/${addr}#code`;
    console.log('Fetching', url);
    const r = await fetch(url, {headers:{'User-Agent':'Mozilla/5.0'}});
    const text = await r.text();
    const re = /id=['"]js-copytextarea2['"][^>]*>([\s\S]*?)<\/(?:pre|textarea)>/i;
    const m = text.match(re);
    if(!m){ console.error('no js-copytextarea2 found'); process.exit(0); }
    const content = m[1];
    // sometimes content is HTML-escaped; unescape basic entities
    const unescaped = content.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    // try parse
    let abi = null;
    try{ abi = JSON.parse(unescaped); }
    catch(e){
      try{ abi = JSON.parse(content); }
      catch(e2){ console.error('JSON parse failed'); fs.writeFileSync('contract_abi_raw.txt', content); process.exit(0); }
    }
    const functions = abi.filter(a=>a.type==='function').map(f=>({name:f.name, inputs:f.inputs, stateMutability:f.stateMutability}));
    const out = {address:addr, functionCount:functions.length, functions};
    fs.writeFileSync('contract_abi.json', JSON.stringify(out,null,2));
    console.log('Wrote contract_abi.json with', functions.length, 'functions');
  }catch(e){ console.error(e && e.stack?e.stack:e); process.exit(1);}})();
