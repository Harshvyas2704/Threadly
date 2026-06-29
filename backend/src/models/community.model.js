import mongoose from "mongoose";

const CommunitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    },
    memberCount: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Full-text search over name and description (name weighted higher).
CommunitySchema.index(
  { name: "text", description: "text" },
  { weights: { name: 3, description: 1 }, name: "community_text" },
);

const Community = mongoose.model("Community", CommunitySchema);
export default Community;
