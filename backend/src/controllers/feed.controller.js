import asyncHandler from "../utils/asyncHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { getHomeFeed, getTrendingFeed } from "../services/feed.service.js";

// Clamp pagination params to sane bounds.
const parsePaging = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit };
};

// GET /feed/home — posts from the user's joined communities, newest first.
export const homeFeed = asyncHandler(async (req, res) => {
  const feed = await getHomeFeed(req.user._id, parsePaging(req.query));
  return successResponse(res, "Home feed fetched successfully", feed);
});

// GET /feed/trending — top posts in the last 24h (cached).
export const trendingFeed = asyncHandler(async (req, res) => {
  const feed = await getTrendingFeed(parsePaging(req.query));
  return successResponse(res, "Trending feed fetched successfully", feed);
});
