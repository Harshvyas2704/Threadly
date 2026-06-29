import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submitSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const logout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <img src="/favicon.svg" alt="" className="logo-img" />
        <span className="logo-text">Threadly</span>
      </Link>
      <form className="search" onSubmit={submitSearch}>
        <span className="search-icon">🔍</span>
        <input
          className="input search-input"
          placeholder="Search Threadly"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>
      <div className="spacer" />
      <div className="nav-links">
        <button
          className="icon-btn"
          onClick={toggle}
          title="Toggle theme"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        {user ? (
          <>
            <Link to="/create" className="btn small">
              Create
            </Link>
            <Link to={`/u/${user.userName}`} className="link">
              u/{user.userName}
            </Link>
            <button className="btn small outline" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="link">
              Log in
            </Link>
            <Link to="/register" className="btn small">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
