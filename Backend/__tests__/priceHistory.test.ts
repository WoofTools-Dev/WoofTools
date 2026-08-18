let PriceHistoryService: typeof import("../services/priceHistory.service");
let mockGetCoinGeckoHistory: jest.Mock;
let mockGetOHLCV: jest.Mock;

beforeEach(async () => {
  jest.resetModules();

  mockGetCoinGeckoHistory = jest.fn();
  mockGetOHLCV = jest.fn();

  jest.doMock("../services/providers", () => ({
    get coingeckoService() {
      return { getPriceHistory: mockGetCoinGeckoHistory };
    },
    get geckoterminalService() {
      return { getOHLCV: mockGetOHLCV, findPool: jest.fn() };
    },
  }));

  PriceHistoryService = await import("../services/priceHistory.service");
});

describe("PriceHistoryService", () => {
  describe("getPriceHistory", () => {
    it("should return empty when CoinGecko fails for ethereum", async () => {
      mockGetCoinGeckoHistory.mockRejectedValue(new Error("API error"));

      const result = await PriceHistoryService.getPriceHistory(
        "ethereum",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        7
      );

      expect(result.prices).toEqual([]);
      expect(result.times).toEqual([]);
      expect(result.chain).toBe("ethereum");
    });

    it("should return CoinGecko data for known ethereum token", async () => {
      mockGetCoinGeckoHistory.mockResolvedValue({
        prices: [3400, 3450, 3500, 3512],
        times: [1719000000, 1719086400, 1719172800, 1719259200],
      });

      const result = await PriceHistoryService.getPriceHistory(
        "ethereum",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        7
      );

      expect(result.prices).toEqual([3400, 3450, 3500, 3512]);
      expect(result.times).toEqual([1719000000, 1719086400, 1719172800, 1719259200]);
      expect(result.chain).toBe("ethereum");
      expect(result.tokenAddress).toBe("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
    });

    it("should return empty when CoinGecko returns insufficient data", async () => {
      mockGetCoinGeckoHistory.mockResolvedValue({
        prices: [100],
        times: [1719000000],
      });

      const result = await PriceHistoryService.getPriceHistory(
        "ethereum",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        7
      );

      expect(result.prices).toEqual([]);
    });

    it("should return GeckoTerminal data for shibarium token", async () => {
      mockGetOHLCV.mockResolvedValue({
        prices: [0.025, 0.026, 0.027, 0.0285],
        times: [1719000000, 1719086400, 1719172800, 1719259200],
      });

      const result = await PriceHistoryService.getPriceHistory(
        "shibarium",
        "0x2761723006d3Eb0d90B19B75654DbE543dcd974f",
        7
      );

      expect(result.prices).toEqual([0.025, 0.026, 0.027, 0.0285]);
      expect(result.times).toEqual([1719000000, 1719086400, 1719172800, 1719259200]);
      expect(result.chain).toBe("shibarium");
    });

    it("should return empty when GeckoTerminal fails", async () => {
      mockGetOHLCV.mockRejectedValue(new Error("API error"));

      const result = await PriceHistoryService.getPriceHistory(
        "shibarium",
        "0x2761723006d3Eb0d90B19B75654DbE543dcd974f",
        7
      );

      expect(result.prices).toEqual([]);
      expect(result.times).toEqual([]);
    });

    it("should return empty for unknown ethereum token", async () => {
      mockGetCoinGeckoHistory.mockResolvedValue(null);

      const result = await PriceHistoryService.getPriceHistory(
        "ethereum",
        "0x1234567890abcdef1234567890abcdef12345678",
        7
      );

      expect(result.prices).toEqual([]);
    });
  });
});
