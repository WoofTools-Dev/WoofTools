import prisma from "../../configs/prisma.config";
import { graphService } from "../providers";
import { ChainKey } from "../../configs/blockchain.config";

export interface SyncResult {
  chain: ChainKey;
  created: number;
  updated: number;
  errors: number;
}

export async function syncLivePairs(chain: ChainKey): Promise<SyncResult> {
  const result: SyncResult = { chain, created: 0, updated: 0, errors: 0 };
  const chainId = chain === "ethereum" ? 1 : 109;

  try {
    const newPairs = await graphService.getNewPairs(48, 20);

    for (const pair of newPairs) {
      try {
        const existing = await prisma.livePair.findUnique({
          where: { chainId_pairAddress: { chainId, pairAddress: pair.pairAddress } },
        });

        if (existing) {
          await prisma.livePair.update({
            where: { id: existing.id },
            data: {
              totalLiquidity: formatUSD(pair.currentLiquidity),
              source: `graph-${chain}`,
              lastSyncedAt: new Date(),
            },
          });
          result.updated++;
        } else {
          await prisma.livePair.create({
            data: {
              token0Name: pair.token0,
              token1Name: pair.token1,
              pairAddress: pair.pairAddress,
              listedSince: pair.createdAt,
              tokenPriceUSD: 0,
              initialLiquidity: formatUSD(pair.initialLiquidity),
              totalLiquidity: formatUSD(pair.currentLiquidity),
              poolAmount: "0",
              poolVariation: 0,
              poolRemaining: formatUSD(pair.currentLiquidity),
              contract: pair.pairAddress,
              chain,
              chainId,
              source: `graph-${chain}`,
              lastSyncedAt: new Date(),
            },
          });
          result.created++;
        }
      } catch (err) {
        console.error(`syncLivePairs: error on pair ${pair.pairAddress}:`, err);
        result.errors++;
      }
    }
  } catch (err) {
    console.error(`syncLivePairs: failed for ${chain}:`, err);
    result.errors++;
  }

  return result;
}

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}
