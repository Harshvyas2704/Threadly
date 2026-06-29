import mongoose from "mongoose";
import Community from "../models/community.model.js";
import CommunityMember from "../models/communityMember.model.js";
import Post from "../models/post.model.js";
import ApiError from "../utils/apiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { presentPost } from "../utils/postPresenter.util.js";
import { attachUserVotes } from "../services/vote.service.js";
import { slugify } from "../utils/slug.util.js";
import {
  cacheAside,
  delCache,
  cacheKeys,
  TTL,
} from "../services/cache.service.js";

// Shape a community document for responses.
const presentCommunity = (c) => ({
  _id: c._id,
  name: c.name,
  slug: c.slug,
  description: c.description,
  avatar: c.avatar,
  banner: c.banner,
  memberCount: c.memberCount,
  createdBy: c.createdBy,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

// Load a community by slug or throw 404.
const findCommunityBySlug = async (slug) => {
  const community = await Community.findOne({ slug });
  if (!community) {
    throw new ApiError(404, "Community not found");
  }
  return community;
};

// Throw unless the requester is the community owner.
const assertOwner = async (communityId, userId) => {
  const membership = await CommunityMember.findOne({ communityId, userId });
  if (!membership || membership.role !== "owner") {
    throw new ApiError(403, "Only the community owner can perform this action");
  }
  return membership;
};

// GET /communities?search= — public list, optional name/description search.
export const listCommunities = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const filter = {};
  if (search) {
    const term = new RegExp(search.trim(), "i");
    filter.$or = [{ name: term }, { slug: term }, { description: term }];
  }

  const communities = await Community.find(filter)
    .sort({ memberCount: -1, createdAt: -1 })
    .limit(50);

  return successResponse(res, "Communities fetched successfully", {
    communities: communities.map(presentCommunity),
  });
});

// POST /communities — create a community; creator becomes owner.
export const createCommunity = asyncHandler(async (req, res) => {
  const { name, description, avatar = "", banner = "" } = req.body;
  const slug = slugify(name);

  if (!slug) {
    throw new ApiError(400, "Name must contain at least one letter or number");
  }

  // Distinct names can still collapse to the same slug, so check both.
  const existing = await Community.findOne({ $or: [{ name }, { slug }] });
  if (existing) {
    const field = existing.name === name ? "name" : "slug";
    throw new ApiError(409, `Community ${field} already exists`);
  }

  // Atomic: community + its owner membership are created together.
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const [community] = await Community.create(
      [{ name, slug, description, avatar, banner, createdBy: req.user._id }],
      { session },
    );

    await CommunityMember.create(
      [{ communityId: community._id, userId: req.user._id, role: "owner" }],
      { session },
    );

    await session.commitTransaction();

    return successResponse(
      res,
      "Community created successfully",
      { community: presentCommunity(community) },
      201,
    );
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

// GET /communities/mine — communities the current user belongs to.
export const listMyCommunities = asyncHandler(async (req, res) => {
  const memberships = await CommunityMember.find({
    userId: req.user._id,
    role: { $ne: "banned" },
  }).select("communityId role");

  const roleByCommunity = new Map(
    memberships.map((m) => [String(m.communityId), m.role]),
  );

  const communities = await Community.find({
    _id: { $in: memberships.map((m) => m.communityId) },
  }).sort({ name: 1 });

  return successResponse(res, "Your communities fetched successfully", {
    communities: communities.map((c) => ({
      ...presentCommunity(c),
      role: roleByCommunity.get(String(c._id)),
    })),
  });
});

// GET /communities/:slug — public details, cached for 10 minutes.
export const getCommunity = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const community = await cacheAside(
    cacheKeys.community(slug),
    TTL.community,
    async () => presentCommunity(await findCommunityBySlug(slug)),
  );
  return successResponse(res, "Community fetched successfully", {
    community,
  });
});

