import { api } from "./client";

export const getPostApi = (id) => api(`/posts/${id}`, { auth: false });

export const createPostApi = (body) =>
  api("/posts", { method: "POST", body });

export const votePostApi = (id, value) =>
  api(`/posts/${id}/vote`, { method: "POST", body: { value } });

export const deletePostApi = (id) =>
  api(`/posts/${id}`, { method: "DELETE" });
