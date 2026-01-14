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
    const owner = process.env.DEPLOYER_ADDRS || process.env.OWNER_ADDRESS || (process.env.PRIVATE_KEY? (new ethers.Wallet(process.env.PRIVATE_KEY)).address : null);
    if(!owner){ console.error('Owner address not found'); process.exit(1); }
    const balance = await provider.getBalance(relAddr);
    console.log('Relayer:', relAddr);
    console.log('Owner target:', owner);
    console.log('Relayer balance (ETH):', ethers.formatEther(balance));

    const amount = ethers.parseEther(process.env.FUND_VALUE || '0.01');
    const feeData = await provider.getFeeData();
    const maxFee = feeData.maxFeePerGas || ethers.parseUnits('50','gwei');
    const maxPriority = feeData.maxPriorityFeePerGas || ethers.parseUnits('2','gwei');
    const gasLimit = 21000n;
    const total = amount + gasLimit * BigInt(maxFee.toString());
    console.log('Amount (ETH):', ethers.formatEther(amount));
    console.log('maxFeePerGas (gwei):', ethers.formatUnits(maxFee,'gwei'));
    console.log('Estimated total cost (ETH):', ethers.formatEther(total));
    if(balance < total){ console.error('Insufficient relayer funds to cover amount+max-fee. Aborting.'); process.exit(2); }

    const tx = await wallet.sendTransaction({ to: owner, value: amount, gasLimit, maxFeePerGas: maxFee, maxPriorityFeePerGas: maxPriority });
    console.log('Sent tx hash:', tx.hash);
    const rc = await tx.wait();
    console.log('Tx confirmed in block', rc.blockNumber, 'hash', rc.transactionHash);
  }catch(e){ console.error('Error', e.message || e); process.exit(1); }
})();
