import { prisma } from "./prisma";
import { readdir, mkdir, writeFile } from "fs/promises";
import path from "path";

// Export type for consistency
export type Recording = {
  id: string;
  filename: string;
  duration: number;
  createdAt: Date;
  audioBuffer?: Buffer;
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
      audioBuffer: r.audioData ? Buffer.from(r.audioData) : undefined,
      url: r.audioData ? `data:audio/webm;base64,${r.audioData.toString('base64')}` : "",
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
  audioBuffer?: Buffer
): Promise<Recording | null> {
  try {
    // Save recording to database with audio data
    const recording = await prisma.recording.create({
      data: {
        filename,
        duration,
        audioData: audioBuffer,
      },
    });

    return {
      id: recording.id,
      filename: recording.filename,
      duration: recording.duration,
      createdAt: recording.createdAt,
      audioBuffer: recording.audioData ? Buffer.from(recording.audioData) : undefined,
      url: recording.audioData ? `data:audio/webm;base64,${recording.audioData.toString('base64')}` : "",
    };
  } catch (error) {
    console.error("Failed to create recording:", error);
    return null;
  }
}