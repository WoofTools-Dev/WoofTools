import http from "http";
import app from "../app";

jest.mock("../services/goplus.service", () => ({
  getTokenSecurity: jest.fn(),
  getApprovalSecurity: jest.fn(),
  simulateTransaction: jest.fn(),
}));

import * as GoPlusService from "../services/goplus.service";

const mocked = GoPlusService as jest.Mocked<typeof GoPlusService>;

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
  jest.clearAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GoPlus — Token Security", () => {
  const ADDRESS = "0x408e41876cccdc0f92210600ef50372656052a38";

  test("GET /api/goplus/token-security/:chainId — success", async () => {
    const data = { is_honeypot: "0", buy_tax: "0", sell_tax: "0", is_open_source: "1" };
    mocked.getTokenSecurity.mockResolvedValue(data);

    const { status, data: body } = await request(
      "GET",
      `/api/goplus/token-security/1?address=${ADDRESS}`
    );
    expect(status).toBe(200);
    expect(body).toEqual({ available: true, data });
    expect(mocked.getTokenSecurity).toHaveBeenCalledWith("1", ADDRESS);
  });

  test("GET token-security — 400 when address missing", async () => {
    const { status, data } = await request("GET", "/api/goplus/token-security/1");
    expect(status).toBe(400);
    expect(data.message).toContain("required");
  });

  test("GET token-security — 400 when address is not a valid 0x address", async () => {
    const { status } = await request("GET", "/api/goplus/token-security/1?address=not-an-address");
    expect(status).toBe(400);
  });

  test("GET token-security — available:false on unsupported chain", async () => {
    mocked.getTokenSecurity.mockRejectedValue({ isUnavailable: true, message: "chain not supported" });

    const { status, data } = await request(
      "GET",
      `/api/goplus/token-security/109?address=${ADDRESS}`
    );
    expect(status).toBe(200);
    expect(data.available).toBe(false);
    expect(data.message).toBe("chain not supported");
  });
});

describe("GoPlus — Approval Security", () => {
  const ADDRESS = "0x408e41876cccdc0f92210600ef50372656052a38";

  test("GET /api/goplus/approval-security/:chainId — success", async () => {
    const data = { contract_name: "ChewySwap Router", is_open_source: "1", doubt_list: "0" };
    mocked.getApprovalSecurity.mockResolvedValue(data);

    const { status, data: body } = await request(
      "GET",
      `/api/goplus/approval-security/1?address=${ADDRESS}`
    );
    expect(status).toBe(200);
    expect(body).toEqual({ available: true, data });
  });

  test("GET approval-security — available:false on unsupported chain", async () => {
    mocked.getApprovalSecurity.mockRejectedValue({ isUnavailable: true, message: "chain not supported" });

    const { status, data } = await request(
      "GET",
      `/api/goplus/approval-security/109?address=${ADDRESS}`
    );
    expect(status).toBe(200);
    expect(data.available).toBe(false);
  });
});

describe("GoPlus — Transaction Simulation", () => {
  const payload = {
    chain_id: "109",
    from: "0x408e41876cccdc0f92210600ef50372656052a38",
    to: "0xEF83bbB63E8A7442E3a4a5d28d9bBf32D7c813c8",
    data: "0x",
    value: "0",
    url: "https://rpc.shibarium.shib.io",
  };

  test("POST /api/goplus/simulate — success", async () => {
    const data = { is_revert: false, flagged: [], erc20_balance_changes: [] };
    mocked.simulateTransaction.mockResolvedValue(data);

    const { status, data: body } = await request("POST", "/api/goplus/simulate", payload);
    expect(status).toBe(200);
    expect(body).toEqual({ available: true, data });
    expect(mocked.simulateTransaction).toHaveBeenCalledWith(payload);
  });

  test("POST /api/goplus/simulate — 400 when chain_id missing", async () => {
    const { status } = await request("POST", "/api/goplus/simulate", { to: "0x1234" });
    expect(status).toBe(400);
  });

  test("POST /api/goplus/simulate — available:false when not configured", async () => {
    mocked.simulateTransaction.mockRejectedValue({
      isUnavailable: true,
      message: "GoPlus access token not configured",
    });

    const { status, data } = await request("POST", "/api/goplus/simulate", payload);
    expect(status).toBe(200);
    expect(data.available).toBe(false);
    expect(data.message).toContain("not configured");
  });
});
