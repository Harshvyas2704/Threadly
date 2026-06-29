import { useState } from "react";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import { usePagedPosts } from "../hooks/usePagedPosts";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { getHomeFeedApi, getTrendingApi } from "../api";

export default function HomeFeed() {
  const { user } = useAuth();
  const [tab, setTab] = useState(user ? "home" : "trending");

  const loader = (page) =>
    (tab === "trending" ? getTrendingApi(page) : getHomeFeedApi(page)).then(
      (d) => d.posts,
    );

  const { posts, loading, loadingMore, hasMore, loadMore } = usePagedPosts(
    loader,
    tab,
  );
  const sentinelRef = useInfiniteScroll(loadMore, {
    hasMore,
    loading: loadingMore,
  });

  return (
    <div className="container page">
      <div className="tabs">
        {user && (
          <button
            className={tab === "home" ? "active" : ""}
            onClick={() => setTab("home")}
          >
            Home
          </button>
        )}
        <button
          className={tab === "trending" ? "active" : ""}
          onClick={() => setTab("trending")}
        >
          Trending
        </button>
      </div>

      {loading ? (
        <div className="center">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="center">
          {tab === "home" ? (
            <>
              Your home feed is empty.{" "}
              <Link to="/" className="link" onClick={() => setTab("trending")}>
                Browse trending
              </Link>{" "}
              or join some communities.
            </>
          ) : (
            "No trending posts in the last 24 hours."
          )}
        </div>
      ) : (
        <>
          {posts.map((p) => (
            <PostCard key={p._id} post={p} />
          ))}
          {loadingMore && <div className="loading-more">Loading more…</div>}
          {!hasMore && <div className="feed-end">You're all caught up</div>}
          <div ref={sentinelRef} className="scroll-sentinel" />
        </>
      )}
    </div>
  );
}
