import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { getMyCommunitiesApi } from "../api";

// The current user's joined communities, shared by the left sidebar and the
// Discover widget so joining/leaving updates both. Refetches when auth changes.
const CommunitiesContext = createContext(null);

export function CommunitiesProvider({ children }) {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCommunities([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getMyCommunitiesApi();
      setCommunities(data.communities);
    } catch {
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CommunitiesContext.Provider value={{ communities, loading, refresh }}>
      {children}
    </CommunitiesContext.Provider>
  );
}

export const useMyCommunities = () => {
  const ctx = useContext(CommunitiesContext);
  if (!ctx)
    throw new Error("useMyCommunities must be used within CommunitiesProvider");
  return ctx;
};
