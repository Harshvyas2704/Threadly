# Threadly

A Reddit-style community platform where people create communities, share posts, and have discussions. Built with Node.js, Express, MongoDB, Redis, React, and React Native.

---

## What this is

Threadly is a full stack portfolio project. The goal was to build something that covers real backend concerns — auth, caching, queues, feed algorithms, nested data — not just basic CRUD.

One backend API powers both a React web app and a React Native mobile app.

---

## Tech stack

**Backend**

- Node.js + Express
- MongoDB + Mongoose
- Redis (caching + rate limiting)
- BullMQ (background job queues)
- Cloudinary (media uploads)
- JWT + refresh tokens

**Frontend**

- React (web)

**Mobile**

- React Native (CLI)

---

## Features

- Register and login with email/password or Google OAuth
- JWT auth with refresh token rotation
- Create and join communities
- Community roles: owner, moderator, member, banned
- Create posts (text, link, image)
- Nested comments (up to 3 levels deep)
- Upvote and downvote posts and comments
- Home feed based on joined communities
- Trending feed based on vote activity
- Search posts and communities
- Rate limiting on votes, posts, comments
- Redis caching for hot posts and community data
- Email notifications via queue (BullMQ)
- Media uploads to Cloudinary

---

## Project structure

```
threadly/
  backend/
    src/
      config/         # DB, Redis, Cloudinary config
      controllers/    # Route handlers
      middlewares/    # Auth, rate limiting, error handling
      models/         # Mongoose schemas
      queues/         # BullMQ job definitions and workers
      routes/
        v1/           # Versioned API routes
      services/       # Business logic layer
      utils/          # Helpers, token utils, response format
      validators/     # Request validation schemas
    .env.example
    server.js
    package.json

  frontend/
    src/
      components/
      pages/
      hooks/
      services/       # API calls
    package.json

  mobile/
    src/
      components/
      screens/
      navigation/
      hooks/
      services/       # Same API calls as web
    package.json
```

---

## Getting started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Cloudinary account (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/threadly.git
cd threadly
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/threadly
REDIS_URL=redis://localhost:6379

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

CLIENT_URL=http://localhost:3000
```

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Set up the frontend

```bash
cd ../frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api/v1
npm start
```

### 4. Set up the mobile app

```bash
cd ../mobile
npm install
# Update src/services/api.js with your local IP
# e.g. http://192.168.1.x:5000/api/v1
npx react-native run-android
# or
npx react-native run-ios
```

---

## API overview

All endpoints are prefixed with `/api/v1`

### Auth

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /auth/google
GET    /auth/google/callback
```

### Communities

```
GET    /communities              # list/search communities
POST   /communities              # create community
GET    /communities/:slug        # get community
PUT    /communities/:slug        # update community (mod only)
POST   /communities/:slug/join
POST   /communities/:slug/leave
GET    /communities/:slug/members
PUT    /communities/:slug/members/:userId  # update role (mod only)
```

### Posts

```
GET    /posts                    # home feed
GET    /posts/trending           # trending feed
POST   /posts                    # create post
GET    /posts/:id
PUT    /posts/:id                # edit post (author only)
DELETE /posts/:id                # delete post (author or mod)
POST   /posts/:id/vote
```

### Comments

```
GET    /posts/:id/comments
POST   /posts/:id/comments
PUT    /comments/:id             # edit comment (author only)
DELETE /comments/:id
POST   /comments/:id/vote
```

### Search

```
GET    /search?q=query&type=posts|communities
```

---

## Database models

**User** — id, username, email, passwordHash, avatar, bio, karma, createdAt

**Community** — id, name, slug, description, avatar, banner, memberCount, createdBy, createdAt

**CommunityMember** — userId, communityId, role (owner/mod/member/banned), joinedAt

**Post** — id, title, body, type (text/link/image), mediaUrl, authorId, communityId, voteScore, commentCount, createdAt

**Comment** — id, body, authorId, postId, parentId (null for top level), depth, voteScore, createdAt

**Vote** — userId, targetId, targetType (post/comment), value (1/-1)

---

## Background jobs

BullMQ handles async work so API responses stay fast.

- `email:welcome` — sent after registration
- `email:notification` — comment replies, post activity
- `feed:refresh` — rebuild cached feeds on new posts

---

## Caching strategy

Redis caches:

- Trending posts (TTL: 5 minutes)
- Community data (TTL: 10 minutes)
- User sessions and refresh tokens

Cache is invalidated on write operations for the relevant resource.

---

## Rate limiting

Per user limits enforced with Redis:

- Posting: 10 posts per hour
- Commenting: 30 comments per hour
- Voting: 60 votes per hour
- Auth endpoints: 10 attempts per 15 minutes

---

## Build order

This is the order the project was built in, useful if you want to follow along:

1. Project setup and MongoDB connection
2. User model and auth (register, login, JWT)
3. Refresh token rotation
4. Google OAuth
5. Community model and CRUD
6. Membership and roles
7. Post model and CRUD
8. Image upload with Cloudinary
9. Comment model with nested replies
10. Voting system
11. Redis caching layer
12. Rate limiting middleware
13. BullMQ queues and email notifications
14. Home feed and trending feed
15. Search
16. React web frontend
17. React Native mobile app

---

## License

MIT
