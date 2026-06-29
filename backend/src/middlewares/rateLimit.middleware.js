import redis, { isRedisReady } from "../config/redis.js";

// Fixed-window rate limiter backed by Redis (INCR + EXPIRE).
//
//   prefix         namespace for the counter key
//   max            allowed requests per window
//   windowSeconds  window length
//   by             "user" (req.user._id) or "ip" (req.ip)
//
// Fails OPEN: if Redis is down or the identity is missing, the request is
// allowed through rather than blocking the API on an unavailable dependency.
const rateLimit =
  ({ prefix, max, windowSeconds, by = "user" }) =>
  async (req, res, next) => {
    if (!isRedisReady()) return next();

    const id = by === "ip" ? req.ip : req.user?._id;
    if (!id) return next();

    const key = `ratelimit:${prefix}:${id}`;

    try {
      const count = await redis.incr(key);
      // First hit in this window starts the expiry clock.
      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (count > max) {
        const ttl = await redis.ttl(key);
        const retryAfter = ttl > 0 ? ttl : windowSeconds;
        res.set("Retry-After", String(retryAfter));
        return res.status(429).json({
          success: false,
          message: `Too many requests. Try again in ${retryAfter} seconds.`,
          data: null,
          retryAfter,
        });
      }

      return next();
    } catch {
      // Redis hiccup mid-request — don't penalize the user.
      return next();
    }
  };

// Preconfigured limiters per the Phase 7 spec.
export const postRateLimit = rateLimit({
  prefix: "post",
  max: 10,
  windowSeconds: 60 * 60,
  by: "user",
});

export const commentRateLimit = rateLimit({
  prefix: "comment",
  max: 30,
  windowSeconds: 60 * 60,
  by: "user",
});

export const voteRateLimit = rateLimit({
  prefix: "vote",
  max: 60,
  windowSeconds: 60 * 60,
  by: "user",
});

export const loginRateLimit = rateLimit({
  prefix: "login",
  max: 10,
  windowSeconds: 15 * 60,
  by: "ip",
});

export default rateLimit;
