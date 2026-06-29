import { useState, useEffect, useRef, useCallback } from "react";

// Backend feed/community endpoints page at this size.
const PAGE_SIZE = 20;

// Paginated post list. `loader(page)` resolves to an array of posts.
// When `resetKey` changes (tab switch, different community) it reloads page 1.
export function usePagedPosts(loader, resetKey) {
  // Always call the latest loader without making it a reset dependency.
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPage(1);
    setPosts([]);
    loaderRef
      .current(1)
      .then((ps) => {
        if (!active) return;
        setPosts(ps);
        setHasMore(ps.length >= PAGE_SIZE);
      })
      .catch(() => active && setPosts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [resetKey]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const next = page + 1;
      const ps = await loaderRef.current(next);
      setPosts((prev) => [...prev, ...ps]);
      setPage(next);
      setHasMore(ps.length >= PAGE_SIZE);
    } catch {
      // leave existing posts in place on failure
    } finally {
      setLoadingMore(false);
    }
  }, [page]);

  return { posts, loading, loadingMore, hasMore, loadMore };
}
