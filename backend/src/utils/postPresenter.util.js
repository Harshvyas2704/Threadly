// Shapes a Post document for responses. Author/community are returned as
// whatever is on the doc — populated objects when populated, otherwise ids.
export const presentPost = (post) => ({
  _id: post._id,
  title: post.title,
  body: post.body,
  type: post.type,
  mediaUrl: post.mediaUrl,
  author: post.authorId,
  community: post.communityId,
  voteScore: post.voteScore,
  commentCount: post.commentCount,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});
