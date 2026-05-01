import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Delete recording from database
    try {
      await prisma.recording.delete({
        where: { id },
      });
    } catch (deleteError: any) {
      if (deleteError.code === 'P2025' || deleteError.message.includes('Record to delete does not exist')) {
        // Already deleted or not found
        return NextResponse.json({ success: true });
      }
      throw deleteError; // Re-throw other errors
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
