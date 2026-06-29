import CommunityMember from "../models/communityMember.model.js";
import ApiError from "../utils/apiError.util.js";

export const getMembership = (communityId, userId) =>
  CommunityMember.findOne({ communityId, userId });

// Owners and moderators can moderate content (e.g. delete others' posts).
export const isModerator = (membership) =>
  !!membership && ["owner", "moderator"].includes(membership.role);

// A user may post/comment only if they're a member and not banned.
// Returns the membership on success.
export const assertCanParticipate = async (communityId, userId) => {
  const membership = await getMembership(communityId, userId);
  if (!membership) {
    throw new ApiError(403, "You must join this community first");
  }
  if (membership.role === "banned") {
    throw new ApiError(403, "You are banned from this community");
  }
  return membership;
};
