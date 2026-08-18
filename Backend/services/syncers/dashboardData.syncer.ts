import prisma from "../../configs/prisma.config";
import { graphService, coingeckoService } from "../providers";
import { ChainKey } from "../../configs/blockchain.config";

export interface SyncResult {
  chain: ChainKey;
  created: number;
  updated: number;
  errors: number;
}

export async function syncDashboardData(chain: ChainKey): Promise<SyncResult> {
  const result: SyncResult = { chain, created: 0, updated: 0, errors: 0 };
  const chainId = chain === "ethereum" ? 1 : 109;

  try {
    const pairs = await graphService.getTopPairs(30);

    for (const pair of pairs) {
      try {
        const existing = await prisma.dashboardData.findUnique({
          where: { chainId_pairAddress: { chainId, pairAddress: pair.pairAddress } },
        });

        const percentage24H = pair.volume24h > 0
          ? (pair.volume24h / (pair.liquidity || 1)) * 100
          : 0;

        const score = existing?.score ?? 0;

        if (existing) {
          await prisma.dashboardData.update({
            where: { id: existing.id },
            data: {
              price: pair.price,
              percentage24H,
              volume: formatLargeNumber(pair.volume24h),
              swaps: String(pair.swaps),
              liquidity: formatLargeNumber(pair.liquidity),
              source: `graph-${chain}`,
              lastSyncedAt: new Date(),
              updatedAt: new Date(),
            },
          });
          result.updated++;
        } else {
          await prisma.dashboardData.create({
            data: {
              token0Name: pair.token0,
              token1Name: pair.token1,
              pairAddress: pair.pairAddress,
              price: pair.price,
              percentage24H,
              score,
              contracts: pair.pairAddress,
              created: pair.created,
              volume: formatLargeNumber(pair.volume24h),
              swaps: String(pair.swaps),
              liquidity: formatLargeNumber(pair.liquidity),
              marketCap: "N/A",
              dex: ["Uniswap V3"],
              chain,
              chainId,
              source: `graph-${chain}`,
              lastSyncedAt: new Date(),
            },
          });
          result.created++;
        }
      } catch (err) {
        console.error(`syncDashboardData: error on pair ${pair.pairAddress}:`, err);
        result.errors++;
      }
    }
  } catch (err) {
    console.error(`syncDashboardData: failed to fetch from Graph for ${chain}:`, err);
    result.errors++;
  }

  return result;
}

function formatLargeNumber(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}
