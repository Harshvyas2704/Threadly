import { createContext, useContext, useEffect, useState } from "react";
import { setAccessToken, configureClient } from "../api/client";
import { loginApi, registerApi, logoutApi, getMeApi } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  // If a silent refresh fails mid-session, drop the user.
  useEffect(() => {
    configureClient({
      onLogout: async () => {
        setAccessToken(null);
        setUser(null);
      },
    });
  }, []);

  // On load: the access token is gone (memory only), but the refresh cookie may
  // still be valid. getMeApi triggers a silent refresh; if it works, we're in.
  useEffect(() => {
    (async () => {
      try {
        const me = await getMeApi();
        setUser(me.user);
      } catch {
        setUser(null);
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  const applyAuth = ({ user: u, accessToken }) => {
    setAccessToken(accessToken);
    setUser(u);
  };

  const signIn = async (email, password) =>
    applyAuth(await loginApi(email, password));

  const signUp = async (userName, email, password) =>
    applyAuth(await registerApi(userName, email, password));

  const signOut = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    }
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, bootstrapping, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
