// Each action writes directly to the Mongoose models (reusing the same hooks
// the API uses, e.g. password hashing) and replicates the invariants the
// controllers maintain: memberCount, commentCount, comment depth.
import User from "../models/user.model.js";
import Community from "../models/community.model.js";
import CommunityMember from "../models/communityMember.model.js";
import Post from "../models/post.model.js";
import Comment, { MAX_COMMENT_DEPTH } from "../models/comment.model.js";
import { slugify } from "../utils/slug.util.js";
import {
  SIM_PASSWORD,
  randomInt,
  randomUserName,
  randomCommunityName,
  randomDescription,
  randomTitle,
  randomSentence,
} from "./random.js";

const sampleOne = async (Model, match = {}) => {
  const pipeline = Object.keys(match).length ? [{ $match: match }] : [];
  pipeline.push({ $sample: { size: 1 } });
  const [doc] = await Model.aggregate(pipeline);
  return doc || null;
};

// Create a user with random, unique credentials (password is shared so the
// generated accounts can be logged into).
export const createUser = async (log) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const userName = randomUserName();
    try {
      const user = await User.create({
        userName,
        email: `${userName}@sim.threadly.dev`,
        passwordHash: SIM_PASSWORD,
      });
      log(`👤 user created: ${userName}`);
      return user;
    } catch (err) {
      if (err.code !== 11000) throw err; // retry only on duplicate key
    }
  }
  log("⚠️  user: gave up after name collisions");
  return null;
};

// Create a community owned by a random user, then add several random members.
export const createCommunity = async (log) => {
  const creator = await sampleOne(User);
  if (!creator) {
    log("…  community skipped: no users yet");
    return null;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const name = randomCommunityName();
    const slug = slugify(name);
    try {
      const community = await Community.create({
        name,
        slug,
        description: randomDescription(),
        createdBy: creator._id,
        memberCount: 1,
      });
      await CommunityMember.create({
        communityId: community._id,
        userId: creator._id,
        role: "owner",
      });

      // Pull a random batch of other users in as members.
      const candidates = await User.aggregate([
        { $match: { _id: { $ne: creator._id } } },
        { $sample: { size: randomInt(2, 5) } },
      ]);
      let added = 0;
      for (const u of candidates) {
        try {
          await CommunityMember.create({
            communityId: community._id,
            userId: u._id,
            role: "member",
          });
          added += 1;
        } catch (err) {
          if (err.code !== 11000) throw err; // already a member — skip
        }
      }
      if (added) {
        await Community.updateOne(
          { _id: community._id },
          { $inc: { memberCount: added } },
        );
      }

      log(
        `🏘️  community created: r/${slug} (owner ${creator.userName}, +${added} members)`,
      );
      return community;
    } catch (err) {
      if (err.code !== 11000) throw err; // retry only on name/slug collision
    }
  }
  log("⚠️  community: gave up after name collisions");
  return null;
};

// A random member posts to one of their communities.
export const createPost = async (log) => {
  // A non-banned membership is exactly "a user + one of their communities".
  const membership = await sampleOne(CommunityMember, { role: { $ne: "banned" } });
  if (!membership) {
    log("…  post skipped: no community members yet");
    return null;
  }

  const title = randomTitle();
  const post = await Post.create({
    authorId: membership.userId,
    communityId: membership.communityId,
    title,
    body: randomSentence(),
    type: "text",
  });

  const [user, community] = await Promise.all([
    User.findById(membership.userId).select("userName"),
    Community.findById(membership.communityId).select("slug"),
  ]);
  log(`📝 ${user?.userName} posted in r/${community?.slug}: "${title}"`);
  return post;
};

// A random eligible member comments on a random post — sometimes as a reply.
export const createComment = async (log) => {
  const post = await sampleOne(Post);
  if (!post) {
    log("…  comment skipped: no posts yet");
    return null;
  }

  const member = await sampleOne(CommunityMember, {
    communityId: post.communityId,
    role: { $ne: "banned" },
  });
  if (!member) {
    log("…  comment skipped: no eligible members for that post");
    return null;
  }

  // ~50% of the time, reply to an existing comment (respecting max depth).
  let parentId = null;
  let depth = 0;
  if (Math.random() < 0.5) {
    const parent = await sampleOne(Comment, {
      postId: post._id,
      isDeleted: false,
    });
    if (parent && parent.depth < MAX_COMMENT_DEPTH) {
      parentId = parent._id;
      depth = parent.depth + 1;
    }
  }

  await Comment.create({
    body: randomSentence(),
    authorId: member.userId,
    postId: post._id,
    parentId,
    depth,
  });
  await Post.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });

  const user = await User.findById(member.userId).select("userName");
  log(
    `💬 ${user?.userName} commented on "${post.title}"${parentId ? " (reply)" : ""}`,
  );
};
