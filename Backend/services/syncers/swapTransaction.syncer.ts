import prisma from "../../configs/prisma.config";
import { graphService } from "../providers";
import { ChainKey } from "../../configs/blockchain.config";

export interface SyncResult {
  chain: ChainKey;
  created: number;
  updated: number;
  errors: number;
}

export async function syncSwapTransactions(chain: ChainKey): Promise<SyncResult> {
  const result: SyncResult = { chain, created: 0, updated: 0, errors: 0 };
  const chainId = chain === "ethereum" ? 1 : 109;

  try {
    const pairs = await graphService.getTopPairs(5);
    const topPair = pairs[0];
    if (!topPair) return result;

    const swaps = await graphService.getRecentSwaps(topPair.pairAddress, 50);

    for (const swap of swaps) {
      try {
        const txHash = `graph-${chain}-${swap.timestamp.getTime()}-${swap.amountUSD}`;
        const exists = await prisma.swapTransaction.findUnique({
          where: { chainId_txHash: { chainId, txHash } },
        });

        if (exists) continue;

        await prisma.swapTransaction.create({
          data: {
            type: swap.type,
            token0Name: swap.token0Symbol,
            token1Name: swap.token1Symbol,
            pairAddress: topPair.pairAddress,
            executionTime: swap.timestamp,
            quantity: swap.amount0 + swap.amount1,
            totalETH: swap.amountUSD,
            totalUSD: swap.amountUSD,
            variation: 0,
            maker: "graph-swap",
            txHash,
            chain,
            chainId,
            source: `graph-${chain}`,
            lastSyncedAt: new Date(),
          },
        });
        result.created++;
      } catch (err) {
        console.error(`syncSwapTransactions: error:`, err);
        result.errors++;
      }
    }
  } catch (err) {
    console.error(`syncSwapTransactions: failed for ${chain}:`, err);
    result.errors++;
  }

  return result;
}
