import { api } from "./client";

export const searchApi = (q, type = "posts") =>
  api(`/search?q=${encodeURIComponent(q)}&type=${type}`, { auth: false });
