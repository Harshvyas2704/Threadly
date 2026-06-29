import { Link, useNavigate } from "react-router-dom";
import VoteControl from "./VoteControl";
import { useVote } from "../hooks/useVote";
import { votePostApi } from "../api";

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const { score, userVote, vote } = useVote(post.voteScore, post.userVote, (v) =>
    votePostApi(post._id, v),
  );

  const slug = post.community?.slug;
  const detailUrl = `/r/${slug}/post/${post._id}`;
  const stop = (e) => e.stopPropagation();

  return (
    <div className="card post clickable" onClick={() => navigate(detailUrl)}>
      <VoteControl score={score} userVote={userVote} onVote={vote} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="meta">
          <Link to={`/r/${slug}`} className="link" onClick={stop}>
            r/{slug}
          </Link>{" "}
          · u/{post.author?.userName || "unknown"}
        </div>
        <div className="title">{post.title}</div>
        {post.type === "image" && post.mediaUrl ? (
          <img className="media" src={post.mediaUrl} alt="" />
        ) : post.type === "link" && post.mediaUrl ? (
          <a className="link" href={post.mediaUrl} target="_blank" rel="noreferrer" onClick={stop}>
            {post.mediaUrl}
          </a>
        ) : post.body ? (
          <div className="snippet">{post.body}</div>
        ) : null}
        <div className="footer">💬 {post.commentCount} comments</div>
      </div>
    </div>
  );
}
