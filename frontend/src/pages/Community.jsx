import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import { useMyCommunities } from "../context/CommunitiesContext";
import { usePagedPosts } from "../hooks/usePagedPosts";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import {
  getCommunityApi,
  getCommunityPostsApi,
  joinCommunityApi,
  leaveCommunityApi,
} from "../api";

export default function Community() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { communities: myCommunities, refresh } = useMyCommunities();

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Membership comes from the shared context, so the button reflects reality
  // and stays in sync with the left sidebar / Discover widget.
  const membership = myCommunities.find((c) => c.slug === slug);
  const joined = !!membership;
  const isOwner = membership?.role === "owner";

  const { posts, loadingMore, hasMore, loadMore } = usePagedPosts(
    (page) => getCommunityPostsApi(slug, page).then((d) => d.posts),
    slug,
  );
  const sentinelRef = useInfiniteScroll(loadMore, {
    hasMore,
    loading: loadingMore,
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    getCommunityApi(slug)
      .then((c) => active && setCommunity(c.community))
      .catch(() => active && setCommunity(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  const toggle = async () => {
    setBusy(true);
    setError(null);
    try {
      if (joined) {
        await leaveCommunityApi(slug);
        setCommunity((c) => ({ ...c, memberCount: c.memberCount - 1 }));
      } else {
        await joinCommunityApi(slug);
        setCommunity((c) => ({ ...c, memberCount: c.memberCount + 1 }));
      }
      await refresh(); // updates joined state + sidebar
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="center">Loading…</div>;
  if (!community) return <div className="center">Community not found.</div>;

  return (
    <div className="container page">
      <div className="community-header">
        <h1 style={{ margin: 0 }}>{community.name}</h1>
        <div className="muted">r/{community.slug}</div>
        <p>{community.description}</p>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="muted">{community.memberCount} members</span>
          {user &&
            (isOwner ? (
              <span className="role-tag">Owner</span>
            ) : (
              <button
                className={`btn small ${joined ? "joined-btn" : ""}`}
                onClick={toggle}
                disabled={busy}
              >
                {busy ? (
                  "…"
                ) : joined ? (
                  <>
                    <span className="lbl-joined">Joined ✓</span>
                    <span className="lbl-leave">Leave</span>
                  </>
                ) : (
                  "Join"
                )}
              </button>
            ))}
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      <h3>Posts</h3>
      {posts.length === 0 ? (
        <div className="center">No posts in this community yet.</div>
      ) : (
        <>
          {posts.map((p) => (
            <PostCard key={p._id} post={p} />
          ))}
          {loadingMore && <div className="loading-more">Loading more…</div>}
          {!hasMore && <div className="feed-end">End of posts</div>}
          <div ref={sentinelRef} className="scroll-sentinel" />
        </>
      )}
    </div>
  );
}
