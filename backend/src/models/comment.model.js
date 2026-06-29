import mongoose from "mongoose";

export const MAX_COMMENT_DEPTH = 3;

const CommentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    // null = top-level comment
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    depth: {
      type: Number,
      default: 0,
      max: MAX_COMMENT_DEPTH,
    },
    voteScore: {
      type: Number,
      default: 0,
    },
    // Soft delete: row stays (so replies keep their thread), body becomes
    // "[deleted]" and this flips to true.
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Common access pattern: all comments for a post, oldest first.
CommentSchema.index({ postId: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
