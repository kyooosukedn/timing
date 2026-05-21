# Technology Stack

**Analysis Date:** 2026-03-19

## Languages

**Primary:**
- TypeScript (strict mode) - App/server implementation in `src/**/*.ts` and `src/**/*.tsx` (configured in `tsconfig.json`).
- JavaScript (ESM) - Tooling/config files in `next.config.js`, `eslint.config.js`, `prettier.config.js`, and `src/env.js`.

**Secondary:**
- SQL (generated migration SQL) - Schema evolution in `prisma/migrations/20250427221626_post_crud_init/migration.sql`.
- Bash - Local DB bootstrap script in `start-database.sh`.

## Runtime

**Environment:**
- Node.js runtime for Next.js app (`next` scripts in `package.json`).
- Browser runtime for React client components in `src/app/_components/post.tsx`.

**Package Manager:**
- npm (declared as `npm@10.9.0`) in `package.json`.
- Lockfile: present (`package-lock.json`).

## Frameworks

**Core:**
- Next.js `^15.2.3` - App framework and routing (`package.json`, routes under `src/app/**`).
- React `^19.0.0` + React DOM `^19.0.0` - UI runtime (`package.json`, components in `src/app/**`).
- tRPC `^11.0.0` (`@trpc/server`, `@trpc/client`, `@trpc/react-query`) - typed API layer (`src/server/api/**`, `src/trpc/**`).
- Prisma `^6.5.0` + `@prisma/client` `^6.5.0` - DB ORM and client (`prisma/schema.prisma`, `src/server/db.ts`).
- NextAuth `5.0.0-beta.25` + Prisma adapter - authentication (`src/server/auth/config.ts`).
- Zod `^3.24.2` - request/env validation (`src/server/api/routers/post.ts`, `src/env.js`).

**Testing:**
- Not detected (no Jest/Vitest config and no `*.test.*`/`*.spec.*` files in workspace).

**Build/Dev:**
- Next.js build/dev pipeline scripts in `package.json` (`dev`, `build`, `start`, `preview`).
- TypeScript compiler type-checking via `tsc --noEmit` scripts in `package.json`.
- ESLint 9 + `typescript-eslint` + `eslint-config-next` via `eslint.config.js`.
- Prettier 3 + Tailwind plugin via `prettier.config.js`.
- Tailwind CSS 4 + PostCSS via dependencies in `package.json` and `postcss.config.js`.

## Key Dependencies

**Critical:**
- `next`, `react`, `react-dom` - web app runtime and rendering (`package.json`, `src/app/layout.tsx`).
- `@trpc/*` + `@tanstack/react-query` - client/server RPC and cache hydration (`src/trpc/react.tsx`, `src/trpc/server.ts`).
- `prisma` + `@prisma/client` - persistence (`prisma/schema.prisma`, `src/server/db.ts`).
- `next-auth` + `@auth/prisma-adapter` - session/auth flow (`src/server/auth/config.ts`).
- `zod` + `@t3-oss/env-nextjs` - contract and env validation (`src/server/api/routers/post.ts`, `src/env.js`).

**Infrastructure:**
- `superjson` - tRPC payload transformer (`src/server/api/trpc.ts`, `src/trpc/react.tsx`).
- `server-only` - enforce server-only imports (`src/trpc/server.ts`).

## Configuration

**Environment:**
- Centralized env schema in `src/env.js` requiring `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`, `DATABASE_URL` (and `AUTH_SECRET` in production).
- Example values and setup guidance in `.env.example`.
- Next config imports env module in `next.config.js`, so env validation runs at app startup/build.

**Build:**
- TypeScript path alias `~/* -> src/*` configured in `tsconfig.json`.
- Lint and format tooling configured in `eslint.config.js` and `prettier.config.js`.
- Optional local PostgreSQL container config in `docker-compose.yml` and `start-database.sh`.

## Platform Requirements

**Development:**
- Node.js + npm to run scripts in `package.json`.
- PostgreSQL reachable via `DATABASE_URL` (`src/env.js`, `.env.example`).
- Optional Docker/Podman for local DB bootstrap (`start-database.sh`, `docker-compose.yml`).

**Production:**
- Next.js Node deployment target (inferred from `next start` script in `package.json`).
- Runtime env vars required by `src/env.js`.
- PostgreSQL database required by Prisma schema in `prisma/schema.prisma`.

---

*Stack analysis: 2026-03-19*
