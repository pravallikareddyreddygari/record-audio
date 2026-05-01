import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Determine if we're in a serverless environment
const isServerless = process.env.VERCEL === "1" || process.env.VERCEL_ENV !== undefined;

// GET /api/recordings - List all recordings
export async function GET() {
  try {
    console.log("[GET /api/recordings] Starting...");
    console.log("[GET /api/recordings] DATABASE_URL:", process.env.DATABASE_URL ? "set" : "not set");
    
    const recordings = await prisma.recording.findMany({
      orderBy: { createdAt: "desc" },
    });

    console.log(`[GET /api/recordings] Found ${recordings.length} recordings`);

    const recordingsWithUrls = recordings.map((r) => ({
      id: r.id,
      filename: r.filename,
      duration: r.duration,
      createdAt: r.createdAt.toISOString(),
      url: r.url,
    }));

    console.log("[GET /api/recordings] Returning response");
    return NextResponse.json(recordingsWithUrls);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorCode = error instanceof Error && "code" in error ? (error as any).code : "UNKNOWN";
    
    console.error("[GET /api/recordings] Error:", errorMessage);
    console.error("[GET /api/recordings] Error code:", errorCode);
    console.error("[GET /api/recordings] Full error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch recordings",
        details: errorMessage,
        code: errorCode,
        env: process.env.NODE_ENV,
      },
      { status: 500 }
    );
  }
}

// POST /api/recordings - Upload a new recording
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioBlob = formData.get("audio") as Blob;
    const duration = Number(formData.get("duration"));

    if (!audioBlob) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `recording-${timestamp}.webm`;

    // Convert Blob to Buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let url: string;

    // Use Vercel Blob in serverless/production, filesystem in local development
    if (isServerless || process.env.BLOB_READ_WRITE_TOKEN) {
      // Production/Serverless: Upload to Vercel Blob
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("BLOB_READ_WRITE_TOKEN is required for Vercel deployment");
      }
      const blob = await put(filename, buffer, {
        access: "public",
        contentType: "audio/webm",
      });
      url = blob.url;
    } else {
      // Local development: Save to filesystem
      const filepath = path.join(process.cwd(), "public", "recordings", filename);
      await mkdir(path.join(process.cwd(), "public", "recordings"), { recursive: true });
      await writeFile(filepath, buffer);
      url = `/recordings/${filename}`;
    }

    // Create database record
    const recording = await prisma.recording.create({
      data: {
        filename,
        duration: duration,
        url: url,
      },
    });

    return NextResponse.json(
      {
        id: recording.id,
        filename: recording.filename,
        duration: recording.duration,
        createdAt: recording.createdAt,
        url: recording.url,
      },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("Failed to save recording:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to save recording", details: errorMessage },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
