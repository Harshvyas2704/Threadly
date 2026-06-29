import { api } from "./client";

export const listCommentsApi = (postId) =>
  api(`/posts/${postId}/comments`, { auth: false });

export const createCommentApi = (postId, body, parentId = null) =>
  api(`/posts/${postId}/comments`, {
    method: "POST",
    body: { body, parentId },
  });

export const voteCommentApi = (id, value) =>
  api(`/comments/${id}/vote`, { method: "POST", body: { value } });
