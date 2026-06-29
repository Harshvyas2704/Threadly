import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMyCommunities } from "../context/CommunitiesContext";
import { listCommunitiesApi, getActivityApi, joinCommunityApi } from "../api";

const truncate = (s = "", n = 48) =>
  s.length > n ? s.slice(0, n).trimEnd() + "…" : s;

const timeAgo = (date) => {
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  return `${Math.floor(secs / 86400)}d`;
};

function ProfileCard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="side-card">
        <div className="widget-title">Welcome to Threadly</div>
        <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
          Communities, posts, and conversations.
        </p>
        <Link to="/login" className="btn small block">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="side-card profile-widget">
      <div className="avatar sm">{user.userName[0].toUpperCase()}</div>
      <div className="pw-name">u/{user.userName}</div>
      <div className="pw-stats">
        <b>{user.karma ?? 0}</b> karma
      </div>
      <Link to="/create" className="btn small block">
        Create Post
      </Link>
    </div>
  );
}

function Discover() {
  const { user } = useAuth();
  const { communities: mine, refresh } = useMyCommunities();
  const [all, setAll] = useState([]);

  useEffect(() => {
    listCommunitiesApi()
      .then((d) => setAll(d.communities))
      .catch(() => setAll([]));
  }, []);

  const mineIds = new Set(mine.map((c) => c._id));
  const join = async (slug) => {
    try {
      await joinCommunityApi(slug);
      await refresh();
    } catch {
      // ignore (e.g. already a member)
    }
  };

  return (
    <div className="side-card">
      <div className="widget-title">Discover communities</div>
      <ul className="discover-list">
        {all.slice(0, 6).map((c) => (
          <li key={c._id}>
            <Link to={`/r/${c.slug}`} className="d-name">
              <span className="c-badge">{c.slug[0].toUpperCase()}</span>
              <span>
                <div>r/{c.slug}</div>
                <div className="muted micro">{c.memberCount} members</div>
              </span>
            </Link>
            {user &&
              (mineIds.has(c._id) ? (
                <span className="joined-tag">Joined</span>
              ) : (
                <button className="btn small" onClick={() => join(c.slug)}>
                  Join
                </button>
              ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LiveActivity() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    const load = () =>
      getActivityApi()
        .then((d) => active && setItems(d.items))
        .catch(() => {});
    load();
    const id = setInterval(load, 20000); // poll for fresh activity
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="side-card">
      <div className="widget-title">
        <span className="live-dot" /> Live activity
      </div>
      {items.length === 0 ? (
        <div className="side-empty">Waiting for activity…</div>
      ) : (
        <ul className="activity-list">
          {items.map((i) => (
            <li key={i._id}>
              <Link
                to={`/r/${i.communitySlug}/post/${i.postId}`}
                className="activity-item"
              >
                <span className="activity-icon">
                  {i.type === "post" ? "📝" : "💬"}
                </span>
                <span className="activity-text">
                  <span>
                    <b>u/{i.userName}</b>{" "}
                    {i.type === "post" ? "posted" : "commented"}
                    {i.type === "comment" ? `: ${truncate(i.body)}` : ""}
                  </span>
                  <span className="muted micro">
                    r/{i.communitySlug} · {timeAgo(i.createdAt)} ago
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function RightSidebar() {
  return (
    <>
      <ProfileCard />
      <Discover />
      <LiveActivity />
    </>
  );
}
