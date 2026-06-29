import { api } from "./client";

export const listCommunitiesApi = (search = "") =>
  api(`/communities${search ? `?search=${encodeURIComponent(search)}` : ""}`, {
    auth: false,
  });

export const getCommunityApi = (slug) =>
  api(`/communities/${slug}`, { auth: false });

export const getCommunityPostsApi = (slug, page = 1) =>
  api(`/communities/${slug}/posts?page=${page}`, { auth: false });

export const joinCommunityApi = (slug) =>
  api(`/communities/${slug}/join`, { method: "POST" });

export const leaveCommunityApi = (slug) =>
  api(`/communities/${slug}/leave`, { method: "POST" });
