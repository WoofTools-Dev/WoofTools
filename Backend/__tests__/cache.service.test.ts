import { CacheService } from "../services/cache.service";

describe("CacheService", () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
  });

  describe("get/set", () => {
    it("should store and retrieve a value", () => {
      cache.set("key1", { data: "hello" }, 60_000);
      expect(cache.get("key1")).toEqual({ data: "hello" });
    });

    it("should return null for missing key", () => {
      expect(cache.get("nonexistent")).toBeNull();
    });

    it("should return null for expired entries", () => {
      cache.set("expired", "value", 1);
      // Simulate time passing
      (cache as any).store.get("expired").ts = Date.now() - 100;
      expect(cache.get("expired")).toBeNull();
    });

    it("should overwrite existing key", () => {
      cache.set("k", "v1", 60_000);
      cache.set("k", "v2", 60_000);
      expect(cache.get("k")).toBe("v2");
    });

    it("should handle different types", () => {
      cache.set("str", "hello", 60_000);
      cache.set("num", 42, 60_000);
      cache.set("obj", { a: 1 }, 60_000);
      cache.set("arr", [1, 2, 3], 60_000);

      expect(cache.get("str")).toBe("hello");
      expect(cache.get("num")).toBe(42);
      expect(cache.get("obj")).toEqual({ a: 1 });
      expect(cache.get("arr")).toEqual([1, 2, 3]);
    });
  });

  describe("has", () => {
    it("should return true for existing key", () => {
      cache.set("exists", "val", 60_000);
      expect(cache.has("exists")).toBe(true);
    });

    it("should return false for missing key", () => {
      expect(cache.has("nope")).toBe(false);
    });

    it("should return false for expired key", () => {
      cache.set("old", "val", 1);
      (cache as any).store.get("old").ts = Date.now() - 100;
      expect(cache.has("old")).toBe(false);
    });
  });

  describe("invalidate", () => {
    it("should remove a specific key", () => {
      cache.set("a", 1, 60_000);
      cache.set("b", 2, 60_000);
      cache.invalidate("a");
      expect(cache.get("a")).toBeNull();
      expect(cache.get("b")).toBe(2);
    });

    it("should invalidate by prefix", () => {
      cache.set("graph:a", 1, 60_000);
      cache.set("graph:b", 2, 60_000);
      cache.set("cg:c", 3, 60_000);
      cache.invalidatePrefix("graph:");
      expect(cache.get("graph:a")).toBeNull();
      expect(cache.get("graph:b")).toBeNull();
      expect(cache.get("cg:c")).toBe(3);
    });
  });

  describe("rate limiting", () => {
    it("should allow requests within limit", () => {
      expect(cache.checkRateLimit("api", 5)).toBe(true);
      expect(cache.checkRateLimit("api", 5)).toBe(true);
      expect(cache.checkRateLimit("api", 5)).toBe(true);
    });

    it("should block requests over limit", () => {
      for (let i = 0; i < 3; i++) {
        cache.checkRateLimit("limited", 3);
      }
      expect(cache.checkRateLimit("limited", 3)).toBe(false);
    });

    it("should track different providers separately", () => {
      for (let i = 0; i < 5; i++) {
        cache.checkRateLimit("providerA", 5);
      }
      expect(cache.checkRateLimit("providerA", 5)).toBe(false);
      expect(cache.checkRateLimit("providerB", 5)).toBe(true);
    });

    it("should reset after window expires", () => {
      cache.checkRateLimit("window", 2);
      cache.checkRateLimit("window", 2);
      expect(cache.checkRateLimit("window", 2)).toBe(false);

      // Force window reset
      (cache as any).rateLimits.get("window").resetAt = Date.now() - 100;
      expect(cache.checkRateLimit("window", 2)).toBe(true);
    });
  });

  describe("waitForRateLimit", () => {
    it("should resolve immediately when under limit", async () => {
      const start = Date.now();
      await cache.waitForRateLimit("fast", 10);
      expect(Date.now() - start).toBeLessThan(100);
    });
  });
});
