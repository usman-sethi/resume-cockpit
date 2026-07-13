interface CacheEntry {
  value: any;
  expiresAt: number; // timestamp
}

export class AICache {
  private static instance: AICache;
  private cache = new Map<string, CacheEntry>();

  private constructor() {}

  public static getInstance(): AICache {
    if (!AICache.instance) {
      AICache.instance = new AICache();
    }
    return AICache.instance;
  }

  public generateKey(type: string, system: string, prompt: string): string {
    // Basic hash representation of inputs
    const serialized = JSON.stringify({ type, system, prompt });
    let hash = 0;
    for (let i = 0; i < serialized.length; i++) {
      const char = serialized.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `ai_cache_${type}_${hash}`;
  }

  public get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log(`[AI Cache] Expired entry for key ${key}`);
      return null;
    }

    console.log(`[AI Cache] Cache hit! Returning cached result for key ${key}`);
    return entry.value;
  }

  public set(key: string, value: any, ttlSeconds = 300) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
    console.log(`[AI Cache] Cached entry for key ${key}, TTL ${ttlSeconds}s`);
  }

  public clear() {
    this.cache.clear();
    console.log("[AI Cache] Cleared all cache entries.");
  }
}

export const aiCache = AICache.getInstance();
