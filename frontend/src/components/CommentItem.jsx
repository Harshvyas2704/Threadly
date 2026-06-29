import { useVote } from "../hooks/useVote";
import { voteCommentApi } from "../api";

export default function CommentItem({ comment, onReply }) {
  const { score, userVote, vote } = useVote(
    comment.voteScore,
    comment.userVote,
    (v) => voteCommentApi(comment._id, v),
  );

  return (
    <div className="card comment" style={{ marginLeft: comment.depth * 16 }}>
      <div className="author">
        u/{comment.author?.userName || (comment.isDeleted ? "—" : "unknown")}
      </div>
      <div className={comment.isDeleted ? "deleted" : ""}>{comment.body}</div>
      <div className="actions">
        <span className="row">
          <button
            className={"up" + (userVote === 1 ? " active" : "")}
            style={btn}
            onClick={() => vote(1)}
          >
            ▲
          </button>
          <span className="score">{score}</span>
          <button
            className={"down" + (userVote === -1 ? " active" : "")}
            style={btn}
            onClick={() => vote(-1)}
          >
            ▼
          </button>
        </span>
        {!comment.isDeleted && comment.depth < 3 ? (
          <button className="link" style={btn} onClick={() => onReply(comment)}>
            Reply
          </button>
        ) : null}
      </div>
    </div>
  );
}

const btn = { background: "none", border: "none", padding: 2, fontSize: 14 };
