import { api } from "./client";

export const loginApi = (email, password) =>
  api("/auth/login", { method: "POST", body: { email, password }, auth: false });

export const registerApi = (userName, email, password) =>
  api("/auth/register", {
    method: "POST",
    body: { userName, email, password },
    auth: false,
  });

export const logoutApi = (refreshToken) =>
  api("/auth/logout", { method: "POST", body: { refreshToken }, auth: false });
