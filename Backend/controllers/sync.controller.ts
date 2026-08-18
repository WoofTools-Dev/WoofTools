import { Request, Response } from "express";
import { wrappedResponse } from "../utils/functions";
import { ChainKey, blockchainConfig } from "../configs/blockchain.config";
import {
  syncDashboardData,
  syncHotPairs,
  syncLivePairs,
  syncSwapTransactions,
  syncDailyRanking,
} from "../services/syncers";

const VALID_CHAINS: ChainKey[] = ["ethereum", "shibarium"];

export const syncAll = async (req: Request, res: Response) => {
  const syncSecret = process.env.SYNC_SECRET;
  if (syncSecret && req.headers["x-sync-secret"] !== syncSecret) {
    return wrappedResponse(res, "Unauthorized", 401, null);
  }

  const chain = (String(req.query.chain || "ethereum") as ChainKey);
  if (!VALID_CHAINS.includes(chain)) {
    return wrappedResponse(res, "chain must be 'ethereum' or 'shibarium'", 400, null);
  }

  const startedAt = Date.now();
  const results: Record<string, any> = {};

  try {
    results.dashboardData = await syncDashboardData(chain);
    results.hotPairs = await syncHotPairs(chain);
    results.livePairs = await syncLivePairs(chain);
    results.swapTransactions = await syncSwapTransactions(chain);
    results.dailyRanking = await syncDailyRanking(chain);
  } catch (err: any) {
    return wrappedResponse(res, `Sync failed: ${err.message}`, 500, results);
  }

  const elapsed = Date.now() - startedAt;
  return res.status(200).json({
    available: true,
    data: {
      chain,
      elapsed,
      results,
    },
  });
};

export const getSyncStatus = async (_req: Request, res: Response) => {
  return res.status(200).json({
    available: true,
    data: {
      providers: {
        theGraph: !!process.env.THE_GRAPH_API_KEY,
        coingecko: !!process.env.COINGECKO_API_KEY,
        ethereumRpc: !!process.env.ETHEREUM_RPC_URL,
        shibariumRpc: !!process.env.SHIBARIUM_RPC_URL,
      },
      chains: VALID_CHAINS,
      syncEndpoint: "POST /api/sync/all?chain=ethereum|shibarium",
    },
  });
};
