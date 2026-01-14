#!/usr/bin/env node
const fs = require('fs');
const fetch = global.fetch || require('node-fetch');
const minimist = require('minimist');
const ethers = require('ethers');

(async ()=>{
  try{
    const argv = minimist(process.argv.slice(2));
    // Prefer raw process argv parsing to avoid minimist numeric coercion
    let addr;
    const rawArgs = process.argv;
    const idx = rawArgs.findIndex(s=>s==='--address' || s==='-a');
    if(idx>=0 && rawArgs.length>idx+1){ addr = rawArgs[idx+1]; }
    if(!addr) addr = argv.address || argv.a;
    addr = String(addr || '0x4F36DC378d1C78181B3F544a81E8951fb4838ad9').trim();
    const envPath = 'packages/contracts/.env';
    let env = {};
    if(fs.existsSync(envPath)){
      const raw = fs.readFileSync(envPath,'utf8');
      raw.split(/\n/).forEach(l=>{
        const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]+)"?/i);
        if(m) env[m[1]] = m[2];
      });
    }
    const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY || env.ETHERSCAN_API_KEY || '';

    const out = {address: ethers.getAddress(addr), fetchedAt: new Date().toISOString(), results:{}};

    if(!ETHERSCAN_KEY){
      console.warn('No Etherscan API key found; will still try public HTML scrape and txlist may fail.');
    }

    // 1) Try getabi
    if(ETHERSCAN_KEY){
      try{
        const getabi = `https://api.etherscan.io/api?module=contract&action=getabi&address=${out.address}&apikey=${ETHERSCAN_KEY}`;
        const r = await fetch(getabi);
        const j = await r.json();
        out.results.getabi = j;
        if(j && j.status==='1' && j.result){
          try{ out.results.abi = JSON.parse(j.result); out.results.abiDetected = true; }catch(e){ out.results.abiText = j.result; }
        }
      }catch(e){ out.results.getabiError = e.message||String(e); }

      // 2) Try getsourcecode
      try{
        const srcurl = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${out.address}&apikey=${ETHERSCAN_KEY}`;
        const r2 = await fetch(srcurl);
        const j2 = await r2.json();
        out.results.getsourcecode = j2;
      }catch(e){ out.results.getsourcecodeError = e.message||String(e); }

      // 3) Try account txlist
      try{
        const txurl = `https://api.etherscan.io/api?module=account&action=txlist&address=${out.address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${ETHERSCAN_KEY}`;
        const rt = await fetch(txurl);
        const jt = await rt.json();
        out.results.txlist = jt;
      }catch(e){ out.results.txlistError = e.message||String(e); }
    }

    // If getabi didn't give ABI, fallback to HTML scraping of Etherscan
    if(!out.results.abiDetected){
      try{
        const page = await fetch(`https://etherscan.io/address/${out.address}#code`, {headers: { 'User-Agent': 'Mozilla/5.0 (compatible; scrape-script/1.0)'}});
        const text = await page.text();
        out.results.htmlLength = text.length;
        // naive searches
        const idxABI = text.indexOf('Contract ABI');
        if(idxABI>-1){
          const snippet = text.slice(Math.max(0, idxABI-200), idxABI+1200);
          out.results.abiHtmlSnippet = snippet;
        }
        const idxSrc = text.indexOf('Contract Source Code');
        if(idxSrc>-1){ out.results.sourceHtmlSnippet = text.slice(Math.max(0, idxSrc-200), idxSrc+1200); }

        // attempt to extract ABI JSON blob in page (search for "contractABI" or "js-copytextarea2")
        const reAbiJson = /contractABI\s*=\s*(\[.*?\])\s*;/s;
        const m = text.match(reAbiJson);
        if(m){
          try{ out.results.abiFromHtml = JSON.parse(m[1]); out.results.abiDetected = true; }
          catch(e){ out.results.abiFromHtmlText = m[1].slice(0,2000); }
        } else {
          // search for textarea that contains ABI
          const taRe = /<textarea[^>]+id="js-copytextarea2"[^>]*>([\s\S]*?)<\/textarea>/i;
          const ta = text.match(taRe);
          if(ta){
            try{ out.results.abiFromTextarea = JSON.parse(ta[1]); out.results.abiDetected = true; }catch(e){ out.results.abiFromTextareaText = ta[1].slice(0,2000); }
          }
        }
      }catch(e){ out.results.htmlScrapeError = e.message||String(e); }
    }

    fs.writeFileSync('etherscan_scrape.json', JSON.stringify(out,null,2));
    console.log('Wrote etherscan_scrape.json');
    console.log(Object.keys(out.results));
  }catch(e){ console.error(e && e.stack?e.stack:e); process.exit(1); }
})();
