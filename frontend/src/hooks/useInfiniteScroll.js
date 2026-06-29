import { useEffect, useRef } from "react";

// Returns a ref to attach to a sentinel element near the bottom of a list.
// When the sentinel scrolls within `rootMargin` of the viewport, `onLoadMore`
// fires — as long as there's more to load and we're not already loading.
export function useInfiniteScroll(onLoadMore, { hasMore, loading }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { rootMargin: "600px" }, // begin loading before the user hits the bottom
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loading]);

  return sentinelRef;
}
