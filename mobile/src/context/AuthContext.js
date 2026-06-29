import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { setClientTokens, configureClient } from "../api/client";
import { loginApi, registerApi, logoutApi } from "../api/auth.api";
import { getMeApi } from "../api/users.api";
import { saveTokens, loadTokens, clearTokens } from "../storage/tokenStore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  // Forced sign-out (e.g. refresh failed). Clears everything.
  const signOut = useCallback(async () => {
    const { refreshToken } = await loadTokens();
    if (refreshToken) {
      try {
        await logoutApi(refreshToken);
      } catch {
        // best effort
      }
    }
    await clearTokens();
    setClientTokens(null, null);
    setUser(null);
  }, []);

  // Wire the client once: persist rotated tokens, and react to auth failure.
  useEffect(() => {
    configureClient({
      onTokens: async (at, rt) => {
        await saveTokens(at, rt);
      },
      onLogout: async () => {
        await clearTokens();
        setClientTokens(null, null);
        setUser(null);
      },
    });
  }, []);

  // On launch: restore tokens and re-fetch the current user.
  useEffect(() => {
    (async () => {
      try {
        const { accessToken, refreshToken } = await loadTokens();
        if (accessToken) {
          setClientTokens(accessToken, refreshToken);
          const me = await getMeApi(); // also validates / triggers refresh
          setUser(me.user);
        }
      } catch {
        await clearTokens();
        setClientTokens(null, null);
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  const applyAuthResult = async ({ user: u, accessToken, refreshToken }) => {
    setClientTokens(accessToken, refreshToken);
    await saveTokens(accessToken, refreshToken);
    setUser(u);
  };

  const signIn = async (email, password) => {
    const data = await loginApi(email, password);
    await applyAuthResult(data);
  };

  const signUp = async (userName, email, password) => {
    const data = await registerApi(userName, email, password);
    await applyAuthResult(data);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, bootstrapping, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
