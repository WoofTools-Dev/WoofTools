jest.mock("../configs/prisma.config", () => ({
  __esModule: true,
  default: {
    dashboardData: {
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    hotPair: {
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    livePair: {
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    swapTransaction: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    dailyRanking: {
      findMany: jest.fn().mockResolvedValue([]),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
  },
}));

jest.mock("../services/providers", () => ({
  graphService: {
    getTopPairs: jest.fn().mockRejectedValue(new Error("no network")),
    getNewPairs: jest.fn().mockRejectedValue(new Error("no network")),
    getRecentSwaps: jest.fn().mockRejectedValue(new Error("no network")),
    getPoolSwaps: jest.fn().mockRejectedValue(new Error("no network")),
    getPools: jest.fn().mockRejectedValue(new Error("no network")),
  },
  coingeckoService: {
    getTopCoinsByMarketCap: jest.fn().mockRejectedValue(new Error("no network")),
    getTrendingCoins: jest.fn().mockRejectedValue(new Error("no network")),
    getTokenPrices: jest.fn().mockRejectedValue(new Error("no network")),
    searchCoins: jest.fn().mockRejectedValue(new Error("no network")),
  },
}));

import * as Syncers from "../services/syncers";

describe("Syncers module exports", () => {
  it("should export syncDashboardData", () => {
    expect(typeof Syncers.syncDashboardData).toBe("function");
  });

  it("should export syncHotPairs", () => {
    expect(typeof Syncers.syncHotPairs).toBe("function");
  });

  it("should export syncLivePairs", () => {
    expect(typeof Syncers.syncLivePairs).toBe("function");
  });

  it("should export syncSwapTransactions", () => {
    expect(typeof Syncers.syncSwapTransactions).toBe("function");
  });

  it("should export syncDailyRanking", () => {
    expect(typeof Syncers.syncDailyRanking).toBe("function");
  });
});

describe("Sync result shapes", () => {
  it("syncDashboardData should return SyncResult shape", async () => {
    const result = await Syncers.syncDashboardData("ethereum");
    expect(result).toHaveProperty("chain", "ethereum");
    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("updated");
    expect(result).toHaveProperty("errors");
    expect(typeof result.created).toBe("number");
    expect(typeof result.updated).toBe("number");
    expect(typeof result.errors).toBe("number");
  });

  it("syncHotPairs should return SyncResult shape", async () => {
    const result = await Syncers.syncHotPairs("ethereum");
    expect(result).toHaveProperty("chain", "ethereum");
    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("updated");
    expect(result).toHaveProperty("errors");
  });

  it("syncLivePairs should return SyncResult shape", async () => {
    const result = await Syncers.syncLivePairs("ethereum");
    expect(result).toHaveProperty("chain", "ethereum");
    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("updated");
    expect(result).toHaveProperty("errors");
  });
});

describe("Blockchain config", () => {
  it("should export valid chain configs", async () => {
    const { blockchainConfig } = await import("../configs/blockchain.config");

    expect(blockchainConfig.ethereum).toBeDefined();
    expect(blockchainConfig.ethereum.chainId).toBe(1);
    expect(blockchainConfig.ethereum.rpcUrl).toBeTruthy();
    expect(blockchainConfig.ethereum.dexFactory).toMatch(/^0x/);

    expect(blockchainConfig.shibarium).toBeDefined();
    expect(blockchainConfig.shibarium.chainId).toBe(109);
    expect(blockchainConfig.shibarium.rpcUrl).toBeTruthy();
  });
});
