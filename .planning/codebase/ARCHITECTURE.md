# Architecture

**Analysis Date:** 2026-03-19

## Pattern Overview

**Overall:** Layered Next.js App Router + tRPC backend-for-frontend pattern

**Key Characteristics:**
- UI and route handlers live in Next.js App Router under `src/app/**`.
- Domain/API logic is centralized in tRPC routers under `src/server/api/**`.
- Persistence and identity are handled through Prisma + NextAuth in `src/server/db.ts` and `src/server/auth/**`.

## Layers

**Presentation Layer (React Server/Client Components):**
- Purpose: Render pages, bind user interactions, and call typed API procedures.
- Location: `src/app/**`, `src/app/_components/**`
- Contains: Server components (`src/app/page.tsx`), client components (`src/app/_components/post.tsx`), root layout (`src/app/layout.tsx`).
- Depends on: `~/trpc/server` for RSC calls and `~/trpc/react` for client hooks.
- Used by: Browser users accessing web routes.

**Transport Layer (HTTP route handlers):**
- Purpose: Expose tRPC and auth over Next.js route handlers.
- Location: `src/app/api/trpc/[trpc]/route.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- Contains: `fetchRequestHandler` bridge for tRPC and passthrough auth handlers.
- Depends on: `src/server/api/root.ts`, `src/server/api/trpc.ts`, `src/server/auth/index.ts`.
- Used by: tRPC React client and NextAuth callbacks/session flows.

**API/Domain Layer (tRPC routers + procedures):**
- Purpose: Validate input, enforce auth, and execute business operations.
- Location: `src/server/api/root.ts`, `src/server/api/routers/post.ts`, `src/server/api/trpc.ts`
- Contains: `publicProcedure`, `protectedProcedure`, router composition, post CRUD-like operations.
- Depends on: `ctx.db` from Prisma and `ctx.session` from NextAuth in tRPC context.
- Used by: RSC caller (`src/trpc/server.ts`) and client hooks (`src/trpc/react.tsx`).

**Auth Layer (Identity + session mapping):**
- Purpose: Configure providers/adapters and expose cached auth helpers.
- Location: `src/server/auth/config.ts`, `src/server/auth/index.ts`
- Contains: Discord provider config, Prisma adapter, session callback augmenting `session.user.id`.
- Depends on: Prisma client from `src/server/db.ts` and env vars validated by `src/env.js`.
- Used by: `createTRPCContext` in `src/server/api/trpc.ts` and API auth route.

**Data Access Layer (Prisma ORM):**
- Purpose: Manage DB connections and database models.
- Location: `src/server/db.ts`, `prisma/schema.prisma`, `prisma/migrations/**`
- Contains: Singleton Prisma client creation, `Post/User/Account/Session/VerificationToken` models.
- Depends on: `DATABASE_URL` in `src/env.js`.
- Used by: tRPC procedures and NextAuth Prisma adapter.

## Data Flow

**Authenticated post creation flow:**

1. User submits form in `src/app/_components/post.tsx` and calls `api.post.create.useMutation(...)`.
2. tRPC client in `src/trpc/react.tsx` sends batched request to `/api/trpc` via `httpBatchStreamLink`.
3. Route handler `src/app/api/trpc/[trpc]/route.ts` invokes `fetchRequestHandler` with `appRouter`.
4. `createTRPCContext` in `src/server/api/trpc.ts` loads session via `auth()` and injects `db` + headers.
5. `protectedProcedure` in `src/server/api/trpc.ts` enforces authenticated session.
6. `postRouter.create` in `src/server/api/routers/post.ts` validates input with Zod and writes via Prisma.
7. Client invalidates `post` queries through `api.useUtils()` and re-renders latest post.

**Server-rendered home page flow:**

1. `src/app/page.tsx` calls `api.post.hello(...)` and `auth()` on the server.
2. When authenticated, `api.post.getLatest.prefetch()` runs in RSC context.
3. `HydrateClient` from `src/trpc/server.ts` hydrates prefetched tRPC data to the client.

**State Management:**
- Server state uses TanStack Query + tRPC cache hydration (`src/trpc/query-client.ts`, `src/trpc/server.ts`, `src/trpc/react.tsx`).
- Local UI state (form input) uses React `useState` in `src/app/_components/post.tsx`.

## Key Abstractions

**tRPC Procedure Types:**
- Purpose: Separate authenticated vs unauthenticated operations.
- Examples: `publicProcedure`, `protectedProcedure` in `src/server/api/trpc.ts`.
- Pattern: Reusable middleware composition with shared timing middleware.

**Router Composition:**
- Purpose: Compose feature routers into a single API contract.
- Examples: `appRouter` in `src/server/api/root.ts`, `postRouter` in `src/server/api/routers/post.ts`.
- Pattern: Feature router modules exported and mounted under named namespace (`post`).

**Context Factory:**
- Purpose: Inject request-scoped dependencies (`db`, `session`, headers) into every procedure.
- Examples: `createTRPCContext` in `src/server/api/trpc.ts`, RSC wrapper in `src/trpc/server.ts`.
- Pattern: Per-request context creation + typed inference in tRPC init.

## Entry Points

**Web App Entry:**
- Location: `src/app/layout.tsx` and `src/app/page.tsx`
- Triggers: Browser requests to `/`.
- Responsibilities: Setup global providers and render home route.

**tRPC HTTP Entry:**
- Location: `src/app/api/trpc/[trpc]/route.ts`
- Triggers: Client and server API calls to `/api/trpc`.
- Responsibilities: Bind request to tRPC router and context.

**Auth HTTP Entry:**
- Location: `src/app/api/auth/[...nextauth]/route.ts`
- Triggers: NextAuth signin/signout/session routes.
- Responsibilities: Expose NextAuth handlers.

## Error Handling

**Strategy:** Typed validation + auth guard failures at procedure boundaries, mixed with generic thrown `Error` in some router handlers.

**Patterns:**
- Input validation via Zod `.input(...)` schemas in `src/server/api/routers/post.ts`.
- Unauthorized access converted to `TRPCError({ code: "UNAUTHORIZED" })` in `src/server/api/trpc.ts`.
- tRPC dev-only logging in route handler `onError` in `src/app/api/trpc/[trpc]/route.ts`.
- Not-found/ownership checks currently throw generic `Error` in `src/server/api/routers/post.ts`.

## Cross-Cutting Concerns

**Logging:** `console.log` timing middleware in `src/server/api/trpc.ts`; `console.error` for tRPC route errors in `src/app/api/trpc/[trpc]/route.ts`.
**Validation:** Runtime env validation in `src/env.js` and request input validation with Zod in `src/server/api/routers/post.ts`.
**Authentication:** NextAuth with Prisma adapter in `src/server/auth/config.ts`, enforced in `protectedProcedure`.

---

*Architecture analysis: 2026-03-19*
