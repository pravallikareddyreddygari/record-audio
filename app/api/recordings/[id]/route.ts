import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";
import { unlink } from "fs/promises";
import path from "path";

// Determine if we're in a serverless environment
const isServerless = process.env.VERCEL === "1" || process.env.VERCEL_ENV !== undefined;

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

    // Find recording in DB
    const recording = await prisma.recording.findUnique({
      where: { id },
    });

    if (!recording) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    // Delete file based on environment
    if (isServerless || process.env.BLOB_READ_WRITE_TOKEN) {
      // Production/Serverless: Delete from Vercel Blob
      try {
        await del(recording.url);
      } catch (err) {
        console.warn("Failed to delete blob:", err);
      }
    } else {
      // Local development: Delete from filesystem
      try {
        const filepath = path.join(process.cwd(), "public", "recordings", recording.filename);
        await unlink(filepath);
      } catch (err) {
        console.warn("File not found:", err);
      }
    }

    // Delete record from database
    try {
      await prisma.recording.delete({
        where: { id },
      });
    } catch (deleteError: any) {
      if (deleteError.code === 'P2025' || deleteError.message.includes('Record to delete does not exist')) {
        return NextResponse.json({ success: true });
      }
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete recording:", error);
    return NextResponse.json(
      { error: "Failed to delete recording", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
