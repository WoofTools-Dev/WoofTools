import { ethers } from "ethers";
import { blockchainConfig, ChainKey } from "../../configs/blockchain.config";
import { cache } from "../cache.service";

const CACHE_TTL = 5 * 60 * 1000;

const UNISWAP_V3_POOL_ABI = [
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function liquidity() view returns (uint128)",
  "function slot0() view returns (uint160, int24, uint16, uint16, uint16, uint8, bool)",
];

const UNISWAP_V3_FACTORY_ABI = [
  "function getPool(address, address, uint24) view returns (address)",
];

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
];

function getProvider(chainKey: ChainKey): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(blockchainConfig[chainKey].rpcUrl);
}

export async function getPoolInfo(
  poolAddress: string,
  chainKey: ChainKey
): Promise<{
  token0Address: string;
  token1Address: string;
  token0Symbol: string;
  token1Symbol: string;
  liquidity: bigint;
  sqrtPriceX96: bigint;
  tick: number;
} | null> {
  const cacheKey = `onchain:pool:${chainKey}:${poolAddress}`;
  const cached = cache.get<any>(cacheKey);
  if (cached) return cached;

  try {
    const provider = getProvider(chainKey);
    const pool = new ethers.Contract(poolAddress, UNISWAP_V3_POOL_ABI, provider);

    const [token0Addr, token1Addr, liquidity, slot0] = await Promise.all([
      pool.token0(),
      pool.token1(),
      pool.liquidity(),
      pool.slot0(),
    ]);

    const t0 = new ethers.Contract(token0Addr, ERC20_ABI, provider);
    const t1 = new ethers.Contract(token1Addr, ERC20_ABI, provider);
    const [sym0, sym1] = await Promise.all([t0.symbol(), t1.symbol()]);

    const result = {
      token0Address: token0Addr,
      token1Address: token1Addr,
      token0Symbol: sym0,
      token1Symbol: sym1,
      liquidity,
      sqrtPriceX96: slot0[0],
      tick: slot0[1],
    };

    cache.set(cacheKey, result, CACHE_TTL);
    return result;
  } catch (err) {
    console.error(`getPoolInfo failed for ${poolAddress}:`, err);
    return null;
  }
}

export async function getRecentSwapsFromLogs(
  pairAddress: string,
  chainKey: ChainKey,
  fromBlockOffset: number = 1000
): Promise<
  {
    type: "BUY" | "SELL";
    amount0: number;
    amount1: number;
    price: number;
    timestamp: Date;
    txHash: string;
  }[]
> {
  const cacheKey = `onchain:swaps:${chainKey}:${pairAddress}`;
  const cached = cache.get<any[]>(cacheKey);
  if (cached) return cached;

  try {
    const provider = getProvider(chainKey);
    const poolInfo = await getPoolInfo(pairAddress, chainKey);
    if (!poolInfo) return [];

    const SWAP_TOPIC = ethers.id("Swap(address,address,int256,int256,uint160,uint128,int24)");
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - fromBlockOffset);

    const logs = await provider.getLogs({
      address: pairAddress,
      topics: [SWAP_TOPIC],
      fromBlock,
      toBlock: currentBlock,
    });

    const results = [];
    for (const log of logs.slice(-50)) {
      const block = await provider.getBlock(log.blockNumber);
      if (!block) continue;

      const amount0 = BigInt(log.data.slice(0, 66));
      const amount1 = BigInt("0x" + log.data.slice(66, 130));

      results.push({
        type: amount0 > BigInt(0) ? ("SELL" as const) : ("BUY" as const),
        amount0: Number(ethers.formatUnits(amount0 < BigInt(0) ? -amount0 : amount0, 18)),
        amount1: Number(ethers.formatUnits(amount1 < BigInt(0) ? -amount1 : amount1, 18)),
        price: Number(ethers.formatUnits(poolInfo.sqrtPriceX96, 18)),
        timestamp: new Date(block.timestamp * 1000),
        txHash: log.transactionHash,
      });
    }

    cache.set(cacheKey, results, CACHE_TTL);
    return results;
  } catch (err) {
    console.error(`getRecentSwapsFromLogs failed for ${pairAddress}:`, err);
    return [];
  }
}

export async function getERC20Balance(
  tokenAddress: string,
  walletAddress: string,
  chainKey: ChainKey
): Promise<{ balance: string; decimals: number }> {
  const provider = getProvider(chainKey);
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const [bal, decimals] = await Promise.all([
    token.balanceOf(walletAddress),
    token.decimals(),
  ]);
  return {
    balance: ethers.formatUnits(bal, decimals),
    decimals,
  };
}
