# Kinnect Pitch

Self-hosted investor pitch tracker built with Next.js 15, Prisma, NextAuth v5, and Vercel Blob.

## Getting Started

### Clone the repo

```bash
# If you haven't cloned yet:
git clone https://github.com/KINNECT-CLUB/kinnects-fundraise.git
cd kinnects-fundraise

# If the directory already exists, pull the latest instead:
cd kinnects-fundraise
git pull origin main
```

### Install dependencies

```bash
npm install
```

> **Note:** This project uses `legacy-peer-deps=true` (set in `.npmrc`) to resolve peer dependency conflicts between React 19 and certain packages.

### Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the values in `.env.local`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (e.g. [Neon](https://neon.tech) free tier) |
| `AUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `AUTH_URL` | Your deployed app URL — must match the redirect URI registered in Google Cloud Console (e.g. `https://your-app.vercel.app`) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (auto-filled when linked in Vercel dashboard) |
| `NEXT_PUBLIC_APP_URL` | Your deployed app URL |

### Set up the database

```bash
npm run db:push
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Regenerate Prisma client |

## Tech Stack

- [Next.js 15](https://nextjs.org) — App Router
- [Prisma](https://prisma.io) — ORM
- [NextAuth v5](https://authjs.dev) — Authentication
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) — PDF storage
- [Radix UI](https://radix-ui.com) + [Tailwind CSS](https://tailwindcss.com) — UI
