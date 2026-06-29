import Post from "../models/post.model.js";
import Community from "../models/community.model.js";
import ApiError from "../utils/apiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { presentPost } from "../utils/postPresenter.util.js";

const presentCommunity = (c) => ({
  _id: c._id,
  name: c.name,
  slug: c.slug,
  description: c.description,
  avatar: c.avatar,
  banner: c.banner,
  memberCount: c.memberCount,
  createdAt: c.createdAt,
});

// GET /search?q=&type=posts|communities — MongoDB text search, ranked by score.
export const search = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  const type = req.query.type || "posts";
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

  if (!q) {
    throw new ApiError(400, "Query parameter 'q' is required");
  }
  if (!["posts", "communities"].includes(type)) {
    throw new ApiError(400, "type must be 'posts' or 'communities'");
  }

  // Project + sort by the text relevance score.
  const projection = { score: { $meta: "textScore" } };
  const sort = { score: { $meta: "textScore" } };

  if (type === "posts") {
    const posts = await Post.find({ $text: { $search: q } }, projection)
      .populate("authorId", "userName avatar karma")
      .populate("communityId", "name slug avatar")
      .sort(sort)
      .limit(limit);

    return successResponse(res, "Search results fetched successfully", {
      type,
      query: q,
      results: posts.map(presentPost),
    });
  }

  const communities = await Community.find({ $text: { $search: q } }, projection)
    .sort(sort)
    .limit(limit);

  return successResponse(res, "Search results fetched successfully", {
    type,
    query: q,
    results: communities.map(presentCommunity),
  });
});
