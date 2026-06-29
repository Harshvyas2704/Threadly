import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMyCommunities } from "../context/CommunitiesContext";

const navClass = ({ isActive }) =>
  "side-nav-item" + (isActive ? " active" : "");

export default function LeftSidebar() {
  const { user } = useAuth();
  const { communities, loading } = useMyCommunities();

  return (
    <div className="side-card">
      <nav className="side-nav">
        <NavLink to="/" end className={navClass}>
          <span className="side-ico">🏠</span> Home
        </NavLink>
        {user && (
          <NavLink to="/create" className={navClass}>
            <span className="side-ico">➕</span> Create Post
          </NavLink>
        )}
        {user && (
          <NavLink to="/create-community" className={navClass}>
            <span className="side-ico">🏘️</span> Create Community
          </NavLink>
        )}
      </nav>

      <div className="side-section-title">Your Communities</div>

      {!user ? (
        <div className="side-empty">
          <Link to="/login" className="link">
            Log in
          </Link>{" "}
          to see your communities.
        </div>
      ) : loading ? (
        <div className="side-empty">Loading…</div>
      ) : communities.length === 0 ? (
        <div className="side-empty">You haven't joined any communities yet.</div>
      ) : (
        <ul className="community-list">
          {communities.map((c) => (
            <li key={c._id}>
              <NavLink to={`/r/${c.slug}`} className={navClass}>
                <span className="c-badge">{c.slug[0].toUpperCase()}</span>
                <span className="c-name">r/{c.slug}</span>
                {c.role === "owner" && <span className="role-tag">owner</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
