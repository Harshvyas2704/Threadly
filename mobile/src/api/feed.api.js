import { api } from "./client";

export const getHomeFeedApi = (page = 1) => api(`/feed/home?page=${page}`);

export const getTrendingApi = (page = 1) =>
  api(`/feed/trending?page=${page}`, { auth: false });
