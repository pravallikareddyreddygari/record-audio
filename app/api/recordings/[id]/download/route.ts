import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    if (!recording || !recording.url) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    // Redirect to the blob URL for download
    return NextResponse.redirect(recording.url);
  } catch (error) {
    console.error("Failed to download recording:", error);
    return NextResponse.json(
      { error: "Failed to download recording", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}