// PUT /communities/:slug — owner only; updates presentational fields.
export const updateCommunity = asyncHandler(async (req, res) => {
  const community = await findCommunityBySlug(req.params.slug);
  await assertOwner(community._id, req.user._id);

  const { description, avatar, banner } = req.body;
  if (description !== undefined) community.description = description;
  if (avatar !== undefined) community.avatar = avatar;
  if (banner !== undefined) community.banner = banner;
  await community.save();

  // Invalidate the cached community so the next read is fresh.
  await delCache(cacheKeys.community(community.slug));

  return successResponse(res, "Community updated successfully", {
    community: presentCommunity(community),
  });
});

// POST /communities/:slug/join
export const joinCommunity = asyncHandler(async (req, res) => {
  const community = await findCommunityBySlug(req.params.slug);

  const existing = await CommunityMember.findOne({
    communityId: community._id,
    userId: req.user._id,
  });

  if (existing) {
    if (existing.role === "banned") {
      throw new ApiError(403, "You are banned from this community");
    }
    throw new ApiError(409, "You are already a member of this community");
  }

  await CommunityMember.create({
    communityId: community._id,
    userId: req.user._id,
    role: "member",
  });
  await Community.updateOne(
    { _id: community._id },
    { $inc: { memberCount: 1 } },
  );

  return successResponse(res, "Joined community successfully");
});

// POST /communities/:slug/leave
export const leaveCommunity = asyncHandler(async (req, res) => {
  const community = await findCommunityBySlug(req.params.slug);

  const membership = await CommunityMember.findOne({
    communityId: community._id,
    userId: req.user._id,
  });

  if (!membership) {
    throw new ApiError(400, "You are not a member of this community");
  }
  if (membership.role === "owner") {
    throw new ApiError(400, "The owner cannot leave their own community");
  }

  await membership.deleteOne();
  // Banned rows don't count toward memberCount, so don't decrement for them.
  if (membership.role !== "banned") {
    await Community.updateOne(
      { _id: community._id },
      { $inc: { memberCount: -1 } },
    );
  }

  return successResponse(res, "Left community successfully");
});

// GET /communities/:slug/members — public list of members.
export const listMembers = asyncHandler(async (req, res) => {
  const community = await findCommunityBySlug(req.params.slug);

  const members = await CommunityMember.find({ communityId: community._id })
    .populate("userId", "userName avatar karma")
    .sort({ joinedAt: 1 });

  return successResponse(res, "Members fetched successfully", {
    members: members
      .filter((m) => m.userId) // skip rows whose user was deleted
      .map((m) => ({
        user: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
  });
});

// GET /communities/:slug/posts — public; this community's posts, newest first.
export const listCommunityPosts = asyncHandler(async (req, res) => {
  const community = await findCommunityBySlug(req.params.slug);

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const posts = await Post.find({ communityId: community._id })
    .populate("authorId", "userName avatar karma")
    .populate("communityId", "name slug avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const presented = posts.map(presentPost);
  await attachUserVotes(presented, req.user?._id, "post");

  return successResponse(res, "Community posts fetched successfully", {
    posts: presented,
    page,
    limit,
  });
});

// PUT /communities/:slug/members/:userId — owner only; assign a role.
export const updateMemberRole = asyncHandler(async (req, res) => {
  const community = await findCommunityBySlug(req.params.slug);
  await assertOwner(community._id, req.user._id);

  const { userId } = req.params;
  if (userId === String(req.user._id)) {
    throw new ApiError(400, "The owner cannot change their own role");
  }

  const membership = await CommunityMember.findOne({
    communityId: community._id,
    userId,
  });
  if (!membership) {
    throw new ApiError(404, "Member not found in this community");
  }

  const wasBanned = membership.role === "banned";
  const willBan = req.body.role === "banned";
  membership.role = req.body.role;
  await membership.save();

  // Keep memberCount consistent as members move in/out of the banned state.
  if (!wasBanned && willBan) {
    await Community.updateOne(
      { _id: community._id },
      { $inc: { memberCount: -1 } },
    );
  } else if (wasBanned && !willBan) {
    await Community.updateOne(
      { _id: community._id },
      { $inc: { memberCount: 1 } },
    );
  }

  return successResponse(res, "Member role updated successfully", {
    member: { userId, role: membership.role },
  });
});
