import { PrismaClient } from "@prisma/client";
import {
  syncDashboardData,
  syncHotPairs,
  syncLivePairs,
  syncSwapTransactions,
  syncDailyRanking,
} from "../services/syncers";

const prisma = new PrismaClient();

const chains = ["ethereum", "shibarium"] as const;

async function main() {
  console.log("Seeding database with real blockchain data...\n");

  console.log("Cleaning existing data...");
  await prisma.dashboardData.deleteMany();
  await prisma.livePair.deleteMany();
  await prisma.swapTransaction.deleteMany();
  await prisma.hotPair.deleteMany();
  await prisma.dailyWinner.deleteMany();
  await prisma.dailyLoser.deleteMany();
  await prisma.entityLike.deleteMany();
  console.log("  ✓ Cleaned all tables\n");

  for (const chain of chains) {
    console.log(`--- Syncing ${chain} ---`);

    try {
      const dashboard = await syncDashboardData(chain);
      console.log(`  ✓ DashboardData: ${dashboard.created} created, ${dashboard.updated} updated, ${dashboard.errors} errors`);
    } catch (e) {
      console.error(`  ✗ DashboardData failed:`, e);
    }

    try {
      const hotPairs = await syncHotPairs(chain);
      console.log(`  ✓ HotPair: ${hotPairs.created} created, ${hotPairs.updated} updated, ${hotPairs.errors} errors`);
    } catch (e) {
      console.error(`  ✗ HotPair failed:`, e);
    }

    try {
      const livePairs = await syncLivePairs(chain);
      console.log(`  ✓ LivePair: ${livePairs.created} created, ${livePairs.updated} updated, ${livePairs.errors} errors`);
    } catch (e) {
      console.error(`  ✗ LivePair failed:`, e);
    }

    try {
      const swaps = await syncSwapTransactions(chain);
      console.log(`  ✓ SwapTransaction: ${swaps.created} created, ${swaps.updated} updated, ${swaps.errors} errors`);
    } catch (e) {
      console.error(`  ✗ SwapTransaction failed:`, e);
    }

    try {
      const ranking = await syncDailyRanking(chain);
      console.log(`  ✓ DailyRanking: ${ranking.created} created, ${ranking.updated} updated, ${ranking.errors} errors`);
    } catch (e) {
      console.error(`  ✗ DailyRanking failed:`, e);
    }

    console.log("");
  }

  const counts = await Promise.all([
    prisma.dashboardData.count(),
    prisma.hotPair.count(),
    prisma.livePair.count(),
    prisma.swapTransaction.count(),
    prisma.dailyWinner.count(),
    prisma.dailyLoser.count(),
  ]);

  console.log("Seeded successfully with real blockchain data!");
  console.log("Total records:");
  console.log(`  • DashboardData: ${counts[0]}`);
  console.log(`  • HotPair: ${counts[1]}`);
  console.log(`  • LivePair: ${counts[2]}`);
  console.log(`  • SwapTransaction: ${counts[3]}`);
  console.log(`  • DailyWinner: ${counts[4]}`);
  console.log(`  • DailyLoser: ${counts[5]}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
