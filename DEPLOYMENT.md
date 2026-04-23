# Deployment Guide

## Local Development

```bash
npm install
npm run dev
```

The app will run on http://localhost:3000 with SQLite database at `dev.db`.

## Vercel Deployment

### Option 1: Using Vercel Postgres (Recommended)

1. Create a Vercel Postgres database at https://vercel.com/docs/storage/vercel-postgres
2. Set the `DATABASE_URL` environment variable in Vercel project settings
3. Update `prisma/schema.prisma` to use PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. Run migrations:
```bash
npx prisma migrate deploy
```

5. Deploy to Vercel

### Option 2: Using SQLite (Local Only)

For local development only. SQLite doesn't work well with Vercel's serverless architecture due to file persistence limitations.

## Environment Variables

Create a `.env.local` file with:

```
DATABASE_URL="file:./dev.db"
```

For production, set `DATABASE_URL` in Vercel project settings to your cloud database URL.
