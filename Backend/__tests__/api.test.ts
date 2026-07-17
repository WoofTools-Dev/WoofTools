import http from "http";
import app from "../app";

let server: http.Server;
let baseUrl: string;

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

beforeAll((done) => {
  server = http.createServer(app);
  server.listen(0, () => {
    const addr = server.address();
    if (addr && typeof addr === "object") {
      baseUrl = `http://127.0.0.1:${addr.port}`;
    }
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

describe("GET /", () => {
  it("returns Hello World", async () => {
    const { status, data } = await request("GET", "/");
    expect(status).toBe(200);
    expect(data).toBe("Hello World!");
  });
});

describe("GET /api/dashboard/data", () => {
  it("returns an array (possibly empty)", async () => {
    const { status, data } = await request("GET", "/api/dashboard/data");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});

describe("GET /api/live-pairs", () => {
  it("returns an array (possibly empty)", async () => {
    const { status, data } = await request("GET", "/api/live-pairs");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});

describe("GET /api/swaps", () => {
  it("returns an array (possibly empty)", async () => {
    const { status, data } = await request("GET", "/api/swaps");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});

describe("POST /api/dashboard/data", () => {
  it("creates a record and returns 201", async () => {
    const payload = {
      token0Name: "TEST",
      token1Name: "TEST",
      pairAddress: "0xtest",
      price: 1.0,
      percentage24H: 0,
      score: 50,
      contracts: "0xtest",
      created: new Date().toISOString(),
      volume: "1M",
      swaps: "100",
      liquidity: "100K",
      marketCap: "1M",
      dex: ["uniswap"],
    };
    const { status, data } = await request("POST", "/api/dashboard/data", payload);
    expect(status).toBe(201);
    expect(data).toHaveProperty("id");
  });

  afterAll(async () => {
    await request("DELETE", "/api/dashboard/data/1");
  });
});

describe("404 handling", () => {
  it("returns 404 for unknown routes", async () => {
    const { status, data } = await request("GET", "/nonexistent");
    expect(status).toBe(404);
    expect(data.message).toBe("Not Found");
  });
});
