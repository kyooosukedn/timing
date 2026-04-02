# CLAUDE.md — Agent Context for the `timing` Project

This file gives an AI agent full context to continue work on this codebase without prior conversation history.

---

## What This Project Is

A **T3 Stack** app (Next.js 14 App Router + tRPC + Prisma + NextAuth.js + Tailwind CSS) bootstrapped with `create-t3-app`. It uses **PostgreSQL** as the database (configured via `DATABASE_URL` env var).

## What Has Been Built

### Post CRUD Feature (complete)

All milestones in `Milestone.md` are checked off:

| Layer | File | What it does |
|---|---|---|
| DB schema | `prisma/schema.prisma` | `Post` model with `id`, `name`, `createdAt`, `updatedAt`, `createdById` (FK → `User`) |
| Backend router | `src/server/api/routers/post.ts` | tRPC procedures: `hello`, `create`, `getAll`, `getById`, `update`, `delete`, `getLatest`, `getSecretMessage` |
| Frontend component | `src/app/_components/post.tsx` | `LatestPost` — lists posts, inline edit, delete, create form. Uses `api.post.*` tRPC hooks |
| Page | `src/app/page.tsx` | Home page renders `LatestPost` when session is active; prefetches `getAll` on server |
| Backend tests | `src/server/api/routers/post.test.ts` | 5 vitest tests using an in-memory mock DB (no real DB needed) |
| Frontend tests | `src/app/_components/post.test.tsx` | 1 vitest + @testing-library/react test, mocks tRPC layer |

### Auth

NextAuth.js is configured in `src/server/auth/config.ts` with a `CredentialsProvider` supporting email/password login (hashed passwords stored in `User.hashedPassword`). Session strategy is `jwt`.

---

## Key Architecture Decisions

- **tRPC procedures** are either `publicProcedure` (no auth required) or `protectedProcedure` (throws `UNAUTHORIZED` if no session). All Post mutations and queries are `protectedProcedure` — users can only see/modify their own posts.
- **Ownership enforcement** is done at the DB query level (`where: { id, createdById: ctx.session.user.id }`), not just at the API layer.
- **Cache invalidation** — after any mutation the frontend calls `utils.post.invalidate()` which refetches `getAll`.
- **In-memory mock DB** in tests mirrors Prisma's API shape exactly — no real DB or Docker needed to run tests.

---

## Running Locally

```bash
# 1. Copy env
cp .env.example .env

# 2. Start Postgres (Docker)
./start-database.sh

# 3. Push schema
npx prisma db push

# 4. Install deps & run
npm install
npm run dev

# 5. Run tests
npm test
```

---

## What's Next (suggested work)

The Post CRUD feature is complete. Possible next milestones:

1. **Rich post content** — add a `content: String` field to the Post model (Prisma migration + update router + update UI)
2. **Public post view** — a `/posts/[id]` page readable without auth
3. **Pagination** — `getAll` currently returns all posts; add cursor-based pagination
4. **Tag/category system** — many-to-many Post ↔ Tag relation
5. **Deploy** — Vercel (frontend) + Neon PostgreSQL (managed Postgres)

---

## Cymbal Index

This repo is indexed by [cymbal](https://github.com/1broseidon/cymbal) for fast symbol search.

Key symbols an agent can investigate:
```
cymbal investigate createTRPCContext   # tRPC context setup
cymbal investigate createMockDb        # test mock DB
cymbal investigate postRouter          # all Post API procedures
cymbal investigate LatestPost          # frontend CRUD component
```

Re-index after major changes: `cymbal index .`
