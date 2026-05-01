import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    await prisma.recording.findFirst();
    
    return NextResponse.json({
      status: "ok",
      database: "connected",
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL === "1" ? "yes" : "no",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Health check failed:", errorMessage);
    
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: errorMessage,
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    );
  }
}
