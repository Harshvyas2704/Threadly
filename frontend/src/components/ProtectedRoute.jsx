import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Route guard: wait for the initial silent-refresh check, then redirect to
// /login if there's still no authenticated user.
export default function ProtectedRoute({ children }) {
  const { user, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) return <div className="center">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
