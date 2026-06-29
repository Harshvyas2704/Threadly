import { useState } from "react";

// Optimistic vote state shared by posts and comments, tracking both the score
// and the viewer's current vote (1, -1, or 0) so toggling/flipping matches the
// server. `voteFn(value)` hits the API and resolves to { voteScore, userVote }.
export function useVote(initialScore, initialUserVote, voteFn) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote ?? 0);

  const vote = async (value) => {
    const prevScore = score;
    const prevUserVote = userVote;

    // Predict the result so the UI updates instantly and never overshoots.
    let nextUserVote;
    let delta;
    if (userVote === value) {
      nextUserVote = 0; // clicking the same arrow again toggles it off
      delta = -value;
    } else if (userVote === 0) {
      nextUserVote = value; // first vote
      delta = value;
    } else {
      nextUserVote = value; // flipping from up<->down
      delta = 2 * value;
    }

    setUserVote(nextUserVote);
    setScore((s) => s + delta);

    try {
      const data = await voteFn(value);
      setScore(data.voteScore);
      if (typeof data.userVote === "number") setUserVote(data.userVote);
    } catch {
      setScore(prevScore);
      setUserVote(prevUserVote);
    }
  };

  return { score, userVote, vote };
}
