import { PrismaClient } from "@prisma/client";

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set!");
  console.error("Please set DATABASE_URL in your environment variables.");
  if (process.env.VERCEL === "1") {
    console.error("For Vercel: Go to Settings → Environment Variables and add DATABASE_URL");
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Test database connection on startup
if (process.env.NODE_ENV === "development") {
  prisma.$connect()
    .then(() => console.log("✓ Database connected"))
    .catch((err) => console.error("✗ Database connection failed:", err));
}
