import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { recordings } from "@/lib/storage";

// DELETE /api/recordings/[id] - Delete a recording
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Recording ID is required" }, { status: 400 });
    }

    // Find recording in memory
    const recordingIndex = recordings.findIndex(r => r.id === id);
    if (recordingIndex === -1) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    const recording = recordings[recordingIndex];

    // Delete file from filesystem
    const filepath = path.join(process.cwd(), "public", "recordings", recording.filename);
    try {
      await unlink(filepath);
    } catch (err) {
      // File may not exist, continue
      console.warn("File not found:", filepath);
    }

    // Remove from recordings array
    recordings.splice(recordingIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete recording:", error);
    return NextResponse.json(
      { error: "Failed to delete recording", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
