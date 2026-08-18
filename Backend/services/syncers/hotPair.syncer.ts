import prisma from "../../configs/prisma.config";
import { graphService, dexscreenerService } from "../providers";
import { ChainKey } from "../../configs/blockchain.config";

export interface SyncResult {
  chain: ChainKey;
  created: number;
  updated: number;
  errors: number;
}

export async function syncHotPairs(chain: ChainKey): Promise<SyncResult> {
  const result: SyncResult = { chain, created: 0, updated: 0, errors: 0 };
  const chainId = chain === "ethereum" ? 1 : 109;

  try {
    let pairs: { pairAddress: string; token0: string; token1: string; price: number; volume24h: number; liquidity: number; swaps: number; created: Date }[];

    try {
      pairs = await graphService.getTopPairs(10);
    } catch {
      pairs = await dexscreenerService.getTopPairsFromDexScreener(chain, 10);
    }

    for (const pair of pairs) {
      try {
        const pairName = `${pair.token0}/${pair.token1}`;
        const existing = await prisma.hotPair.findUnique({
          where: { chainId_pairName: { chainId, pairName } },
        });

        const growthPct = pair.volume24h > 0
          ? (pair.volume24h / (pair.liquidity || 1)) * 100
          : 0;

        if (existing) {
          await prisma.hotPair.update({
            where: { id: existing.id },
            data: {
              price: pair.price,
              growthPercentage: growthPct,
              previousPrices: [...(existing.previousPrices || []).slice(-23), pair.price],
              previousTimes: [...(existing.previousTimes || []).slice(-23), Math.floor(Date.now() / 1000)],
              source: `graph-${chain}`,
              lastSyncedAt: new Date(),
            },
          });
          result.updated++;
        } else {
          await prisma.hotPair.create({
            data: {
              pairName,
              price: pair.price,
              growthPercentage: growthPct,
              popularity: 0,
              previousPrices: [pair.price],
              previousTimes: [Math.floor(Date.now() / 1000)],
              chain,
              chainId,
              source: `graph-${chain}`,
              lastSyncedAt: new Date(),
            },
          });
          result.created++;
        }
      } catch (err) {
        console.error(`syncHotPairs: error on pair ${pair.token0}/${pair.token1}:`, err);
        result.errors++;
      }
    }
  } catch (err) {
    console.error(`syncHotPairs: failed for ${chain}:`, err);
    result.errors++;
  }

  return result;
}
