import { api } from "./client";

export const getMeApi = () => api("/users/me");

export const updateMeApi = (updates) =>
  api("/users/me", { method: "PUT", body: updates });

export const getProfileApi = (userName) =>
  api(`/users/${userName}`, { auth: false });
