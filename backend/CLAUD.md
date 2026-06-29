# Threadly — Master Build Prompt

## About the project

Threadly is a Reddit-style community platform. One Node.js/Express/MongoDB backend powers a React web app and a React Native mobile app.

This document is the single source of truth for the entire build. Follow it phase by phase. Do not skip ahead.

---

## Stack

- Node.js + Express
- MongoDB + Mongoose
- Redis (caching + rate limiting)
- BullMQ (background queues)
- Cloudinary (media uploads)
- JWT + refresh tokens
- React (web frontend)
- React Native CLI (mobile)

---

## Do's and Don'ts

**Do's**

- Use ES Modules (`import/export`) throughout, no CommonJS
- Always include `.js` extension in local imports
- Use `const` by default, `let` only when reassignment is needed
- Validate all request body inputs before hitting the controller
- Always hash passwords with bcrypt, never store plain text
- Return consistent response shapes across all endpoints
- Use `httpOnly` cookies for refresh tokens, never expose them in response body
- Handle errors with a centralized error handler, not try/catch in every controller
- Store secrets in `.env`, never hardcode them
- Use `lowercase: true` and `trim: true` on email fields in Mongoose
- Define Mongoose hooks and methods before calling `mongoose.model()`
- Use plural names for arrays (`refreshTokens` not `refreshToken`)
- Always check if resource exists before update or delete
- Use `sparse: true` on optional unique fields like `googleId`

**Don'ts**

- Don't use `async` on `jwt.sign` or `jwt.verify` — they are synchronous
- Don't put sensitive data (email, passwordHash) in JWT payload
- Don't define Mongoose model before hooks and methods
- Don't leave empty catch blocks — always throw or log the error
- Don't store refresh tokens in localStorage on the frontend — use httpOnly cookies
- Don't return the full user object in responses — strip `passwordHash` and `refreshTokens`
- Don't use `unique: true` on `passwordHash`
- Don't skip validation middleware — every POST and PUT route needs it
- Don't mutate `req.body` directly
- Don't use `var`

---

## Folder structure

```
threadly/
  backend/
    src/
      config/
        db.js
        redis.js
        cloudinary.js
      controllers/
        auth.controller.js
        user.controller.js
        community.controller.js
        post.controller.js
        comment.controller.js
        vote.controller.js
        search.controller.js
        feed.controller.js
      middlewares/
        auth.middleware.js
        error.middleware.js
        rateLimit.middleware.js
        upload.middleware.js
      models/
        User.js
        Community.js
        CommunityMember.js
        Post.js
        Comment.js
        Vote.js
      queues/
        email.queue.js
        workers/
          email.worker.js
      routes/
        v1/
          auth.routes.js
          user.routes.js
          community.routes.js
          post.routes.js
          comment.routes.js
          search.routes.js
          feed.routes.js
          index.js
      services/
        auth.service.js
        user.service.js
        community.service.js
        post.service.js
        comment.service.js
        vote.service.js
        feed.service.js
        cache.service.js
      utils/
        token.utils.js
        response.utils.js
        email.utils.js
      validators/
        auth.validator.js
        user.validator.js
        community.validator.js
        post.validator.js
        comment.validator.js
    .env.example
    .gitignore
    server.js
    package.json

  frontend/
    src/
      components/
      pages/
      hooks/
      services/
      context/
    package.json

  mobile/
    src/
      components/
      screens/
      navigation/
      hooks/
      services/
    package.json
```

---

## Response shape

Every API response must follow this format:

```js
// success
{
  success: true,
  message: "User registered successfully",
  data: { ... }
}

// error
{
  success: false,
  message: "Email already exists",
  data: null
}
```

Put helper functions for this in `utils/response.utils.js`:

```js
export const successResponse = (
  res,
  message,
  data = null,
  statusCode = 200,
) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({ success: false, message, data: null });
};
```

---

## Database models

### User

```
userName        String, unique, required, trim
email           String, unique, required, lowercase, trim
passwordHash    String, required
avatar          String, default ""
bio             String, default ""
karma           Number, default 0
googleId        String, sparse index
refreshTokens   [String], default []
timestamps
```

### Community

```
name            String, unique, required, trim
slug            String, unique, required, lowercase
description     String, required
avatar          String, default ""
banner          String, default ""
memberCount     Number, default 1
createdBy       ObjectId ref User, required
timestamps
```

### CommunityMember

```
userId          ObjectId ref User, required
communityId     ObjectId ref Community, required
role            String enum [owner, moderator, member, banned], default member
joinedAt        Date, default now
compound index on (userId, communityId) — unique
```

### Post

```
title           String, required, trim, max 300
body            String, default ""
type            String enum [text, link, image], default text
mediaUrl        String, default ""
authorId        ObjectId ref User, required
communityId     ObjectId ref Community, required
voteScore       Number, default 0
commentCount    Number, default 0
timestamps
```

