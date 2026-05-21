# Codebase Structure

**Analysis Date:** 2026-03-19

## Directory Layout

```text
[project-root]/
├── src/                    # Active Next.js application code
│   ├── app/                # App Router pages, API route handlers, UI components
│   ├── server/             # Backend server-only code (auth, API, DB)
│   ├── trpc/               # tRPC React/RSC clients and query client setup
│   ├── styles/             # Global styles
│   └── env.js              # Environment schema and runtime validation
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── apps/                   # Present but empty (not active)
├── packages/               # Present but empty (not active)
├── services/               # Present but empty (not active)
├── package.json            # Scripts and dependency manifest
└── tsconfig.json           # TypeScript config and path aliases
```

## Directory Purposes

**`src/app`:**
- Purpose: Route UI + HTTP endpoints in App Router.
- Contains: `layout.tsx`, `page.tsx`, API handlers under `api/**`, client components under `_components/**`.
- Key files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/api/trpc/[trpc]/route.ts`, `src/app/api/auth/[...nextauth]/route.ts`.

**`src/server`:**
- Purpose: Server-only backend modules.
- Contains: tRPC setup/router files, auth config/helpers, Prisma client wrapper.
- Key files: `src/server/api/trpc.ts`, `src/server/api/root.ts`, `src/server/api/routers/post.ts`, `src/server/auth/config.ts`, `src/server/db.ts`.

**`src/trpc`:**
- Purpose: Typed API clients for both server components and client components.
- Contains: RSC hydration helpers, React provider, query client factory.
- Key files: `src/trpc/server.ts`, `src/trpc/react.tsx`, `src/trpc/query-client.ts`.

**`prisma`:**
- Purpose: Database schema/migrations.
- Contains: `schema.prisma`, SQL migration files.
- Key files: `prisma/schema.prisma`, `prisma/migrations/20250427221626_post_crud_init/migration.sql`.

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Global app shell + `TRPCReactProvider` wiring.
- `src/app/page.tsx`: Home page route and initial data/auth calls.
- `src/app/api/trpc/[trpc]/route.ts`: tRPC endpoint for API calls.
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth API route entry.

**Configuration:**
- `package.json`: Run/build/lint/db scripts and dependency versions.
- `tsconfig.json`: strict TypeScript settings and `~/*` alias mapping to `src/*`.
- `next.config.js`: Next.js config loading env validation.
- `src/env.js`: Required env vars and runtime parsing.
- `eslint.config.js`, `prettier.config.js`: code quality and format config.

**Core Logic:**
- `src/server/api/routers/post.ts`: Post procedures (`create`, `getAll`, `getById`, `update`, `delete`, `getLatest`).
- `src/server/api/trpc.ts`: Context and procedure middleware composition.
- `src/server/auth/config.ts`: auth provider/adapter/session callback rules.
- `src/server/db.ts`: Prisma client singleton lifecycle.

**Testing:**
- Not detected (`*.test.*` / `*.spec.*` files not present in workspace).

## Naming Conventions

**Files:**
- Route/component modules use lowercase names with semantic filenames: `page.tsx`, `layout.tsx`, `post.tsx`, `route.ts`.
- Router files use lowercase entity names: `post.ts`.

**Directories:**
- App Router conventions from Next.js: `api`, dynamic segments (`[trpc]`, `[...nextauth]`), private components via `_components`.
- Backend grouping by concern under `src/server`: `api`, `auth`.

## Where to Add New Code

**New Feature:**
- Primary UI code: `src/app/<route-or-feature>/` (server/client components as needed).
- Backend API procedures: `src/server/api/routers/<feature>.ts` and register in `src/server/api/root.ts`.
- Data model changes: `prisma/schema.prisma` + migration under `prisma/migrations/`.
- Tests: Not established; if adding first tests, use co-located `*.test.ts` near target module or a top-level `src/**/__tests__/` pattern consistently.

**New Component/Module:**
- Reusable client components: `src/app/_components/` when tied to app UI.
- Shared API wiring or query behavior: `src/trpc/`.
- Auth/session logic extensions: `src/server/auth/`.

**Utilities:**
- Server utilities: `src/server/<new-area>/` or `src/server/api/<new-area>/` depending on scope.
- App utilities (if introduced): keep within nearest feature directory under `src/app/`.

## Special Directories

**`apps/`:**
- Purpose: Monorepo-style container directory, currently no tracked files.
- Generated: No
- Committed: Yes

**`packages/`:**
- Purpose: Monorepo-style shared packages container, currently no tracked files.
- Generated: No
- Committed: Yes

**`services/`:**
- Purpose: Service container directory, currently no tracked files.
- Generated: No
- Committed: Yes

**`prisma/migrations/`:**
- Purpose: Database migration history.
- Generated: Yes (by Prisma tooling)
- Committed: Yes

---

*Structure analysis: 2026-03-19*
