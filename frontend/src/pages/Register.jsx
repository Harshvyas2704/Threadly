import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp(userName.trim(), email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap card">
      <h1>Create account</h1>
      <form className="stack" onSubmit={submit}>
        <input
          className="input"
          placeholder="Username (3–30 letters/numbers)"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="error">{error}</div>}
        <button className="btn" disabled={loading}>
          {loading ? "Creating…" : "Sign Up"}
        </button>
      </form>
      <p className="center" style={{ padding: "16px 0 0" }}>
        Already have an account? <Link to="/login" className="link">Sign in</Link>
      </p>
    </div>
  );
}
