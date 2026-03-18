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

### Deploy to Vercel

All environment variables above **must** be set in your Vercel project settings before the app will work:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) → your project → **Settings → Environment Variables**
2. Add every variable from the table above
3. For `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`:
   - Open [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials**
   - Create (or update) an **OAuth 2.0 Client ID** of type *Web application*
   - Add an **Authorised redirect URI**: `https://<your-app>.vercel.app/api/auth/callback/google`
4. For `AUTH_URL`, set it to your exact Vercel deployment URL (e.g. `https://kinnects-fundraise.vercel.app`)
5. After saving env vars, **redeploy** the project so the new values take effect

> **Troubleshooting:** If you see `error=Configuration` on the sign-in page, it means one or more of `AUTH_SECRET`, `AUTH_GOOGLE_ID`, or `AUTH_GOOGLE_SECRET` is missing or blank in your Vercel environment variables. Check the **Deployments** log for details.

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
