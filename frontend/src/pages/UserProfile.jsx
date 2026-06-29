import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProfileApi } from "../api";

export default function UserProfile() {
  const { userName } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProfileApi(userName)
      .then((data) => active && setUser(data.user))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [userName]);

  if (loading) return <div className="center">Loading…</div>;
  if (!user) return <div className="center">User not found.</div>;

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "—";

  return (
    <div className="container page">
      <div className="profile-card">
        <div className="avatar">{user.userName[0].toUpperCase()}</div>
        <h2 style={{ margin: 0 }}>u/{user.userName}</h2>
        {user.bio && <p>{user.bio}</p>}
        <div className="row" style={{ justifyContent: "center", gap: 32 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{user.karma ?? 0}</div>
            <div className="muted">Karma</div>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{joined}</div>
            <div className="muted">Joined</div>
          </div>
        </div>
      </div>
    </div>
  );
}
