# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Express + Vite HMR) on port 5000
npm run build        # Build client (Vite) + server (esbuild) to dist/
npm run start        # Run production build from dist/
npm run check        # TypeScript type checking (tsc --noEmit)
npm run db:push      # Push Drizzle schema changes to PostgreSQL
```

## Architecture

**Monorepo** with three directories sharing a single `package.json`:

- `client/` — React 18 SPA (Vite, Wouter routing, React Query)
- `server/` — Express API (Passport auth, polling-based REST chat, Yahoo Finance integration)
- `shared/` — Drizzle ORM schema + Zod validation, used by both client and server

### Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

### How the App Works

Tradebattle is a stock trading simulation platform where users compete in tournaments. Users join tournaments with a buy-in (deducted from `siteCash`), receive a starting balance, and trade stocks using real-time Yahoo Finance data. Tournament winners earn payouts.

### Client

- **Routing:** Wouter (not React Router). Routes defined in `client/src/App.tsx`.
- **Data Fetching:** TanStack React Query. API calls go through `client/src/lib/queryClient.ts` which provides `apiRequest()` helper and default query function.
- **Auth:** `useAuth()` hook from `client/src/hooks/use-auth.tsx` provides `user`, `loginMutation`, `registerMutation`, `logoutMutation`.
- **UI Components:** Radix UI + shadcn/ui pattern in `client/src/components/ui/`. Styled with Tailwind CSS.
- **Charts:** `lightweight-charts` v5 for trading charts (`AdvancedTradingChart` component), Recharts for other visualizations.
- **Styling:** Hardcoded dark theme colors (background `#06121F`, cards `#1E2D3F`, borders `#2B3A4C`, gold accent `#E3B341`, green `#28C76F`, red `#FF4F58`, text `#C9D1E2`/`#8A93A6`). Use inline `style={}` props with these hex values, not CSS variables or Tailwind color classes.

### Server

- **Entry:** `server/index.ts` — Express app setup, Vite dev middleware, tournament scheduler.
- **Auth:** Passport.js local strategy in `server/auth.ts`. Password hashing with scrypt. Session-based, stored in PostgreSQL via `connect-pg-simple` (the `sessions` table). Also supports Web3 wallet (sign-in-with-Ethereum) auth.
- **Routes:** `server/routes.ts` (main app routes) + `server/routes/api.ts` (Yahoo Finance API routes). Protected routes use `requireAuth` middleware.
- **Storage:** `server/storage.ts` — Database abstraction layer. All DB operations go through the `storage` object (e.g., `storage.getUser()`, `storage.joinTournament()`).
- **Yahoo Finance:** `server/services/yahooFinance.ts` — `getStockQuote()`, `getHistoricalData()`, `searchStocks()`, `getCompanyProfile()`, `getPopularStocks()`. Has internal caching (5s quotes, 30min historical).

### Database

- **PostgreSQL** with Drizzle ORM. Schema in `shared/schema.ts`.
- **Key tables:** `users`, `tournaments`, `tournamentParticipants`, `tournamentStockPurchases`, `tradeHistory`, `userAchievements`, `chatMessages`.
- **Trading flow:** Buys go to `POST /api/tournaments/:id/purchase`, sells to `POST /api/tournaments/:id/sell`. Sells use FIFO liquidation (oldest purchases sold first).
- **Balance types:** `siteCash` is the main wallet balance (used for buy-ins). Tournament balances are tracked per-participant.

### Deployment

Railway auto-deploys from GitHub on push to `main`. No manual deploy needed — just push.

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — Express session secret
- `STRIPE_SECRET_KEY` / `VITE_STRIPE_PUBLIC_KEY` — Stripe payment keys
