import { api } from "./client";

// Auth
export const loginApi = (email, password) =>
  api("/auth/login", { method: "POST", body: { email, password }, auth: false });
export const registerApi = (userName, email, password) =>
  api("/auth/register", {
    method: "POST",
    body: { userName, email, password },
    auth: false,
  });
export const logoutApi = () =>
  api("/auth/logout", { method: "POST", auth: false });

// Users
export const getMeApi = () => api("/users/me");
export const getProfileApi = (userName) =>
  api(`/users/${userName}`, { auth: false });

// Feed
export const getHomeFeedApi = (page = 1) => api(`/feed/home?page=${page}`);
// Reads sent with the token (when present) so the backend can include the
// viewer's own vote; they still work for guests (optional auth).
export const getTrendingApi = (page = 1) => api(`/feed/trending?page=${page}`);
export const getActivityApi = () => api("/feed/activity", { auth: false });

// Communities
export const listCommunitiesApi = (search = "") =>
  api(`/communities${search ? `?search=${encodeURIComponent(search)}` : ""}`, {
    auth: false,
  });
export const getMyCommunitiesApi = () => api("/communities/mine");
export const getCommunityApi = (slug) =>
  api(`/communities/${slug}`, { auth: false });
export const getCommunityPostsApi = (slug, page = 1) =>
  api(`/communities/${slug}/posts?page=${page}`);
export const createCommunityApi = (body) =>
  api("/communities", { method: "POST", body });
export const joinCommunityApi = (slug) =>
  api(`/communities/${slug}/join`, { method: "POST" });
export const leaveCommunityApi = (slug) =>
  api(`/communities/${slug}/leave`, { method: "POST" });

// Posts
export const getPostApi = (id) => api(`/posts/${id}`);
export const createPostApi = (body) => api("/posts", { method: "POST", body });
export const votePostApi = (id, value) =>
  api(`/posts/${id}/vote`, { method: "POST", body: { value } });

// Comments
export const listCommentsApi = (postId) =>
  api(`/posts/${postId}/comments`);
export const createCommentApi = (postId, body, parentId = null) =>
  api(`/posts/${postId}/comments`, { method: "POST", body: { body, parentId } });
export const voteCommentApi = (id, value) =>
  api(`/comments/${id}/vote`, { method: "POST", body: { value } });

// Search
export const searchApi = (q, type = "posts") =>
  api(`/search?q=${encodeURIComponent(q)}&type=${type}`);
