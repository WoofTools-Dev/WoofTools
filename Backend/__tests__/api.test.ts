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
    score: 92,
    contracts: "0x8ad5...e6d8",
    created: now.toISOString(),
    volume: "45.2M",
    swaps: "12.5K",
    liquidity: "850K",
    marketCap: "12.5M",
    dex: ["uniswap", "eth"],
  };

  test("POST /api/dashboard/data — creates record", async () => {
    const { status, data } = await request("POST", "/api/dashboard/data", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
    expect(data.token0Name).toBe("ETH");
    dashboardId = data.id;
  });

  test("GET /api/dashboard/data — returns list", async () => {
    const { status, data } = await request("GET", "/api/dashboard/data");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
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
  };

  test("POST /api/live-pairs — creates record", async () => {
    const { status, data } = await request("POST", "/api/live-pairs", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
    livePairId = data.id;
  });

  test("GET /api/live-pairs — returns list", async () => {
    const { status, data } = await request("GET", "/api/live-pairs");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
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
  };

  test("POST /api/swaps — creates record", async () => {
    const { status, data } = await request("POST", "/api/swaps", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
    swapId = data.id;
  });

  test("GET /api/swaps — returns list", async () => {
    const { status, data } = await request("GET", "/api/swaps");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
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
  };

  test("POST /dailyWinner/daily-winners — creates", async () => {
    const { status, data } = await request("POST", "/dailyWinner/daily-winners", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
    winnerId = data.id;
  });

  test("GET /dailyWinner/daily-winners — returns list", async () => {
    const { status, data } = await request("GET", "/dailyWinner/daily-winners");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
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
  };

  test("POST /dailyLoser/daily-losers — creates", async () => {
    const { status, data } = await request("POST", "/dailyLoser/daily-losers", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
    loserId = data.id;
  });

  test("GET /dailyLoser/daily-losers — returns list", async () => {
    const { status, data } = await request("GET", "/dailyLoser/daily-losers");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
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
  };

  test("POST /hotpair/hot-pairs — creates", async () => {
    const { status, data } = await request("POST", "/hotpair/hot-pairs", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
    hotPairId = data.id;
  });

  test("GET /hotpair/hot-pairs — returns list", async () => {
    const { status, data } = await request("GET", "/hotpair/hot-pairs");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
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
  };

  test("POST /updatedRRSS/updated-rrss — creates", async () => {
    const { status, data } = await request("POST", "/updatedRRSS/updated-rrss", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
    rrssId = data.id;
  });

  test("GET /updatedRRSS/updated-rrss — returns list", async () => {
    const { status, data } = await request("GET", "/updatedRRSS/updated-rrss");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
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
