import mongoose from "mongoose";

export const MEMBER_ROLES = ["owner", "moderator", "member", "banned"];

const CommunityMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
  role: {
    type: String,
    enum: MEMBER_ROLES,
    default: "member",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

// A user can hold only one membership row per community.
CommunityMemberSchema.index({ userId: 1, communityId: 1 }, { unique: true });

const CommunityMember = mongoose.model(
  "CommunityMember",
  CommunityMemberSchema,
);
export default CommunityMember;
