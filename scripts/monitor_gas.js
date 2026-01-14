#!/usr/bin/env node
const ethers = require('ethers');
const argv = require('minimist')(process.argv.slice(2));

const threshold = Number(argv.threshold || process.env.GAS_THRESHOLD_GWEI || 50);
const providerUrl = process.env.MAINNET_RPC_URL || process.env.PROVIDER_URL || 'https://eth.llamarpc.com';
const provider = new ethers.JsonRpcProvider(providerUrl);

console.log(`Monitoring mainnet gas — threshold ${threshold} gwei. Ctrl-C to stop.`);
(async function monitor(){
  for(;;){
    try{
      const fee = await provider.getFeeData();
      let maxFee = fee.maxFeePerGas || fee.maxPriorityFeePerGas;
      if(!maxFee){
        console.log(new Date().toISOString(), 'no fee data');
      } else {
        const g = Number(ethers.formatUnits(maxFee, 'gwei'));
        console.log(new Date().toISOString(), 'maxFeePerGas gwei=', g);
        if(g <= threshold){
          console.log('THRESHOLD REACHED:', g, 'gwei');
          process.exit(0);
        }
      }
    }catch(e){
      console.log(new Date().toISOString(), 'err', e.message);
    }
    await new Promise(r => setTimeout(r, 60_000));
  }
})();
