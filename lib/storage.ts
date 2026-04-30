import { readdir } from "fs/promises";
import path from "path";

// In-memory storage for recordings (temporary solution to avoid Prisma/Turbopack issues)
export let recordings: Array<{
  id: string;
  filename: string;
  duration: number;
  createdAt: Date;
}> = [];

// Load recordings from filesystem on startup
export async function loadRecordings() {
  try {
    const recordingsDir = path.join(process.cwd(), "public", "recordings");
    const files = await readdir(recordingsDir).catch(() => []);
    recordings = files
      .filter(file => file.endsWith('.webm'))
      .map(file => {
        const match = file.match(/recording-(\d+)\.webm/);
        if (match) {
          const timestamp = parseInt(match[1]);
          return {
            id: timestamp.toString(),
            filename: file,
            duration: 0, // We'll need to store this separately or estimate
            createdAt: new Date(timestamp),
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Failed to load recordings:", error);
  }
}

// Initialize recordings
loadRecordings();