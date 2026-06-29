// Serializers for User documents. Centralized so no endpoint ever leaks
// passwordHash or refreshTokens.

// Full view for the authenticated user's own profile (includes email).
export const privateUser = (user) => ({
  _id: user._id,
  userName: user.userName,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  karma: user.karma,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// Public view for other users' profiles (no email).
export const publicUser = (user) => ({
  _id: user._id,
  userName: user.userName,
  avatar: user.avatar,
  bio: user.bio,
  karma: user.karma,
  createdAt: user.createdAt,
});
