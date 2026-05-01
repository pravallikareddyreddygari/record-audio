# Quick Start - 5 Minutes

## The Fastest Way to Get Running

### Step 1: Create Vercel Postgres Database (2 minutes)

1. Go to https://vercel.com/dashboard
2. Click **Storage** → **Create Database** → **Postgres**
3. Select a region (closest to you)
4. Click **Create**
5. Copy the connection string (it will show in the UI)

### Step 2: Update `.env.local` (1 minute)

Open `.env.local` and replace:
```
DATABASE_URL="postgresql://localhost:5432/record"
```

With your Vercel Postgres URL:
```
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require"
```

### Step 3: Run the App (2 minutes)

```bash
# Install dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Start dev server
npm run dev
```

### Step 4: Open and Test

1. Open http://localhost:3000
2. Try recording audio
3. Done! 🎉

## Troubleshooting

### "Can't reach database server"
- Check your DATABASE_URL in `.env.local`
- Make sure you copied the full URL from Vercel
- Verify the URL includes `?sslmode=require` at the end

### "Connection refused"
- Make sure you're using the Vercel Postgres URL, not localhost
- Check the URL is correct (copy-paste from Vercel dashboard)

### Still having issues?
- Check [LOCAL_SETUP.md](./LOCAL_SETUP.md) for more options
- Check [VERCEL_SETUP.md](./VERCEL_SETUP.md) for deployment help

## Next: Deploy to Vercel

Once local development works:

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Vercel will auto-detect Next.js
5. Set `DATABASE_URL` environment variable
6. Deploy!

See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed deployment steps.
