import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCommunityApi } from "../api";
import { useMyCommunities } from "../context/CommunitiesContext";

export default function CreateCommunity() {
  const navigate = useNavigate();
  const { refresh } = useMyCommunities();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Name is required");
    if (!description.trim()) return setError("Description is required");

    setBusy(true);
    try {
      const data = await createCommunityApi({
        name: name.trim(),
        description: description.trim(),
      });
      await refresh(); // you're the owner now — show it in the sidebar
      navigate(`/r/${data.community.slug}`);
    } catch (err) {
      setError(err.message || "Could not create community");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page">
      <h2>Create a community</h2>
      <form className="card stack" onSubmit={submit}>
        <div>
          <input
            className="input"
            placeholder="Community name (3–50 characters)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {name && (
            <div className="muted micro" style={{ marginTop: 6 }}>
              URL: r/
              {name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/[\s-]+/g, "-")
                .replace(/^-+|-+$/g, "")}
            </div>
          )}
        </div>
        <textarea
          className="input"
          placeholder="What is this community about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && <div className="error">{error}</div>}
        <button className="btn" disabled={busy}>
          {busy ? "Creating…" : "Create Community"}
        </button>
      </form>
    </div>
  );
}
