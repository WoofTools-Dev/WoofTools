import cron from "node-cron";
import {
  syncDashboardData,
  syncHotPairs,
  syncLivePairs,
  syncSwapTransactions,
  syncDailyRanking,
} from "./services/syncers";
import { ChainKey } from "./configs/blockchain.config";

const chains: ChainKey[] = ["ethereum", "shibarium"];

const DASHBOARD_CRON = process.env.SYNC_DASHBOARD_CRON || "*/1 * * * *";
const HEAVY_CRON = process.env.SYNC_HEAVY_CRON || "*/30 * * * *";

let dashboardRunning = false;
let heavyRunning = false;

async function runDashboardSync() {
  if (dashboardRunning) return;
  dashboardRunning = true;
  try {
    for (const chain of chains) {
      try {
        await syncDashboardData(chain);
        await syncHotPairs(chain);
      } catch (err) {
        console.error(`scheduler: dashboard sync failed for ${chain}:`, err);
      }
    }
  } finally {
    dashboardRunning = false;
  }
}

async function runHeavySync() {
  if (heavyRunning) return;
  heavyRunning = true;
  try {
    for (const chain of chains) {
      try {
        await syncLivePairs(chain);
        await syncSwapTransactions(chain);
        await syncDailyRanking(chain);
      } catch (err) {
        console.error(`scheduler: heavy sync failed for ${chain}:`, err);
      }
    }
  } finally {
    heavyRunning = false;
  }
}

export function startScheduler() {
  if (!cron.validate(DASHBOARD_CRON)) {
    console.error(`scheduler: invalid DASHBOARD_CRON "${DASHBOARD_CRON}", skipping`);
  } else {
    cron.schedule(DASHBOARD_CRON, runDashboardSync);
    console.log(`scheduler: dashboard sync scheduled (${DASHBOARD_CRON})`);
  }

  if (!cron.validate(HEAVY_CRON)) {
    console.error(`scheduler: invalid HEAVY_CRON "${HEAVY_CRON}", skipping`);
  } else {
    cron.schedule(HEAVY_CRON, runHeavySync);
    console.log(`scheduler: heavy sync scheduled (${HEAVY_CRON})`);
  }
}
