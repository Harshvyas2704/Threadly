import mongoose from "mongoose";

export const POST_TYPES = ["text", "link", "image"];

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    body: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: POST_TYPES,
      default: "text",
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    voteScore: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Common access pattern: a community's posts, newest first.
PostSchema.index({ communityId: 1, createdAt: -1 });

// Full-text search over title and body (title weighted higher).
PostSchema.index(
  { title: "text", body: "text" },
  { weights: { title: 3, body: 1 }, name: "post_text" },
);

const Post = mongoose.model("Post", PostSchema);
export default Post;
