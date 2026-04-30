import { prisma } from "./lib/prisma";

async function test() {
  try {
    const recordings = await prisma.recording.findMany();
    console.log("Database connection successful, recordings:", recordings);
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();