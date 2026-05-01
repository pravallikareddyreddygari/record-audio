# Local Development Setup

## Option 1: Using Vercel Postgres (Easiest)

This is the easiest way to develop locally with the same database as production.

### Steps:

1. **Create a Vercel Postgres database:**
   - Go to https://vercel.com/dashboard
   - Click Storage → Create Database → Postgres
   - Copy the connection string

2. **Update `.env.local`:**
   ```bash
   DATABASE_URL="<your-vercel-postgres-url>"
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start dev server:**
   ```bash
   npm run dev
   ```

## Option 2: Using Local PostgreSQL

If you prefer a local database:

### Prerequisites:
- PostgreSQL installed locally
- psql command available

### Steps:

1. **Create a local database:**
   ```bash
   createdb record
   ```

2. **Update `.env.local`:**
   ```bash
   DATABASE_URL="postgresql://localhost:5432/record"
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start dev server:**
   ```bash
   npm run dev
   ```

## Option 3: Using Docker PostgreSQL

If you have Docker installed:

### Steps:

1. **Start PostgreSQL container:**
   ```bash
   docker run --name record-db \
     -e POSTGRES_DB=record \
     -e POSTGRES_PASSWORD=password \
     -p 5432:5432 \
     -d postgres:latest
   ```

2. **Update `.env.local`:**
   ```bash
   DATABASE_URL="postgresql://postgres:password@localhost:5432/record"
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start dev server:**
   ```bash
   npm run dev
   ```

## Troubleshooting

### "Connection refused"
- Make sure PostgreSQL is running
- Check DATABASE_URL is correct
- Try: `psql $DATABASE_URL` to test connection

### "Database does not exist"
- Create the database: `createdb record`
- Or update DATABASE_URL to use a different database name

### "Migrations failed"
- Check database is accessible
- Try: `npx prisma db push` to sync schema
- Or: `npx prisma migrate reset` to reset (WARNING: deletes data)

## Useful Commands

```bash
# View database in browser UI
npx prisma studio

# Check database connection
npx prisma db execute --stdin < /dev/null

# View migrations
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name add_feature

# Reset database (development only!)
npx prisma migrate reset
```

## Environment Variables

| Variable | Local | Vercel |
|----------|-------|--------|
| DATABASE_URL | PostgreSQL URL | PostgreSQL URL |
| BLOB_READ_WRITE_TOKEN | Not needed | Auto-generated |

## Next Steps

After setting up local development:

1. ✅ Run `npm run dev`
2. ✅ Open http://localhost:3000
3. ✅ Try recording audio
4. ✅ Check browser console for errors

For production deployment, see [VERCEL_SETUP.md](./VERCEL_SETUP.md)
