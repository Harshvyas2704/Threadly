// Dev seed script: wipes the app collections and inserts deterministic test
// data so the API can be exercised end to end. Run with `npm run seed`.
// DESTRUCTIVE — intended for a development database only.
import "dotenv/config";

import mongoose from "mongoose";
import Redis from "ioredis";
import connectDB from "../config/connectDB.js";
import User from "../models/user.model.js";
import Community from "../models/community.model.js";
import CommunityMember from "../models/communityMember.model.js";
import Post from "../models/post.model.js";
import Vote from "../models/vote.model.js";
import { slugify } from "../utils/slug.util.js";

const PASSWORD = "password123";

// Drop any Redis state that would otherwise point at the wiped Mongo docs
// (cached communities/feeds) or carry over stale rate-limit counters.
async function clearRedis() {
  if (!process.env.REDIS_URL) return;
  const r = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2 });
  try {
    const patterns = ["community:*", "feed:*", "ratelimit:*"];
    for (const pattern of patterns) {
      const keys = await r.keys(pattern);
      if (keys.length) await r.del(...keys);
    }
    console.log("Cleared Redis cache + rate-limit keys");
  } catch (err) {
    console.warn(`Redis clear skipped: ${err.message}`);
  } finally {
    r.disconnect();
  }
}

async function seed() {
  await connectDB();

  console.log("Wiping collections...");
  await Promise.all([
    User.deleteMany({}),
    Community.deleteMany({}),
    CommunityMember.deleteMany({}),
    Post.deleteMany({}),
    Vote.deleteMany({}),
  ]);

  await clearRedis();

  // --- Users (passwordHash goes through the model's pre-save hash hook) ---
  console.log("Creating users...");
  const [alice, bob, carol] = await User.create([
    { userName: "alice", email: "alice@threadly.dev", passwordHash: PASSWORD, bio: "founder of webdev" },
    { userName: "bob", email: "bob@threadly.dev", passwordHash: PASSWORD, bio: "gamer" },
    { userName: "carol", email: "carol@threadly.dev", passwordHash: PASSWORD },
  ]);

  // --- Communities (each creator becomes owner) ---
  console.log("Creating communities...");
  const communitySpecs = [
    { name: "Web Dev", description: "All about web development", owner: alice },
    { name: "Gaming", description: "Games and gaming news", owner: bob },
  ];

  const communities = {};
  for (const spec of communitySpecs) {
    const community = await Community.create({
      name: spec.name,
      slug: slugify(spec.name),
      description: spec.description,
      createdBy: spec.owner._id,
      memberCount: 1,
    });
    await CommunityMember.create({
      communityId: community._id,
      userId: spec.owner._id,
      role: "owner",
    });
    communities[community.slug] = community;
  }

  const webdev = communities["web-dev"];
  const gaming = communities["gaming"];

  // --- Extra memberships ---
  console.log("Adding members...");
  const memberships = [
    { community: webdev, user: bob, role: "member" },
    { community: webdev, user: carol, role: "moderator" },
    { community: gaming, user: alice, role: "member" },
  ];
  for (const m of memberships) {
    await CommunityMember.create({
      communityId: m.community._id,
      userId: m.user._id,
      role: m.role,
    });
    await Community.updateOne(
      { _id: m.community._id },
      { $inc: { memberCount: 1 } },
    );
  }

  // --- Posts ---
  console.log("Creating posts...");
  const post1 = await Post.create({
    communityId: webdev._id,
    authorId: alice._id,
    title: "Welcome to Web Dev",
    body: "Share your favorite frameworks here.",
    type: "text",
  });
  const post2 = await Post.create({
    communityId: webdev._id,
    authorId: bob._id,
    title: "Great article on HTTP caching",
    type: "link",
    mediaUrl: "https://example.com/http-caching",
  });
  await Post.create({
    communityId: gaming._id,
    authorId: bob._id,
    title: "Best indie games of the year",
    body: "What are you playing?",
    type: "text",
  });

  // --- Votes (and keep voteScore consistent) ---
  console.log("Casting votes...");
  const votes = [
    { user: bob, post: post1, value: 1 },
    { user: carol, post: post1, value: 1 },
    { user: alice, post: post2, value: 1 },
    { user: carol, post: post2, value: -1 },
  ];
  for (const v of votes) {
    await Vote.create({
      userId: v.user._id,
      targetId: v.post._id,
      targetType: "post",
      value: v.value,
    });
    await Post.updateOne(
      { _id: v.post._id },
      { $inc: { voteScore: v.value } },
    );
  }

  console.log("\nSeed complete:");
  console.log(`  users:        ${await User.countDocuments()}`);
  console.log(`  communities:  ${await Community.countDocuments()}`);
  console.log(`  memberships:  ${await CommunityMember.countDocuments()}`);
  console.log(`  posts:        ${await Post.countDocuments()}`);
  console.log(`  votes:        ${await Vote.countDocuments()}`);
  console.log(`\n  Login with any user + password: ${PASSWORD}`);
  console.log("  e.g. alice@threadly.dev / bob@threadly.dev / carol@threadly.dev");

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
