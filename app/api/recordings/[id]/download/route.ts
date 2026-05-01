import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import { readFile } from "fs/promises";

// GET /api/recordings/[id]/download - Download a recording
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find recording in database
    const recording = await prisma.recording.findUnique({
      where: { id },
    });
    if (!recording || !recording.audioData) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    const audioBuffer = Buffer.from(recording.audioData);

    // Return audio file
    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/webm',
        'Content-Disposition': `attachment; filename="${recording.filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to download recording:", error);
    return NextResponse.json(
      { error: "Failed to download recording", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}