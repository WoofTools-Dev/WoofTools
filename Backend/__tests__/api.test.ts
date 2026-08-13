import http from "http";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import app from "../app";

const TEST_DB_URL = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace(/\/[^/]+$/, "/wooftools_test")
  : "postgresql://postgres:admin123@localhost:5432/wooftools_test";

process.env.DATABASE_URL = TEST_DB_URL;

let server: http.Server;
let baseUrl: string;
const prisma = new PrismaClient();

function request(
  method: string,
  path: string,
  body?: any
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: parseInt(url.port, 10),
      path: url.pathname + url.search,
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
    };

    const req = http.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode || 500, data: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode || 500, data: raw });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

beforeAll(async () => {
  try {
    execSync(
      `npx prisma db push --accept-data-loss --force-reset`,
      {
        env: { ...process.env, DATABASE_URL: TEST_DB_URL },
        stdio: "pipe",
      }
    );
  } catch (e: any) {
    console.warn("db push warning (may be first run):", e.stderr?.toString().slice(0, 200));
  }

  server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
});

afterAll(async () => {
  server.close();
  await prisma.$disconnect();
});

let dashboardId: number;
let livePairId: number;
let swapId: number;
let winnerId: number;
let loserId: number;
let hotPairId: number;
let rrssId: number;

const now = new Date();

