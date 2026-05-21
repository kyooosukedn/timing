# External Integrations

**Analysis Date:** 2026-03-19

## APIs & External Services

**Authentication / Identity:**
- Discord OAuth via NextAuth provider in `src/server/auth/config.ts`.
  - SDK/Client: `next-auth/providers/discord` (`package.json`, `src/server/auth/config.ts`).
  - Auth: `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET` (`src/env.js`, `.env.example`).

**App API Transport:**
- Internal tRPC HTTP endpoint for frontend-backend communication in `src/app/api/trpc/[trpc]/route.ts`.
  - SDK/Client: `@trpc/client`, `@trpc/react-query` in `src/trpc/react.tsx`.
  - Auth: Session cookie handled by NextAuth route `src/app/api/auth/[...nextauth]/route.ts`.

**Other third-party APIs:**
- Not detected in active source (`src/**`) for Stripe, Supabase, AWS, Redis, Sentry, Datadog, OpenAI, Twilio, SendGrid.

## Data Storage

**Databases:**
- PostgreSQL (local/dev example and Prisma datasource) in `.env.example`, `prisma/schema.prisma`.
  - Connection: `DATABASE_URL` (`src/env.js`, `.env.example`).
  - Client: Prisma client via `src/server/db.ts`.

**File Storage:**
- Local filesystem static assets only (`public/favicon.ico` under `public/`).
- No cloud object storage client integration detected in `src/**`.

**Caching:**
- Application-level request/result cache through TanStack Query in `src/trpc/query-client.ts` and `src/trpc/react.tsx`.
- No external cache service (Redis/Memcached) integration detected in `src/**`.

## Authentication & Identity

**Auth Provider:**
- NextAuth with Discord provider + Prisma adapter (`src/server/auth/config.ts`).
  - Implementation: `NextAuth(authConfig)` in `src/server/auth/index.ts`; route exposure in `src/app/api/auth/[...nextauth]/route.ts`.

## Monitoring & Observability

**Error Tracking:**
- No dedicated external error tracking service detected (e.g., Sentry) in `src/**`.

**Logs:**
- Console-based logging only:
  - tRPC timing logs in `src/server/api/trpc.ts`.
  - Dev error logging in `src/app/api/trpc/[trpc]/route.ts`.

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured in repo; app includes Vercel runtime URL handling in `src/trpc/react.tsx`.

**CI Pipeline:**
- Not detected (no GitHub Actions/workflow files or other CI config present in workspace root scan).

## Environment Configuration

**Required env vars:**
- `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`, `DATABASE_URL` required by schema in `src/env.js`.
- `AUTH_SECRET` required in production according to `src/env.js`.
- `NODE_ENV` recognized and defaulted in `src/env.js`.

**Secrets location:**
- Local development secret template in `.env.example`.
- Runtime loading/validation performed by `src/env.js` and imported in `next.config.js`.

## Webhooks & Callbacks

**Incoming:**
- NextAuth callback routes handled via catch-all endpoint `src/app/api/auth/[...nextauth]/route.ts`.

**Outgoing:**
- OAuth provider outbound calls to Discord are managed by NextAuth provider in `src/server/auth/config.ts`.
- No custom webhook dispatch/outbound integration endpoints detected in `src/**`.

---

*Integration audit: 2026-03-19*
