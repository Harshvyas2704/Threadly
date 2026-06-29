import redis, { isRedisReady } from "../config/redis.js";

// Thin cache-aside wrapper over Redis. Every method is a no-op (or falls back
// to the loader) when Redis is unavailable, so callers never have to branch on
// whether the cache is up.

export const getCache = async (key) => {
  if (!isRedisReady()) return null;
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setCache = async (key, value, ttlSeconds) => {
  if (!isRedisReady()) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // Swallow — a failed cache write must not break the request.
  }
};

export const delCache = async (...keys) => {
  if (!isRedisReady() || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    // ignore
  }
};

// Return the cached value for `key`, or run `loader`, cache its result, and
// return it. Never throws on cache failure.
export const cacheAside = async (key, ttlSeconds, loader) => {
  const cached = await getCache(key);
  if (cached !== null) return cached;

  const fresh = await loader();
  // Don't cache empty/nullish results so they can be retried cheaply.
  if (fresh !== null && fresh !== undefined) {
    await setCache(key, fresh, ttlSeconds);
  }
  return fresh;
};

// Centralized key builders so producers and invalidators can't drift.
export const cacheKeys = {
  community: (slug) => `community:${slug}`,
  trendingFeed: () => "feed:trending",
};

// TTLs in seconds.
export const TTL = {
  community: 10 * 60, // 10 minutes
  trending: 5 * 60, // 5 minutes
};
