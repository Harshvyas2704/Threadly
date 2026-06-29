import Vote from "../models/vote.model.js";

// Annotates a list of presented posts/comments with the viewer's own vote
// (1, -1, or 0) so the UI can highlight arrows and compute toggles correctly.
// Mutates and returns the same array. No-op (all zeros) for guests.
export const attachUserVotes = async (items, userId, targetType) => {
  if (!items.length) return items;
  if (!userId) {
    items.forEach((i) => {
      i.userVote = 0;
    });
    return items;
  }

  const votes = await Vote.find({
    userId,
    targetType,
    targetId: { $in: items.map((i) => i._id) },
  }).select("targetId value");

  const byTarget = new Map(votes.map((v) => [String(v.targetId), v.value]));
  items.forEach((i) => {
    i.userVote = byTarget.get(String(i._id)) || 0;
  });
  return items;
};

// Applies a vote to a target (post or comment) with upsert + toggle semantics:
//   - no existing vote      -> create it,        score delta = value
//   - same direction again  -> remove the vote,  score delta = -value  (toggle off)
//   - opposite direction    -> flip the vote,    score delta = 2 * value
// Then atomically applies the delta to the target document's voteScore.
// Returns the target's new voteScore and the caller's current vote (1, -1, or 0).
export const applyVote = async ({ Model, targetType, targetId, userId, value }) => {
  const existing = await Vote.findOne({ userId, targetId, targetType });

  let delta;
  let userVote;

  if (!existing) {
    await Vote.create({ userId, targetId, targetType, value });
    delta = value;
    userVote = value;
  } else if (existing.value === value) {
    await existing.deleteOne();
    delta = -value;
    userVote = 0;
  } else {
    existing.value = value;
    await existing.save();
    delta = 2 * value;
    userVote = value;
  }

  const updated = await Model.findByIdAndUpdate(
    targetId,
    { $inc: { voteScore: delta } },
    { new: true },
  );

  return { voteScore: updated.voteScore, userVote };
};
