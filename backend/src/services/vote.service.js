import Vote from "../models/vote.model.js";

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
