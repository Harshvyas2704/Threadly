import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import VoteControl from "../components/VoteControl";
import CommentItem from "../components/CommentItem";
import { useVote } from "../hooks/useVote";
import { useAuth } from "../context/AuthContext";
import {
  getPostApi,
  votePostApi,
  listCommentsApi,
  createCommentApi,
} from "../api";

function PostBody({ post }) {
  const { score, userVote, vote } = useVote(post.voteScore, post.userVote, (v) =>
    votePostApi(post._id, v),
  );
  return (
    <div className="card post">
      <VoteControl score={score} userVote={userVote} onVote={vote} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="meta">
          <Link to={`/r/${post.community?.slug}`} className="link">
            r/{post.community?.slug}
          </Link>{" "}
          · u/{post.author?.userName}
        </div>
        <h2 style={{ margin: "4px 0" }}>{post.title}</h2>
        {post.type === "image" && post.mediaUrl ? (
          <img className="media" src={post.mediaUrl} alt="" />
        ) : post.type === "link" && post.mediaUrl ? (
          <a className="link" href={post.mediaUrl} target="_blank" rel="noreferrer">
            {post.mediaUrl}
          </a>
        ) : post.body ? (
          <p className="snippet">{post.body}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([getPostApi(id), listCommentsApi(id)]);
      setPost(p.post);
      setComments(c.comments);
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError(null);
    try {
      await createCommentApi(id, text.trim(), replyTo?._id ?? null);
      setText("");
      setReplyTo(null);
      await load();
    } catch (err) {
      setError(err.message || "Could not post comment");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="center">Loading…</div>;
  if (!post) return <div className="center">Post not found.</div>;

  return (
    <div className="container page">
      <PostBody post={post} />

      {user ? (
        <form className="card" onSubmit={send}>
          {replyTo && (
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="muted">
                Replying to u/{replyTo.author?.userName}
              </span>
              <button
                type="button"
                className="link"
                style={{ background: "none", border: "none" }}
                onClick={() => setReplyTo(null)}
              >
                ✕ cancel
              </button>
            </div>
          )}
          <div className="composer">
            <textarea
              className="input"
              rows={2}
              placeholder="Add a comment…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="btn" disabled={sending || !text.trim()}>
              {sending ? "…" : "Comment"}
            </button>
          </div>
          {error && <div className="error">{error}</div>}
        </form>
      ) : (
        <div className="card muted">
          <Link to="/login" className="link">
            Log in
          </Link>{" "}
          to comment and vote.
        </div>
      )}

      <h3>{post.commentCount} Comments</h3>
      {comments.length === 0 ? (
        <div className="center">No comments yet.</div>
      ) : (
        comments.map((c) => (
          <CommentItem key={c._id} comment={c} onReply={setReplyTo} />
        ))
      )}
    </div>
  );
}
