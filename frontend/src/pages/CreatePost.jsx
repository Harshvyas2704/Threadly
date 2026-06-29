import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listCommunitiesApi, createPostApi } from "../api";

export default function CreatePost() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [communityId, setCommunityId] = useState("");
  const [type, setType] = useState("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listCommunitiesApi()
      .then((data) => setCommunities(data.communities))
      .catch(() => setCommunities([]));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!communityId) return setError("Pick a community");
    if (!title.trim()) return setError("Title is required");
    if (type === "link" && !mediaUrl.trim())
      return setError("Link posts need a URL");

    setSubmitting(true);
    try {
      const payload = { communityId, title: title.trim(), type };
      if (type === "text") payload.body = body;
      if (type === "link") payload.mediaUrl = mediaUrl.trim();
      const data = await createPostApi(payload);
      const slug = data.post.community?.slug;
      navigate(`/r/${slug}/post/${data.post._id}`);
    } catch (err) {
      setError(err.message || "Could not create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <h2>Create a post</h2>
      <form className="card stack" onSubmit={submit}>
        <select
          className="input"
          value={communityId}
          onChange={(e) => setCommunityId(e.target.value)}
        >
          <option value="">Choose a community…</option>
          {communities.map((c) => (
            <option key={c._id} value={c._id}>
              r/{c.slug}
            </option>
          ))}
        </select>

        <div className="tabs">
          {["text", "link"].map((t) => (
            <button
              type="button"
              key={t}
              className={type === t ? "active" : ""}
              onClick={() => setType(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <input
          className="input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {type === "text" ? (
          <textarea
            className="input"
            placeholder="Text (optional)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        ) : (
          <input
            className="input"
            placeholder="https://…"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
        )}

        {error && <div className="error">{error}</div>}
        <button className="btn" disabled={submitting}>
          {submitting ? "Posting…" : "Post"}
        </button>
      </form>
    </div>
  );
}
