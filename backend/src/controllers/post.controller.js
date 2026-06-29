import Post from "../models/post.model.js";
import Vote from "../models/vote.model.js";
import Community from "../models/community.model.js";
import ApiError from "../utils/apiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { applyVote } from "../services/vote.service.js";
import { presentPost } from "../utils/postPresenter.util.js";
import {
  assertCanParticipate,
  getMembership,
  isModerator,
} from "../services/membership.service.js";

// Load a post by id (404 if missing). Optionally populate author/community.
const findPostById = async (id, { populate = false } = {}) => {
  let query = Post.findById(id);
  if (populate) {
    query = query
      .populate("authorId", "userName avatar karma")
      .populate("communityId", "name slug avatar");
  }
  const post = await query;
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  return post;
};

// POST /posts — only non-banned members of the community can post.
export const createPost = asyncHandler(async (req, res) => {
  const { communityId, title, body = "", type = "text", mediaUrl = "" } =
    req.body;

  const community = await Community.findById(communityId);
  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  await assertCanParticipate(communityId, req.user._id);

  const post = await Post.create({
    communityId,
    authorId: req.user._id,
    title,
    body,
    type,
    mediaUrl,
  });

  const populated = await findPostById(post._id, { populate: true });
  return successResponse(
    res,
    "Post created successfully",
    { post: presentPost(populated) },
    201,
  );
});

// GET /posts/:id — public.
export const getPost = asyncHandler(async (req, res) => {
  const post = await findPostById(req.params.id, { populate: true });
  return successResponse(res, "Post fetched successfully", {
    post: presentPost(post),
  });
});

// PUT /posts/:id — author only; edits content fields.
export const updatePost = asyncHandler(async (req, res) => {
  const post = await findPostById(req.params.id);

  if (String(post.authorId) !== String(req.user._id)) {
    throw new ApiError(403, "Only the author can edit this post");
  }

  const { title, body, mediaUrl } = req.body;
  if (title !== undefined) post.title = title;
  if (body !== undefined) post.body = body;
  // mediaUrl only meaningful for link/image posts.
  if (mediaUrl !== undefined && post.type !== "text") post.mediaUrl = mediaUrl;
  await post.save();

  const populated = await findPostById(post._id, { populate: true });
  return successResponse(res, "Post updated successfully", {
    post: presentPost(populated),
  });
});

// DELETE /posts/:id — author or a community owner/moderator.
export const deletePost = asyncHandler(async (req, res) => {
  const post = await findPostById(req.params.id);

  const isAuthor = String(post.authorId) === String(req.user._id);
  let allowed = isAuthor;
  if (!allowed) {
    const membership = await getMembership(post.communityId, req.user._id);
    allowed = isModerator(membership);
  }
  if (!allowed) {
    throw new ApiError(403, "Not allowed to delete this post");
  }

  await post.deleteOne();
  // Clean up votes attached to this post.
  await Vote.deleteMany({ targetId: post._id, targetType: "post" });

  return successResponse(res, "Post deleted successfully");
});

// POST /posts/:id/vote — upsert/toggle vote; updates voteScore.
export const votePost = asyncHandler(async (req, res) => {
  const post = await findPostById(req.params.id);

  // Non-banned members only (Reddit-style: must belong to the community).
  await assertCanParticipate(post.communityId, req.user._id);

  const { voteScore, userVote } = await applyVote({
    Model: Post,
    targetType: "post",
    targetId: post._id,
    userId: req.user._id,
    value: req.body.value,
  });

  return successResponse(res, "Vote registered successfully", {
    voteScore,
    userVote,
  });
});
