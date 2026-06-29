import Redis from "ioredis";

// Single shared Redis connection for caching and rate limiting.
//
// Designed to degrade gracefully: if REDIS_URL is unset or the server is
// unreachable, the app keeps running and cache reads/writes simply become
// no-ops (see cache.service.js). A cache being down must never take down
// the API.

let redis = null;
let warnedUnavailable = false;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    // Don't queue commands forever while disconnected — fail fast so callers
    // can fall back to the database instead of hanging.
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    lazyConnect: false,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });

  redis.on("connect", () => {
    console.log("[REDIS] Connected");
    warnedUnavailable = false;
  });

  redis.on("error", (err) => {
    // Log once per outage rather than on every retry.
    if (!warnedUnavailable) {
      console.warn(`[REDIS] Unavailable, falling back to DB: ${err.message}`);
      warnedUnavailable = true;
    }
  });
} else {
  console.warn("[REDIS] REDIS_URL not set — caching/rate limiting disabled");
}

// True only when a live connection is ready to accept commands.
export const isRedisReady = () => !!redis && redis.status === "ready";

export default redis;
