import { NextRequest, NextResponse } from "next/server";
import { getRecordings, createRecording } from "@/lib/storage";

// GET /api/recordings - List all recordings
export async function GET() {
  try {
    const recordings = await getRecordings();
    const recordingsWithUrls = recordings.map((r) => ({
      id: r.id,
      filename: r.filename,
      duration: r.duration,
      createdAt: r.createdAt,
      url: r.url,
    }));

    return NextResponse.json(recordingsWithUrls, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Failed to fetch recordings:", error);
    return NextResponse.json({ error: "Failed to fetch recordings" }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
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

    // Convert Blob to Buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create recording in database with audio data
    const recording = await createRecording(filename, duration, buffer);

    if (!recording) {
      return NextResponse.json({ error: "Failed to save recording to database" }, { status: 500 });
    }

    return NextResponse.json(
      {
        id: recording.id,
        filename: recording.filename,
        duration: recording.duration,
        createdAt: recording.createdAt,
        url: recording.url,
      },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("Failed to save recording:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to save recording", details: errorMessage },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
