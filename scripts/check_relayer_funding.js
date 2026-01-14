#!/usr/bin/env node
const ethers = require('ethers');
(async ()=>{
  try{
    const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL || process.env.PROVIDER_URL || 'https://eth.llamarpc.com');
    let rel = process.env.RELAYER_PRIVATE;
    if(!rel){ console.error('RELAYER_PRIVATE missing'); process.exit(1); }
    if(!rel.startsWith('0x')) rel = '0x' + rel;
    const wallet = new ethers.Wallet(rel, provider);
    const relAddr = await wallet.getAddress();
    const balance = await provider.getBalance(relAddr);
    const feeData = await provider.getFeeData();
    const maxFee = feeData.maxFeePerGas || feeData.maxPriorityFeePerGas || ethers.parseUnits('100','gwei');
    const maxPriority = feeData.maxPriorityFeePerGas || ethers.parseUnits('2','gwei');
    const gasLimit = 21000n;
    const amount = ethers.parseEther(process.env.FUND_VALUE || '0.01');
    const total = amount + gasLimit * BigInt(maxFee.toString());
    console.log('Relayer address:', relAddr);
    console.log('Relayer balance (ETH):', ethers.formatEther(balance));
    console.log('Desired fund amount (ETH):', ethers.formatEther(amount));
    console.log('gasLimit:', gasLimit.toString());
    console.log('maxFeePerGas (gwei):', ethers.formatUnits(maxFee,'gwei'));
    console.log('maxPriorityFeePerGas (gwei):', ethers.formatUnits(maxPriority,'gwei'));
    console.log('Estimated total cost (ETH) = amount + gasLimit*maxFeePerGas:', ethers.formatEther(total));
    console.log('Sufficient funds?', balance>=total);
    if(balance<total){
      const short = total - balance;
      console.log('Short by (ETH):', ethers.formatEther(short));
    }
  }catch(e){
    console.error('Error', e.message || e);
    process.exit(1);
  }
})();
