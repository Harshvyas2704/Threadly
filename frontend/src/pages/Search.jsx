import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import { searchApi } from "../api";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [type, setType] = useState("posts");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    let active = true;
    setLoading(true);
    searchApi(q, type)
      .then((data) => active && setResults(data.results))
      .catch(() => active && setResults([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [q, type]);

  return (
    <div className="container page">
      <h2>
        Search results for “{q}”
      </h2>
      <div className="tabs">
        {["posts", "communities"].map((t) => (
          <button
            key={t}
            className={type === t ? "active" : ""}
            onClick={() => setType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="center">Searching…</div>
      ) : results.length === 0 ? (
        <div className="center">No results.</div>
      ) : type === "posts" ? (
        results.map((p) => <PostCard key={p._id} post={p} />)
      ) : (
        results.map((c) => (
          <Link key={c._id} to={`/r/${c.slug}`} className="card" style={{ display: "block" }}>
            <div style={{ fontWeight: 700 }}>r/{c.slug}</div>
            <div className="muted">{c.description}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              {c.memberCount} members
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
