#!/bin/bash
set -e

echo "🔨 Building application..."

# Check if we're on Vercel
if [ "$VERCEL" = "1" ]; then
  echo "📦 Vercel environment detected"
  
  # Use PostgreSQL schema for Vercel
  if [ -f "prisma/schema.prod.prisma" ]; then
    echo "Switching to PostgreSQL schema..."
    cp prisma/schema.prisma prisma/schema.sqlite.prisma
    cp prisma/schema.prod.prisma prisma/schema.prisma
  fi
  
  # Set dummy DATABASE_URL if not set (for Prisma generation)
  if [ -z "$DATABASE_URL" ]; then
    export DATABASE_URL="postgresql://localhost/dummy"
    echo "⚠️  DATABASE_URL not set, using dummy for build"
  fi
else
  echo "💻 Local development environment"
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build Next.js
echo "Building Next.js..."
npm run build

echo "✓ Build complete!"


