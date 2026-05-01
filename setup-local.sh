#!/bin/bash

# Local Development Setup Script

echo "🚀 Setting up local development environment..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "❌ .env.local not found!"
  echo "Please create .env.local with DATABASE_URL"
  echo ""
  echo "Example for Vercel Postgres:"
  echo 'DATABASE_URL="postgresql://..."'
  echo ""
  echo "Example for local PostgreSQL:"
  echo 'DATABASE_URL="postgresql://localhost:5432/record"'
  exit 1
fi

echo "✓ .env.local found"

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.local; then
  echo "❌ DATABASE_URL not set in .env.local"
  exit 1
fi

echo "✓ DATABASE_URL is set"

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✓ Setup complete!"
  echo ""
  echo "Next steps:"
  echo "1. Run: npm run dev"
  echo "2. Open: http://localhost:3000"
  echo "3. Try recording audio!"
else
  echo "❌ Migrations failed"
  echo "Make sure your DATABASE_URL is correct and the database is accessible"
  exit 1
fi
