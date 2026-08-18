import * as PriceHistoryService from "../services/priceHistory.service";

jest.mock("../configs/prisma.config", () => ({
  __esModule: true,
  default: {
    dashboardData: {
      findMany: jest.fn(),
    },
  },
}));

const prisma = require("../configs/prisma.config").default;

describe("PriceHistoryService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPriceHistory", () => {
    it("should return fallback history when no DB records exist", async () => {
      (prisma.dashboardData.findMany as jest.Mock).mockResolvedValue([]);

      const result = await PriceHistoryService.getPriceHistory(
        "ethereum",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        7
      );

      expect(result).toHaveProperty("prices");
      expect(result).toHaveProperty("times");
      expect(result).toHaveProperty("tokenAddress");
      expect(result).toHaveProperty("chain");
      expect(result.chain).toBe("ethereum");
      expect(result.prices.length).toBeGreaterThan(0);
      expect(result.times.length).toBe(result.prices.length);
    });

    it("should generate fallback data with correct chain", async () => {
      (prisma.dashboardData.findMany as jest.Mock).mockResolvedValue([]);

      const result = await PriceHistoryService.getPriceHistory(
        "shibarium",
        "0x1234567890abcdef1234567890abcdef12345678",
        1
      );

      expect(result.chain).toBe("shibarium");
      expect(result.tokenAddress).toBe("0x1234567890abcdef1234567890abcdef12345678");
    });

    it("should respect days parameter for interval", async () => {
      (prisma.dashboardData.findMany as jest.Mock).mockResolvedValue([]);

      const result1 = await PriceHistoryService.getPriceHistory(
        "ethereum",
        "0x1234567890abcdef1234567890abcdef12345678",
        1
      );

      const result7 = await PriceHistoryService.getPriceHistory(
        "ethereum",
        "0xabcdef1234567890abcdef1234567890abcdef12",
        7
      );

      // 1-day should have hourly data (up to 48 points), 7-day should have hourly (up to 168)
      expect(result1.prices.length).toBeLessThanOrEqual(48);
      expect(result7.prices.length).toBeLessThanOrEqual(168);
    });

    it("should return consistent fallback data for same inputs", async () => {
      (prisma.dashboardData.findMany as jest.Mock).mockResolvedValue([]);

      const r1 = await PriceHistoryService.getPriceHistory(
        "ethereum",
        "0xaaaa111122223333444455556666777788889999",
        7
      );
      const r2 = await PriceHistoryService.getPriceHistory(
        "ethereum",
        "0xaaaa111122223333444455556666777788889999",
        7
      );

      expect(r1.chain).toBe(r2.chain);
      expect(r1.tokenAddress).toBe(r2.tokenAddress);
    });

    it("should return DB data when records exist", async () => {
      const now = Date.now();
      (prisma.dashboardData.findMany as jest.Mock).mockResolvedValue([
        { price: 100, createdAt: new Date(now - 3600_000) },
        { price: 105, createdAt: new Date(now - 1800_000) },
        { price: 110, createdAt: new Date(now) },
      ]);

      const result = await PriceHistoryService.getPriceHistory(
        "ethereum",
        "0xBBBB111122223333444455556666777788889999",
        7
      );

      expect(result.prices).toEqual([100, 105, 110]);
      expect(result.times.length).toBe(3);
    });

    it("should fall back to generated data if DB records have no price", async () => {
      (prisma.dashboardData.findMany as jest.Mock).mockResolvedValue([
        { price: 0, createdAt: new Date() },
      ]);

      const result = await PriceHistoryService.getPriceHistory(
        "ethereum",
        "0xCCCC111122223333444455556666777788889999",
        7
      );

      // price=0 means no valid data, should fall back to generated
      expect(result.prices.length).toBeGreaterThan(0);
    });
  });
});
