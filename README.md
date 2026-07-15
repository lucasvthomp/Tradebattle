# Tradebattle

A stock trading simulation platform where users compete in tournaments. Players join a tournament with a buy-in (deducted from their site cash balance), receive a starting balance, and trade real stocks using live market data. Tournament winners earn payouts.

## Tech Stack

Monorepo with a single `package.json`:

- **`client/`** — React 18 SPA (Vite, Wouter routing, TanStack React Query, Radix UI / shadcn, Tailwind CSS, `lightweight-charts`)
- **`server/`** — Express API (Passport auth with local + sign-in-with-Ethereum, polling-based REST chat, Yahoo Finance integration)
- **`shared/`** — Drizzle ORM schema + Zod validation, shared by client and server
- **Database** — PostgreSQL via Drizzle ORM
- **Payments** — Stripe

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL database

### Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, SESSION_SECRET, Stripe keys, etc.
npm run db:push        # push Drizzle schema to your database
```

### Commands

```bash
npm run dev          # Start dev server (Express + Vite HMR) on port 5000
npm run build         # Build client (Vite) + server (esbuild) to dist/
npm run start          # Run production build from dist/
npm run check         # TypeScript type checking (tsc --noEmit)
npm run db:push        # Push Drizzle schema changes to PostgreSQL
```

## How It Works

1. Users register/log in (session-based auth, or connect a wallet via sign-in-with-Ethereum).
2. Users join a tournament, paying a buy-in from their `siteCash` wallet balance.
3. Each participant starts with a fixed tournament balance and trades stocks using real-time Yahoo Finance quotes.
4. Buys and sells are recorded in trade history; sells are liquidated FIFO (oldest purchase first).
5. When a tournament ends, winners receive payouts.

## Deployment

Hosted on [Railway](https://railway.app/), which auto-deploys from GitHub on every push to `main`.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Express session secret |
| `STRIPE_SECRET_KEY` / `VITE_STRIPE_PUBLIC_KEY` | Stripe payment keys |

See `.env.example` for the full list.