### Comment

```
body            String, required
authorId        ObjectId ref User, required
postId          ObjectId ref Post, required
parentId        ObjectId ref Comment, default null (null = top level)
depth           Number, default 0, max 3
voteScore       Number, default 0
timestamps
```

### Vote

```
userId          ObjectId ref User, required
targetId        ObjectId, required
targetType      String enum [post, comment], required
value           Number enum [1, -1], required
compound index on (userId, targetId, targetType) — unique
```

---

## API endpoints

### Auth — `/api/v1/auth`

```
POST   /register         create account
POST   /login            login, returns access token + sets refresh cookie
POST   /logout           clears refresh token
POST   /refresh          rotate refresh token, return new access token
GET    /google           redirect to Google OAuth
GET    /google/callback  handle Google OAuth callback
```

### Users — `/api/v1/users`

```
GET    /me               get current user profile
PUT    /me               update bio, avatar
GET    /:userName        get public profile
```

### Communities — `/api/v1/communities`

```
GET    /                 list communities (with search query param)
POST   /                 create community
GET    /:slug            get community details
PUT    /:slug            update community (owner/mod only)
POST   /:slug/join       join community
POST   /:slug/leave      leave community
GET    /:slug/members    list members
PUT    /:slug/members/:userId   update member role (owner only)
```

### Posts — `/api/v1/posts`

```
GET    /                 home feed (joined communities)
GET    /trending         trending posts
POST   /                 create post
GET    /:id              get single post
PUT    /:id              edit post (author only)
DELETE /:id              delete post (author or mod)
POST   /:id/vote         upvote or downvote
```

### Comments — `/api/v1/comments`

```
GET    /posts/:postId/comments    get comments for a post
POST   /posts/:postId/comments    create comment
PUT    /:id                       edit comment (author only)
DELETE /:id                       delete comment (author or mod)
POST   /:id/vote                  upvote or downvote
```

### Search — `/api/v1/search`

```
GET    /?q=query&type=posts       search posts
GET    /?q=query&type=communities search communities
```

### Feed — `/api/v1/feed`

```
GET    /home             posts from joined communities, sorted by recent
GET    /trending         posts sorted by vote score in last 24 hours
```

---

## Phases

---

## Phase 1 — Project setup and auth

**Goal:** server running, DB connected, user can register, login, logout, and refresh token.

Files to build:

- `server.js`
- `src/config/db.js`
- `src/models/User.js`
- `src/utils/token.utils.js`
- `src/utils/response.utils.js`
- `src/validators/auth.validator.js`
- `src/controllers/auth.controller.js`
- `src/middlewares/auth.middleware.js`
- `src/middlewares/error.middleware.js`
- `src/routes/v1/auth.routes.js`
- `src/routes/v1/index.js`

APIs to build:

- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/logout`
- POST `/auth/refresh`

Completion criteria:

- User can register with userName, email, password
- Password is hashed before saving
- Login returns access token in body and refresh token as httpOnly cookie
- Protected routes return 401 without valid access token
- Refresh token rotates on every use

**Do not start Phase 2 until Phase 1 is reviewed and approved.**

---

## Phase 2 — User profile

**Goal:** logged in user can view and update their profile. Public profiles are visible without auth.

Files to build:

- `src/controllers/user.controller.js`
- `src/validators/user.validator.js`
- `src/routes/v1/user.routes.js`

APIs to build:

- GET `/users/me`
- PUT `/users/me`
- GET `/users/:userName`

Completion criteria:

- Response never includes `passwordHash` or `refreshTokens`
- Avatar upload goes to Cloudinary
- Public profile shows userName, avatar, bio, karma, createdAt

**Do not start Phase 3 until Phase 2 is reviewed and approved.**

---

## Phase 3 — Communities

**Goal:** users can create communities, join, leave, and manage members.

Files to build:

- `src/models/Community.js`
- `src/models/CommunityMember.js`
- `src/controllers/community.controller.js`
- `src/validators/community.validator.js`
- `src/routes/v1/community.routes.js`

APIs to build:

- GET `/communities`
- POST `/communities`
- GET `/communities/:slug`
- PUT `/communities/:slug`
- POST `/communities/:slug/join`
- POST `/communities/:slug/leave`
- GET `/communities/:slug/members`
- PUT `/communities/:slug/members/:userId`

Completion criteria:

- Slug is auto-generated from name (lowercase, spaces to hyphens)
- Creator is automatically set as owner in CommunityMember
- memberCount updates on join and leave
- Only owner can update community or change member roles
- Banned members cannot post or comment in that community

**Do not start Phase 4 until Phase 3 is reviewed and approved.**

---

## Phase 4 — Posts

**Goal:** users can create, edit, delete posts inside communities. Voting works.

Files to build:

- `src/models/Post.js`
- `src/models/Vote.js`
- `src/controllers/post.controller.js`
- `src/validators/post.validator.js`
- `src/routes/v1/post.routes.js`

APIs to build:

- POST `/posts`
- GET `/posts/:id`
- PUT `/posts/:id`
- DELETE `/posts/:id`
- POST `/posts/:id/vote`

Completion criteria:

- Only community members can post
- Banned members cannot post
- Vote is upserted — voting same direction again removes the vote
- voteScore on Post updates on every vote
- Image posts upload to Cloudinary via upload middleware

**Do not start Phase 5 until Phase 4 is reviewed and approved.**

---

## Phase 5 — Comments

**Goal:** users can comment on posts with nested replies up to 3 levels deep.

Files to build:

- `src/models/Comment.js`
- `src/controllers/comment.controller.js`
- `src/validators/comment.validator.js`
- `src/routes/v1/comment.routes.js`

APIs to build:

- GET `/posts/:postId/comments`
- POST `/posts/:postId/comments`
- PUT `/comments/:id`
- DELETE `/comments/:id`
- POST `/comments/:id/vote`

Completion criteria:

- `parentId` null means top level comment
- depth is calculated from parent, max depth is 3
- commentCount on Post increments on new comment, decrements on delete
- Deleted comments show `[deleted]` body, not removed from DB
- voteScore updates on vote

**Do not start Phase 6 until Phase 5 is reviewed and approved.**

---

## Phase 6 — Feed and Redis caching

**Goal:** home feed and trending feed work. Hot data is cached in Redis.

Files to build:

- `src/config/redis.js`
- `src/services/cache.service.js`
- `src/services/feed.service.js`
- `src/controllers/feed.controller.js`
- `src/routes/v1/feed.routes.js`

APIs to build:

- GET `/feed/home`
- GET `/feed/trending`

Completion criteria:

- Home feed shows posts from communities the user has joined, sorted by recent
- Trending feed shows posts with highest voteScore in last 24 hours
- Trending feed is cached in Redis with 5 minute TTL
- Community data is cached with 10 minute TTL
- Cache is invalidated when community is updated

**Do not start Phase 7 until Phase 6 is reviewed and approved.**

---

## Phase 7 — Rate limiting and search

**Goal:** abuse prevention on write endpoints. Search works for posts and communities.

Files to build:

- `src/middlewares/rateLimit.middleware.js`
- `src/controllers/search.controller.js`
- `src/routes/v1/search.routes.js`

Limits:

- POST `/posts` — 10 per hour per user
- POST `/comments` — 30 per hour per user
- POST `/votes` — 60 per hour per user
- POST `/auth/login` — 10 per 15 minutes per IP

Search:

- GET `/search?q=query&type=posts`
- GET `/search?q=query&type=communities`

Completion criteria:

- Rate limits stored in Redis
- 429 response with `retryAfter` in response when limit hit
- Search uses MongoDB text index on title and body for posts
- Search uses text index on name and description for communities

**Do not start Phase 8 until Phase 7 is reviewed and approved.**

---

## Phase 8 — Email queue with BullMQ

**Goal:** async email notifications so API responses stay fast.

Files to build:

- `src/queues/email.queue.js`
- `src/queues/workers/email.worker.js`
- `src/utils/email.utils.js`

Jobs to build:

- `email:welcome` — triggered on register
- `email:commentReply` — triggered when someone replies to your comment

Completion criteria:

- Jobs are added to queue from controller, not processed inline
- Worker runs separately and processes jobs
- Failed jobs retry 3 times with exponential backoff
- Nodemailer handles actual sending

**Do not start Phase 9 until Phase 8 is reviewed and approved.**

---

## Phase 9 — React web frontend

**Goal:** functional web app that consumes the API.

Pages to build:

- `/` — home feed
- `/login` and `/register`
- `/r/:slug` — community page
- `/r/:slug/post/:id` — post detail with comments
- `/u/:userName` — user profile
- `/create` — create post

Completion criteria:

- Auth flow works end to end
- Access token stored in memory, refresh token in httpOnly cookie
- Silent refresh on 401 response
- Protected routes redirect to login

**Do not start Phase 10 until Phase 9 is reviewed and approved.**

---

## Phase 10 — React Native mobile app

**Goal:** mobile app sharing the same backend API.

Screens to build:

- Home feed
- Community screen
- Post detail with comments
- Create post
- User profile
- Login and register

Completion criteria:

- Same API service layer as web, just different UI
- Navigation with React Navigation
- Auth tokens handled the same way as web
- Works on both Android and iOS

---

## Current status

- [x] Phase 1 — in progress
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
- [ ] Phase 5
- [ ] Phase 6
- [ ] Phase 7
- [ ] Phase 8
- [ ] Phase 9
- [ ] Phase 10
