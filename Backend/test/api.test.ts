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

beforeAll(async () => {
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
});

describe("API Endpoints", () => {
  it("should return hello world on GET /", async () => {
    const { status, data } = await request("GET", "/");
    expect(status).toBe(200);
    expect(data).toBe("Hello World!");
  });

  it("should return dashboard data on GET /api/dashboard/data", async () => {
    const { status, data } = await request("GET", "/api/dashboard/data");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("should return live pairs on GET /api/live-pairs", async () => {
    const { status, data } = await request("GET", "/api/live-pairs");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("should return swap transactions on GET /api/swaps", async () => {
    const { status, data } = await request("GET", "/api/swaps");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("should return hot pairs on GET /hotpair/hot-pairs", async () => {
    const { status, data } = await request("GET", "/hotpair/hot-pairs");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("should return daily winners on GET /dailyWinner/daily-winners", async () => {
    const { status, data } = await request("GET", "/dailyWinner/daily-winners");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("should return daily losers on GET /dailyLoser/daily-losers", async () => {
    const { status, data } = await request("GET", "/dailyLoser/daily-losers");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("should return updated RRSS on GET /updatedRRSS/updated-rrss", async () => {
    const { status, data } = await request("GET", "/updatedRRSS/updated-rrss");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("should return 404 for unknown routes", async () => {
    const { status, data } = await request("GET", "/nonexistent");
    expect(status).toBe(404);
    expect(data.message).toBe("Not Found");
  });
});
