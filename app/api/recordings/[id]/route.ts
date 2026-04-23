import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

// DELETE /api/recordings/[id] - Delete a recording
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find recording in DB
    const recording = await prisma.recording.findUnique({
      where: { id },
    });

    if (!recording) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    // Delete file from filesystem
    const filepath = path.join(process.cwd(), "public", "recordings", recording.filename);
    try {
      await unlink(filepath);
    } catch (err) {
      // File may not exist, continue
      console.warn("File not found:", filepath);
    }

    // Delete record from database
    await prisma.recording.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete recording:", error);
    return NextResponse.json({ error: "Failed to delete recording" }, { status: 500 });
  }
}
