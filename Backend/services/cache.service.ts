interface CacheEntry<T> {
  data: T;
  ts: number;
  ttl: number;
}

export class CacheService {
  private store = new Map<string, CacheEntry<any>>();
  private rateLimits = new Map<string, { count: number; resetAt: number }>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > entry.ttl) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, ts: Date.now(), ttl: ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  checkRateLimit(provider: string, maxPerMinute: number): boolean {
    const now = Date.now();
    const entry = this.rateLimits.get(provider);

    if (!entry || now > entry.resetAt) {
      this.rateLimits.set(provider, { count: 1, resetAt: now + 60_000 });
      return true;
    }

    if (entry.count >= maxPerMinute) return false;

    entry.count++;
    return true;
  }

  waitForRateLimit(provider: string, maxPerMinute: number): Promise<void> {
    if (this.checkRateLimit(provider, maxPerMinute)) {
      return Promise.resolve();
    }
    const entry = this.rateLimits.get(provider)!;
    const waitMs = entry.resetAt - Date.now() + 100;
    return new Promise((resolve) => setTimeout(resolve, Math.max(waitMs, 500)));
  }
}

export const cache = new CacheService();
