import Comment, { MAX_COMMENT_DEPTH } from "../models/comment.model.js";
import Post from "../models/post.model.js";
import Vote from "../models/vote.model.js";
import ApiError from "../utils/apiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { applyVote } from "../services/vote.service.js";
import {
  assertCanParticipate,
  getMembership,
  isModerator,
} from "../services/membership.service.js";

const presentComment = (c) => ({
  _id: c._id,
  // Deleted comments expose a placeholder body and no author.
  body: c.isDeleted ? "[deleted]" : c.body,
  author: c.isDeleted ? null : c.authorId,
  postId: c.postId,
  parentId: c.parentId,
  depth: c.depth,
  voteScore: c.voteScore,
  isDeleted: c.isDeleted,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

const findCommentById = async (id) => {
  const comment = await Comment.findById(id);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  return comment;
};

// GET /posts/:postId/comments — public; flat list, oldest first.
export const listComments = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comments = await Comment.find({ postId: post._id })
    .populate("authorId", "userName avatar karma")
    .sort({ createdAt: 1 });

  return successResponse(res, "Comments fetched successfully", {
    comments: comments.map(presentComment),
  });
});

// POST /posts/:postId/comments — non-banned members only.
export const createComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  await assertCanParticipate(post.communityId, req.user._id);

  const { body, parentId } = req.body;

  // Determine depth from the parent (if any) and enforce the nesting limit.
  let depth = 0;
  if (parentId) {
    const parent = await Comment.findById(parentId);
    if (!parent || String(parent.postId) !== String(post._id)) {
      throw new ApiError(404, "Parent comment not found on this post");
    }
    depth = parent.depth + 1;
    if (depth > MAX_COMMENT_DEPTH) {
      throw new ApiError(
        400,
        `Maximum reply depth of ${MAX_COMMENT_DEPTH} reached`,
      );
    }
  }

  const comment = await Comment.create({
    body,
    authorId: req.user._id,
    postId: post._id,
    parentId: parentId || null,
    depth,
  });

  await Post.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });

  await comment.populate("authorId", "userName avatar karma");
  return successResponse(
    res,
    "Comment created successfully",
    { comment: presentComment(comment) },
    201,
  );
});

// PUT /comments/:id — author only; not editable once deleted.
export const updateComment = asyncHandler(async (req, res) => {
  const comment = await findCommentById(req.params.id);

  if (comment.isDeleted) {
    throw new ApiError(400, "Cannot edit a deleted comment");
  }
  if (String(comment.authorId) !== String(req.user._id)) {
    throw new ApiError(403, "Only the author can edit this comment");
  }

  comment.body = req.body.body;
  await comment.save();

  await comment.populate("authorId", "userName avatar karma");
  return successResponse(res, "Comment updated successfully", {
    comment: presentComment(comment),
  });
});

// DELETE /comments/:id — author or community mod/owner. Soft delete.
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await findCommentById(req.params.id);

  if (comment.isDeleted) {
    throw new ApiError(400, "Comment already deleted");
  }

  const isAuthor = String(comment.authorId) === String(req.user._id);
  let allowed = isAuthor;
  if (!allowed) {
    const post = await Post.findById(comment.postId);
    const membership = post
      ? await getMembership(post.communityId, req.user._id)
      : null;
    allowed = isModerator(membership);
  }
  if (!allowed) {
    throw new ApiError(403, "Not allowed to delete this comment");
  }

  comment.isDeleted = true;
  comment.body = "[deleted]";
  await comment.save();

  // Active comment count drops, but the row stays for thread structure.
  await Post.updateOne(
    { _id: comment.postId },
    { $inc: { commentCount: -1 } },
  );

  return successResponse(res, "Comment deleted successfully");
});

// POST /comments/:id/vote — non-banned members only; updates voteScore.
export const voteComment = asyncHandler(async (req, res) => {
  const comment = await findCommentById(req.params.id);

  const post = await Post.findById(comment.postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  await assertCanParticipate(post.communityId, req.user._id);

  const { voteScore, userVote } = await applyVote({
    Model: Comment,
    targetType: "comment",
    targetId: comment._id,
    userId: req.user._id,
    value: req.body.value,
  });

  return successResponse(res, "Vote registered successfully", {
    voteScore,
    userVote,
  });
});
