// Vertical up/down voter used on post cards and the post detail header.
// `userVote` (1, -1, 0) highlights the active arrow.
export default function VoteControl({ score, userVote = 0, onVote }) {
  return (
    <div className="vote" onClick={(e) => e.stopPropagation()}>
      <button
        className={"up" + (userVote === 1 ? " active" : "")}
        onClick={() => onVote(1)}
        aria-label="upvote"
      >
        ▲
      </button>
      <span className={"score" + (userVote !== 0 ? " voted" : "")}>{score}</span>
      <button
        className={"down" + (userVote === -1 ? " active" : "")}
        onClick={() => onVote(-1)}
        aria-label="downvote"
      >
        ▼
      </button>
    </div>
  );
}
