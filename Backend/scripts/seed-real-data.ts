import "dotenv/config";
import prisma from "../configs/prisma.config";
import {
  syncDashboardData,
  syncHotPairs,
  syncLivePairs,
  syncSwapTransactions,
  syncDailyRanking,
} from "../services/syncers";

async function main() {
  console.log("🔄 Starting real data sync...\n");

  const chains = ["ethereum", "shibarium"] as const;

  for (const chain of chains) {
    console.log(`\n=== Syncing ${chain} ===`);

    console.log("  📊 DashboardData...");
    const dd = await syncDashboardData(chain);
    console.log(`     created: ${dd.created}, updated: ${dd.updated}, errors: ${dd.errors}`);

    console.log("  🔥 HotPairs...");
    const hp = await syncHotPairs(chain);
    console.log(`     created: ${hp.created}, updated: ${hp.updated}, errors: ${hp.errors}`);

    console.log("  🆕 LivePairs...");
    const lp = await syncLivePairs(chain);
    console.log(`     created: ${lp.created}, updated: ${lp.updated}, errors: ${lp.errors}`);

    console.log("  💱 SwapTransactions...");
    const st = await syncSwapTransactions(chain);
    console.log(`     created: ${st.created}, updated: ${st.updated}, errors: ${st.errors}`);

    console.log("  🏆 DailyRanking...");
    const dr = await syncDailyRanking(chain);
    console.log(`     created: ${dr.created}, updated: ${dr.updated}, errors: ${dr.errors}`);
  }

  console.log("\n✅ Sync complete!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("❌ Sync failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