describe("DashboardData — CRUD", () => {
  const payload = {
    token0Name: "ETH",
    token1Name: "USDC",
    pairAddress: "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
    price: 3450.5,
    percentage24H: 5.2,
    score: 0,
    contracts: "0x8ad5...e6d8",
    created: now.toISOString(),
    volume: "45.2M",
    swaps: "12.5K",
    liquidity: "850K",
    marketCap: "12.5M",
    dex: ["uniswap", "eth"],
    chain: "ethereum",
  };

  test("POST /api/dashboard/data — creates record", async () => {
    const { status, data } = await request("POST", "/api/dashboard/data", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
    expect(data.token0Name).toBe("ETH");
    expect(data.chain).toBe("ethereum");
    dashboardId = data.id;
  });

  test("GET /api/dashboard/data — returns list", async () => {
    const { status, data } = await request("GET", "/api/dashboard/data");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
  });

  test("GET /api/dashboard/data?chain=ethereum — filters by chain", async () => {
    const { status, data } = await request("GET", "/api/dashboard/data?chain=ethereum");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
    expect(data.every((r: any) => r.chain === "ethereum")).toBe(true);
  });

  test("GET /api/dashboard/data?chain=shibarium — empty for unknown chain", async () => {
    const { status, data } = await request("GET", "/api/dashboard/data?chain=shibarium");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toEqual([]);
  });

  test("GET /api/dashboard/data/:id — returns single record", async () => {
    const { status, data } = await request("GET", `/api/dashboard/data/${dashboardId}`);
    expect(status).toBe(200);
    expect(data.id).toBe(dashboardId);
  });

  test("GET /api/dashboard/data/:id — 404 for unknown id", async () => {
    const { status } = await request("GET", "/api/dashboard/data/99999");
    expect(status).toBe(404);
  });

  test("DELETE /api/dashboard/data/:id — deletes record", async () => {
    const { status } = await request("DELETE", `/api/dashboard/data/${dashboardId}`);
    expect(status).toBe(204);
    const { data } = await request("GET", "/api/dashboard/data");
    expect(data.find((r: any) => r.id === dashboardId)).toBeUndefined();
  });

  test("POST /api/dashboard/data — rejects empty body", async () => {
    const { status } = await request("POST", "/api/dashboard/data", {});
    expect(status).toBe(500);
  });

  test("POST /api/dashboard/data — rejects null body", async () => {
    const { status } = await request("POST", "/api/dashboard/data", null);
    expect(status).toBe(500);
  });
});

describe("LivePair — CRUD", () => {
  const payload = {
    token0Name: "BONK",
    token1Name: "WETH",
    pairAddress: "0x4ae3e4619c7e1ff5adc5e7a7d3ef7eaa0a8f9c91",
    listedSince: now.toISOString(),
    tokenPriceUSD: 0.0000456,
    initialLiquidity: "0.5 ETH",
    totalLiquidity: "15%",
    poolAmount: "0.575 ETH",
    poolVariation: 15,
    poolRemaining: "2.1 ETH",
    contract: "0x4ae3...9c91",
    chain: "ethereum",
  };

  test("POST /api/live-pairs — creates record", async () => {
    const { status, data } = await request("POST", "/api/live-pairs", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
    expect(data.chain).toBe("ethereum");
    livePairId = data.id;
  });

  test("GET /api/live-pairs — returns list", async () => {
    const { status, data } = await request("GET", "/api/live-pairs");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
  });

  test("GET /api/live-pairs?chain=ethereum — filters by chain", async () => {
    const { status, data } = await request("GET", "/api/live-pairs?chain=ethereum");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
    expect(data.every((r: any) => r.chain === "ethereum")).toBe(true);
  });

  test("GET /api/live-pairs/:id — returns single", async () => {
    const { status, data } = await request("GET", `/api/live-pairs/${livePairId}`);
    expect(status).toBe(200);
    expect(data.id).toBe(livePairId);
  });

  test("GET /api/live-pairs/:id — 404", async () => {
    const { status } = await request("GET", "/api/live-pairs/99999");
    expect(status).toBe(404);
  });

  test("DELETE /api/live-pairs/:id — deletes", async () => {
    const { status } = await request("DELETE", `/api/live-pairs/${livePairId}`);
    expect(status).toBe(204);
  });
});

describe("SwapTransaction — CRUD", () => {
  const payload = {
    token0Name: "WETH",
    token1Name: "USDC",
    pairAddress: "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
    executionTime: now.toISOString(),
    type: "BUY",
    quantity: 150.5,
    totalETH: 150.5,
    totalUSD: 519225,
    variation: -2.3,
    maker: "0x742d35cc6634c0532925a3b844bc427e2778e34e",
    chain: "ethereum",
  };

  test("POST /api/swaps — creates record", async () => {
    const { status, data } = await request("POST", "/api/swaps", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
    expect(data.chain).toBe("ethereum");
    swapId = data.id;
  });

  test("GET /api/swaps — returns list", async () => {
    const { status, data } = await request("GET", "/api/swaps");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
  });

  test("GET /api/swaps?chain=ethereum — filters by chain", async () => {
    const { status, data } = await request("GET", "/api/swaps?chain=ethereum");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
    expect(data.every((r: any) => r.chain === "ethereum")).toBe(true);
  });

  test("GET /api/swaps/:id — returns single", async () => {
    const { status, data } = await request("GET", `/api/swaps/${swapId}`);
    expect(status).toBe(200);
    expect(data.id).toBe(swapId);
  });

  test("GET /api/swaps/:id — 404", async () => {
    const { status } = await request("GET", "/api/swaps/99999");
    expect(status).toBe(404);
  });

  test("DELETE /api/swaps/:id — deletes", async () => {
    const { status } = await request("DELETE", `/api/swaps/${swapId}`);
    expect(status).toBe(204);
  });
});

describe("DailyWinner — full CRUD (prefix /dailyWinner)", () => {
  const payload = {
    username: "winner1",
    date: now.toISOString(),
    walletAddress: "0xwinner",
    price: 100.5,
    previousPrices: [95.0, 98.0],
    growthPercentage: 5.0,
    chain: "ethereum",
  };

  test("POST /dailyWinner/daily-winners — creates", async () => {
    const { status, data } = await request("POST", "/dailyWinner/daily-winners", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
    expect(data.chain).toBe("ethereum");
    winnerId = data.id;
  });

  test("GET /dailyWinner/daily-winners — returns list", async () => {
    const { status, data } = await request("GET", "/dailyWinner/daily-winners");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
  });

  test("GET /dailyWinner/daily-winners?chain=ethereum — filters by chain", async () => {
    const { status, data } = await request("GET", "/dailyWinner/daily-winners?chain=ethereum");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
    expect(data.every((r: any) => r.chain === "ethereum")).toBe(true);
  });

  test("GET /dailyWinner/daily-winners?chain=shibarium — empty for unknown chain", async () => {
    const { status, data } = await request("GET", "/dailyWinner/daily-winners?chain=shibarium");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toEqual([]);
  });

  test("GET /dailyWinner/daily-winners/:id — returns single", async () => {
    const { status, data } = await request("GET", `/dailyWinner/daily-winners/${winnerId}`);
    expect(status).toBe(200);
    expect(data.id).toBe(winnerId);
  });

  test("PUT /dailyWinner/daily-winners/:id — updates record", async () => {
    const { status, data } = await request("PUT", `/dailyWinner/daily-winners/${winnerId}`, {
      price: 200.0,
    });
    expect(status).toBe(200);
    expect(data.price).toBe(200.0);
  });

  test("PUT /dailyWinner/daily-winners/:id — 404 for unknown", async () => {
    const { status } = await request("PUT", "/dailyWinner/daily-winners/99999", {
      price: 999,
    });
    expect(status).toBe(404);
  });

  test("GET /dailyWinner/daily-winners/:id — 404", async () => {
    const { status } = await request("GET", "/dailyWinner/daily-winners/99999");
    expect(status).toBe(404);
  });

  test("DELETE /dailyWinner/daily-winners/:id — deletes", async () => {
    const { status } = await request("DELETE", `/dailyWinner/daily-winners/${winnerId}`);
    expect(status).toBe(204);
  });
});

describe("DailyLoser — full CRUD (prefix /dailyLoser)", () => {
  const payload = {
    username: "loser1",
    date: now.toISOString(),
    walletAddress: "0xloser",
    price: 10.0,
    previousPrices: [15.0, 12.0],
    growthPercentage: -20.0,
    chain: "ethereum",
  };

  test("POST /dailyLoser/daily-losers — creates", async () => {
    const { status, data } = await request("POST", "/dailyLoser/daily-losers", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
    expect(data.chain).toBe("ethereum");
    loserId = data.id;
  });

  test("GET /dailyLoser/daily-losers — returns list", async () => {
    const { status, data } = await request("GET", "/dailyLoser/daily-losers");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  test("GET /dailyLoser/daily-losers?chain=ethereum — filters by chain", async () => {
    const { status, data } = await request("GET", "/dailyLoser/daily-losers?chain=ethereum");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
    expect(data.every((r: any) => r.chain === "ethereum")).toBe(true);
  });

  test("GET /dailyLoser/daily-losers?chain=shibarium — empty for unknown chain", async () => {
    const { status, data } = await request("GET", "/dailyLoser/daily-losers?chain=shibarium");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toEqual([]);
  });

  test("GET /dailyLoser/daily-losers/:id — returns single", async () => {
    const { status, data } = await request("GET", `/dailyLoser/daily-losers/${loserId}`);
    expect(status).toBe(200);
    expect(data.id).toBe(loserId);
  });

  test("PUT /dailyLoser/daily-losers/:id — updates", async () => {
    const { status, data } = await request("PUT", `/dailyLoser/daily-losers/${loserId}`, {
      price: 5.0,
    });
    expect(status).toBe(200);
    expect(data.price).toBe(5.0);
  });

  test("DELETE /dailyLoser/daily-losers/:id — deletes", async () => {
    const { status } = await request("DELETE", `/dailyLoser/daily-losers/${loserId}`);
    expect(status).toBe(204);
  });
});

describe("HotPair — full CRUD (prefix /hotpair)", () => {
  const payload = {
    pairName: "ETH/USDT",
    popularity: 95,
    walletAddress: "0xhot",
    price: 3400.0,
    previousPrices: [3350.0, 3380.0],
    growthPercentage: 1.5,
    chain: "ethereum",
  };

  test("POST /hotpair/hot-pairs — creates", async () => {
    const { status, data } = await request("POST", "/hotpair/hot-pairs", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
    expect(data.chain).toBe("ethereum");
    hotPairId = data.id;
  });

  test("GET /hotpair/hot-pairs — returns list", async () => {
    const { status, data } = await request("GET", "/hotpair/hot-pairs");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  test("GET /hotpair/hot-pairs?chain=ethereum — filters by chain", async () => {
    const { status, data } = await request("GET", "/hotpair/hot-pairs?chain=ethereum");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.every((r: any) => r.chain === "ethereum")).toBe(true);
  });

  test("GET /hotpair/hot-pairs/:id — returns single", async () => {
    const { status, data } = await request("GET", `/hotpair/hot-pairs/${hotPairId}`);
    expect(status).toBe(200);
    expect(data.id).toBe(hotPairId);
  });

  test("PUT /hotpair/hot-pairs/:id — updates", async () => {
    const { status, data } = await request("PUT", `/hotpair/hot-pairs/${hotPairId}`, {
      popularity: 99,
    });
    expect(status).toBe(200);
    expect(data.popularity).toBe(99);
  });

  test("DELETE /hotpair/hot-pairs/:id — deletes", async () => {
    const { status } = await request("DELETE", `/hotpair/hot-pairs/${hotPairId}`);
    expect(status).toBe(204);
  });
});

describe("UpdatedRRSS — full CRUD (prefix /updatedRRSS)", () => {
  const payload = {
    profileName: "crypto_trader",
    lastUpdated: now.toISOString(),
    walletAddress: "0xrrss",
    price: 50.0,
    previousPrices: [45.0, 48.0],
    growthPercentage: 10.0,
    chain: "ethereum",
  };

  test("POST /updatedRRSS/updated-rrss — creates", async () => {
    const { status, data } = await request("POST", "/updatedRRSS/updated-rrss", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
    expect(data.chain).toBe("ethereum");
    rrssId = data.id;
  });

  test("GET /updatedRRSS/updated-rrss — returns list", async () => {
    const { status, data } = await request("GET", "/updatedRRSS/updated-rrss");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  test("GET /updatedRRSS/updated-rrss?chain=ethereum — filters by chain", async () => {
    const { status, data } = await request("GET", "/updatedRRSS/updated-rrss?chain=ethereum");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
    expect(data.every((r: any) => r.chain === "ethereum")).toBe(true);
  });

  test("GET /updatedRRSS/updated-rrss?chain=shibarium — empty for unknown chain", async () => {
    const { status, data } = await request("GET", "/updatedRRSS/updated-rrss?chain=shibarium");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toEqual([]);
  });

  test("GET /updatedRRSS/updated-rrss/:id — returns single", async () => {
    const { status, data } = await request("GET", `/updatedRRSS/updated-rrss/${rrssId}`);
    expect(status).toBe(200);
    expect(data.id).toBe(rrssId);
  });

  test("PUT /updatedRRSS/updated-rrss/:id — updates", async () => {
    const { status, data } = await request("PUT", `/updatedRRSS/updated-rrss/${rrssId}`, {
      growthPercentage: 15.0,
    });
    expect(status).toBe(200);
    expect(data.growthPercentage).toBe(15.0);
  });

  test("DELETE /updatedRRSS/updated-rrss/:id — deletes", async () => {
    const { status } = await request("DELETE", `/updatedRRSS/updated-rrss/${rrssId}`);
    expect(status).toBe(204);
  });
});

describe("Likes — system", () => {
  const WALLET = "0x1111111111111111111111111111111111111111";
  let likeDashboardId: number;
  let likeHotPairId: number;

  const dashboardPayload = {
    token0Name: "LIKE",
    token1Name: "USDC",
    pairAddress: "0xabcef0123456789012345678901234567890abc1",
    price: 1.0,
    percentage24H: 0.1,
    score: 0,
    contracts: "0xabce...abc1",
    created: now.toISOString(),
    volume: "1M",
    swaps: "1K",
    liquidity: "1K",
    marketCap: "1M",
    dex: ["uniswap", "eth"],
    chain: "ethereum",
  };

  test("POST /api/dashboard/data — creates a fresh record with score 0", async () => {
    const { status, data } = await request("POST", "/api/dashboard/data", dashboardPayload);
    expect(status).toBe(201);
    expect(data.score).toBe(0);
    likeDashboardId = data.id;
  });

  test("POST /api/likes — first like increments count", async () => {
    const { status, data } = await request("POST", "/api/likes", {
      entityType: "dashboard",
      entityId: likeDashboardId,
      walletAddress: WALLET,
    });
    expect(status).toBe(200);
    expect(data.count).toBe(1);
    expect(data.likedByMe).toBe(true);
    expect(data.myCount).toBe(1);
    expect(data.remaining).toBe(19);
  });

  test("POST /api/likes — fills up to the limit (20)", async () => {
    for (let i = 2; i <= 20; i++) {
      const { status, data } = await request("POST", "/api/likes", {
        entityType: "dashboard",
        entityId: likeDashboardId,
        walletAddress: WALLET,
      });
      expect(status).toBe(200);
      expect(data.count).toBe(i);
    }
    const { status, data } = await request("POST", "/api/likes", {
      entityType: "dashboard",
      entityId: likeDashboardId,
      walletAddress: WALLET,
    });
    expect(status).toBe(400);
    expect(data.error).toContain("limit");
  });

  test("GET /api/likes/status — reports remaining likes", async () => {
    const { status, data } = await request(
      "GET",
      `/api/likes/status?entityType=dashboard&entityId=${likeDashboardId}&walletAddress=${WALLET}`
    );
    expect(status).toBe(200);
    expect(data.count).toBe(20);
    expect(data.myCount).toBe(20);
    expect(data.remaining).toBe(0);
    expect(data.maxLikes).toBe(20);
  });

  test("GET /api/dashboard/data?walletAddress= — enriches list with like info", async () => {
    const { status, data } = await request(
      "GET",
      `/api/dashboard/data?walletAddress=${WALLET}`
    );
    expect(status).toBe(200);
    const row = data.find((r: any) => r.id === likeDashboardId);
    expect(row).toBeDefined();
    expect(row.likedByMe).toBe(true);
    expect(row.myCount).toBe(20);
    expect(row.remainingLikes).toBe(0);
  });

  test("POST /api/likes — rejects invalid wallet address", async () => {
    const { status, data } = await request("POST", "/api/likes", {
      entityType: "dashboard",
      entityId: likeDashboardId,
      walletAddress: "not-an-address",
    });
    expect(status).toBe(400);
    expect(data.error).toContain("wallet");
  });

  test("POST /api/likes — rejects invalid entityType", async () => {
    const { status, data } = await request("POST", "/api/likes", {
      entityType: "unknown",
      entityId: likeDashboardId,
      walletAddress: WALLET,
    });
    expect(status).toBe(400);
    expect(data.error).toContain("entityType");
  });

  test("POST /api/likes — 404 for missing entity", async () => {
    const { status, data } = await request("POST", "/api/likes", {
      entityType: "dashboard",
      entityId: 999999,
      walletAddress: WALLET,
    });
    expect(status).toBe(404);
    expect(data.error).toContain("not found");
  });

  test("POST /api/hotpair/hot-pairs — popularity starts at 0", async () => {
    const { status, data } = await request("POST", "/hotpair/hot-pairs", {
      pairName: "LIKE/USDC",
      popularity: 0,
      price: 1.0,
      previousPrices: [1.0, 1.1],
      previousTimes: [1000, 2000],
      growthPercentage: 1.0,
      chain: "ethereum",
    });
    expect(status).toBe(201);
    expect(data.popularity).toBe(0);
    likeHotPairId = data.id;
  });

  test("POST /api/likes — increments hotpair popularity", async () => {
    const { status, data } = await request("POST", "/api/likes", {
      entityType: "hotpair",
      entityId: likeHotPairId,
      walletAddress: WALLET,
    });
    expect(status).toBe(200);
    expect(data.count).toBe(1);
  });

  test("GET /hotpair/hot-pairs?walletAddress= — enriches list with like info", async () => {
    const { status, data } = await request(
      "GET",
      `/hotpair/hot-pairs?walletAddress=${WALLET}`
    );
    expect(status).toBe(200);
    const row = data.find((r: any) => r.id === likeHotPairId);
    expect(row).toBeDefined();
    expect(row.likedByMe).toBe(true);
    expect(row.myCount).toBe(1);
    expect(row.remainingLikes).toBe(19);
    expect(row.popularity).toBe(1);
  });

  afterAll(async () => {
    await request("DELETE", `/api/dashboard/data/${likeDashboardId}`);
    await request("DELETE", `/hotpair/hot-pairs/${likeHotPairId}`);
  });
});

describe("isVisible — read filtering", () => {
  const created: string[] = [];

  const entities = [
    {
      name: "dashboard",
      post: "/api/dashboard/data",
      list: "/api/dashboard/data",
      idField: "pairAddress",
      payload: (tag: string) => ({
        token0Name: tag,
        token1Name: "USDT",
        pairAddress: `0x${"abc".repeat(14)}${tag.slice(-4)}`,
        price: 1.0,
        percentage24H: 0.1,
        score: 0,
        contracts: "0xhidden",
        created: now.toISOString(),
        volume: "1M",
        swaps: "1K",
        liquidity: "1K",
        marketCap: "1M",
        dex: ["uniswap", "eth"],
        chain: "ethereum",
        isVisible: false,
      }),
    },
    {
      name: "livePair",
      post: "/api/live-pairs",
      list: "/api/live-pairs",
      idField: "pairAddress",
      payload: (tag: string) => ({
        token0Name: tag,
        token1Name: "WETH",
        pairAddress: `0x${"cde".repeat(14)}${tag.slice(-4)}`,
        listedSince: now.toISOString(),
        tokenPriceUSD: 0.001,
        initialLiquidity: "0.5 ETH",
        totalLiquidity: "15%",
        poolAmount: "0.575 ETH",
        poolVariation: 15,
        poolRemaining: "2.1 ETH",
        contract: "0xhidden",
        chain: "ethereum",
        isVisible: false,
      }),
    },
    {
      name: "swap",
      post: "/api/swaps",
      list: "/api/swaps",
      idField: "txHash",
      payload: (tag: string) => ({
        token0Name: tag,
        token1Name: "USDT",
        pairAddress: `0x${"def".repeat(14)}${tag.slice(-4)}`,
        executionTime: now.toISOString(),
        type: "BUY",
        quantity: 10,
        totalETH: 1.0,
        totalUSD: 2500,
        variation: 2.0,
        maker: "0xmaker",
        txHash: `0x${"fee".repeat(14)}${tag.slice(-4)}`,
        chain: "ethereum",
        isVisible: false,
      }),
    },
    {
      name: "dailyWinner",
      post: "/dailyWinner/daily-winners",
      list: "/dailyWinner/daily-winners",
      idField: "username",
      payload: (tag: string) => ({
        username: tag,
        date: now.toISOString(),
        walletAddress: "0xwinner",
        price: 100.5,
        previousPrices: [95.0, 98.0],
        growthPercentage: 5.0,
        chain: "ethereum",
        isVisible: false,
      }),
    },
    {
      name: "dailyLoser",
      post: "/dailyLoser/daily-losers",
      list: "/dailyLoser/daily-losers",
      idField: "username",
      payload: (tag: string) => ({
        username: tag,
        date: now.toISOString(),
        walletAddress: "0xloser",
        price: 10.0,
        previousPrices: [15.0, 12.0],
        growthPercentage: -20.0,
        chain: "ethereum",
        isVisible: false,
      }),
    },
    {
      name: "updatedRRSS",
      post: "/updatedRRSS/updated-rrss",
      list: "/updatedRRSS/updated-rrss",
      idField: "profileName",
      payload: (tag: string) => ({
        profileName: tag,
        lastUpdated: now.toISOString(),
        walletAddress: "0xrrss",
        price: 50.0,
        previousPrices: [45.0, 48.0],
        growthPercentage: 10.0,
        chain: "ethereum",
        isVisible: false,
      }),
    },
    {
      name: "hotpair",
      post: "/hotpair/hot-pairs",
      list: "/hotpair/hot-pairs",
      idField: "pairName",
      payload: (tag: string) => ({
        pairName: tag,
        popularity: 0,
        price: 1.0,
        previousPrices: [1.0, 1.1],
        growthPercentage: 1.0,
        chain: "ethereum",
        isVisible: false,
      }),
    },
  ];

  afterAll(async () => {
    for (const deletePath of created) {
      await request("DELETE", deletePath);
    }
  });

  test("rows with isVisible=false are excluded from every read endpoint", async () => {
    for (const entity of entities) {
      const tag = `HID_${entity.name}`;
      const { status, data } = await request("POST", entity.post, entity.payload(tag));
      expect(status).toBe(201);
      expect(data.isVisible).toBe(false);
      created.push(`/${entity.post.split("/").filter(Boolean).join("/")}/${data.id}`);

      const listRes = await request("GET", entity.list);
      expect(listRes.status).toBe(200);
      const found = (listRes.data as any[]).find(
        (row: any) => row[entity.idField] === tag
      );
      expect(found).toBeUndefined();
    }
  });

  test("rows with isVisible=true remain visible in read endpoints", async () => {
    const { status, data } = await request("POST", "/api/dashboard/data", {
      token0Name: "VISIBLE",
      token1Name: "USDT",
      pairAddress: "0xbabababababababababababababababababababe",
      price: 1.0,
      percentage24H: 0.1,
      score: 0,
      contracts: "0xvisible",
      created: now.toISOString(),
      volume: "1M",
      swaps: "1K",
      liquidity: "1K",
      marketCap: "1M",
      dex: ["uniswap", "eth"],
      chain: "ethereum",
      isVisible: true,
    });
    expect(status).toBe(201);
    created.push(`/api/dashboard/data/${data.id}`);

    const listRes = await request("GET", "/api/dashboard/data");
    expect(listRes.status).toBe(200);
    const found = (listRes.data as any[]).find(
      (row: any) => row.pairAddress === "0xbabababababababababababababababababababe"
    );
    expect(found).toBeDefined();
  });
});

describe("General error handling", () => {
  test("GET / — returns Hello World", async () => {
    const { status, data } = await request("GET", "/");
    expect(status).toBe(200);
    expect(data).toBe("Hello World!");
  });

  test("404 for unknown routes", async () => {
    const { status, data } = await request("GET", "/nonexistent");
    expect(status).toBe(404);
    expect(data.message).toBe("Not Found");
  });

  test("Empty DB returns empty arrays (after deletes)", async () => {
    const { data: dd } = await request("GET", "/api/dashboard/data");
    expect(dd).toEqual([]);
    const { data: lp } = await request("GET", "/api/live-pairs");
    expect(lp).toEqual([]);
    const { data: sw } = await request("GET", "/api/swaps");
    expect(sw).toEqual([]);
  });
});
