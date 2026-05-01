import { prisma } from "./prisma";
import { put } from '@vercel/blob';

// Export type for consistency
export type Recording = {
  id: string;
  filename: string;
  duration: number;
  createdAt: Date;
  url: string;
};

// Get all recordings from database
export async function getRecordings(): Promise<Recording[]> {
  try {
    const recordings = await prisma.recording.findMany({
      orderBy: { createdAt: "desc" },
    });

    return recordings.map((r) => ({
      id: r.id,
      filename: r.filename,
      duration: r.duration,
      createdAt: r.createdAt,
      url: r.url,
    }));
  } catch (error) {
    console.error("Failed to fetch recordings:", error);
    return [];
  }
}

// Create a new recording
export async function createRecording(
  filename: string,
  duration: number,
  audioBuffer: Buffer
): Promise<Recording | null> {
  try {
    // Upload audio to Vercel Blob
    const blob = await put(filename, audioBuffer, {
      access: 'public',
      contentType: 'audio/webm',
    });

    // Save recording metadata to database
    const recording = await prisma.recording.create({
      data: {
        filename,
        duration,
        url: blob.url,
      },
    });

    return {
      id: recording.id,
      filename: recording.filename,
      duration: recording.duration,
      createdAt: recording.createdAt,
      url: recording.url,
    };
  } catch (error) {
    console.error("Failed to create recording:", error);
    return null;
  }
}