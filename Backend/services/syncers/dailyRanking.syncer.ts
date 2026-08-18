import prisma from "../../configs/prisma.config";
import { graphService, coingeckoService } from "../providers";
import { ChainKey } from "../../configs/blockchain.config";

export interface SyncResult {
  chain: ChainKey;
  created: number;
  updated: number;
  errors: number;
}

export async function syncDailyRanking(chain: ChainKey): Promise<SyncResult> {
  const result: SyncResult = { chain, created: 0, updated: 0, errors: 0 };
  const chainId = chain === "ethereum" ? 1 : 109;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const topCoins = await coingeckoService.getTopCoinsByMarketCap(50);
    const sorted = [...topCoins].sort((a, b) => b.change24h - a.change24h);
    const winners = sorted.slice(0, 10);
    const losers = sorted.slice(-10).reverse();

    for (const coin of winners) {
      try {
        const existing = await prisma.dailyWinner.findFirst({
          where: {
            chainId,
            date: today,
            username: coin.symbol.toUpperCase(),
          },
        });

        if (existing) {
          await prisma.dailyWinner.update({
            where: { id: existing.id },
            data: {
              price: coin.price,
              growthPercentage: coin.change24h,
              source: "coingecko",
              lastSyncedAt: new Date(),
            },
          });
          result.updated++;
        } else {
          await prisma.dailyWinner.create({
            data: {
              username: coin.symbol.toUpperCase(),
              date: today,
              price: coin.price,
              previousPrices: [coin.price],
              previousTimes: [Math.floor(Date.now() / 1000)],
              growthPercentage: coin.change24h,
              chain,
              chainId,
              source: "coingecko",
              lastSyncedAt: new Date(),
            },
          });
          result.created++;
        }
      } catch (err) {
        console.error(`syncDailyRanking: winner error for ${coin.symbol}:`, err);
        result.errors++;
      }
    }

    for (const coin of losers) {
      try {
        const existing = await prisma.dailyLoser.findFirst({
          where: {
            chainId,
            date: today,
            username: coin.symbol.toUpperCase(),
          },
        });

        if (existing) {
          await prisma.dailyLoser.update({
            where: { id: existing.id },
            data: {
              price: coin.price,
              growthPercentage: coin.change24h,
              source: "coingecko",
              lastSyncedAt: new Date(),
            },
          });
          result.updated++;
        } else {
          await prisma.dailyLoser.create({
            data: {
              username: coin.symbol.toUpperCase(),
              date: today,
              price: coin.price,
              previousPrices: [coin.price],
              previousTimes: [Math.floor(Date.now() / 1000)],
              growthPercentage: coin.change24h,
              chain,
              chainId,
              source: "coingecko",
              lastSyncedAt: new Date(),
            },
          });
          result.created++;
        }
      } catch (err) {
        console.error(`syncDailyRanking: loser error for ${coin.symbol}:`, err);
        result.errors++;
      }
    }
  } catch (err) {
    console.error(`syncDailyRanking: failed for ${chain}:`, err);
    result.errors++;
  }

  return result;
}
