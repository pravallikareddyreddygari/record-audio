import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET /api/recordings - List all recordings
export async function GET() {
  try {
    const recordings = await prisma.recording.findMany({
      orderBy: { createdAt: "desc" },
    });

    const recordingsWithUrls = recordings.map((r) => ({
      id: r.id,
      filename: r.filename,
      duration: r.duration,
      createdAt: r.createdAt,
      url: `/recordings/${r.filename}`,
    }));

    return NextResponse.json(recordingsWithUrls);
  } catch (error) {
    console.error("Failed to fetch recordings:", error);
    return NextResponse.json({ error: "Failed to fetch recordings" }, { status: 500 });
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
    const filepath = path.join(process.cwd(), "public", "recordings", filename);

    // Ensure directory exists
    await mkdir(path.join(process.cwd(), "public", "recordings"), { recursive: true });

    // Convert Blob to Buffer and save
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filepath, buffer);

    // Create database record
    const recording = await prisma.recording.create({
      data: {
        filename,
        duration: duration,
      },
    });

    return NextResponse.json(
      {
        id: recording.id,
        filename: recording.filename,
        duration: recording.duration,
        createdAt: recording.createdAt,
        url: `/recordings/${recording.filename}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save recording:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to save recording", details: errorMessage },
      { status: 500 }
    );
  }
}
