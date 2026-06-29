import Post from "../models/post.model.js";
import CommunityMember from "../models/communityMember.model.js";
import { presentPost } from "../utils/postPresenter.util.js";
import { cacheAside, cacheKeys, TTL } from "./cache.service.js";

const POPULATE_AUTHOR = { path: "authorId", select: "userName avatar karma" };
const POPULATE_COMMUNITY = { path: "communityId", select: "name slug avatar" };

const TRENDING_WINDOW_MS = 24 * 60 * 60 * 1000; // last 24 hours

// Home feed: posts from communities the user belongs to (excluding ones they
// were banned from), newest first. Not cached — it's per-user and cheap.
export const getHomeFeed = async (userId, { page = 1, limit = 20 } = {}) => {
  const memberships = await CommunityMember.find({
    userId,
    role: { $ne: "banned" },
  }).select("communityId");

  const communityIds = memberships.map((m) => m.communityId);
  if (communityIds.length === 0) {
    return { posts: [], page, limit };
  }

  const posts = await Post.find({ communityId: { $in: communityIds } })
    .populate(POPULATE_AUTHOR)
    .populate(POPULATE_COMMUNITY)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { posts: posts.map(presentPost), page, limit };
};

// Trending feed: posts created in the last 24h, highest voteScore first.
// Cached in Redis with a 5-minute TTL (page 1 only — the common request).
export const getTrendingFeed = async ({ page = 1, limit = 20 } = {}) => {
  const load = async () => {
    const since = new Date(Date.now() - TRENDING_WINDOW_MS);
    const posts = await Post.find({ createdAt: { $gte: since } })
      .populate(POPULATE_AUTHOR)
      .populate(POPULATE_COMMUNITY)
      .sort({ voteScore: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return { posts: posts.map(presentPost), page, limit };
  };

  // Only the first page is hot enough to be worth caching.
  if (page === 1) {
    return cacheAside(cacheKeys.trendingFeed(), TTL.trending, load);
  }
  return load();
};
