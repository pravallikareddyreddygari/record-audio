#!/bin/bash

# Vercel Setup Script
# Run this after setting DATABASE_URL in Vercel environment variables

echo "🚀 Setting up Vercel deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set!"
  echo "Please set DATABASE_URL in your Vercel project settings"
  exit 1
fi

echo "✓ DATABASE_URL is set"

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✓ Migrations completed successfully"
else
  echo "❌ Migrations failed"
  exit 1
fi

echo "✓ Setup complete!"
echo "Your app is ready to use."
