import asyncHandler from "../utils/asyncHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { getHomeFeed, getTrendingFeed } from "../services/feed.service.js";
import { attachUserVotes } from "../services/vote.service.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";

// Clamp pagination params to sane bounds.
const parsePaging = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit };
};

// GET /feed/home — posts from the user's joined communities, newest first.
export const homeFeed = asyncHandler(async (req, res) => {
  const feed = await getHomeFeed(req.user._id, parsePaging(req.query));
  await attachUserVotes(feed.posts, req.user._id, "post");
  return successResponse(res, "Home feed fetched successfully", feed);
});

// GET /feed/trending — top posts in the last 24h (cached).
export const trendingFeed = asyncHandler(async (req, res) => {
  const feed = await getTrendingFeed(parsePaging(req.query));
  // Attach per-viewer votes after the (shared) cache so they aren't cached.
  await attachUserVotes(feed.posts, req.user?._id, "post");
  return successResponse(res, "Trending feed fetched successfully", feed);
});

// GET /feed/activity — newest posts and comments site-wide, merged and sorted
// by recency. Powers the "live activity" widget (the frontend polls it).
export const activityFeed = asyncHandler(async (req, res) => {
  const [posts, comments] = await Promise.all([
    Post.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("authorId", "userName")
      .populate("communityId", "slug"),
    Comment.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("authorId", "userName")
      .populate({
        path: "postId",
        select: "title communityId",
        populate: { path: "communityId", select: "slug" },
      }),
  ]);

  const items = [
    ...posts.map((p) => ({
      type: "post",
      _id: p._id,
      createdAt: p.createdAt,
      userName: p.authorId?.userName,
      communitySlug: p.communityId?.slug,
      postId: p._id,
      title: p.title,
    })),
    ...comments
      .filter((c) => c.postId) // skip comments whose post was deleted
      .map((c) => ({
        type: "comment",
        _id: c._id,
        createdAt: c.createdAt,
        userName: c.authorId?.userName,
        communitySlug: c.postId.communityId?.slug,
        postId: c.postId._id,
        title: c.postId.title,
        body: c.body,
      })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 12);

  return successResponse(res, "Activity fetched successfully", { items });
});
