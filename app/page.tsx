"use client";

import { useState, useRef, useEffect } from "react";
import { Pause, Play, Square, Download, Trash2, Mic, MicOff, Loader2 } from "lucide-react";

interface Recording {
  id: string;
  filename: string;
  duration: number;
  createdAt: string;
  url: string;
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [duration, setDuration] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [activePlaybackId, setActivePlaybackId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch recordings on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/recordings", {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          console.error("Response status:", res.status, "Response:", await res.text());
          throw new Error(`Failed to fetch recordings: ${res.status}`);
        }
        const data = await res.json();
        setRecordings(data);
      } catch (err) {
        console.error("Error fetching recordings:", err);
        setError("Failed to load recordings");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        // Upload to server
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        formData.append("duration", duration.toString());

        try {
          const res = await fetch("/api/recordings", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.details || errorData.error || "Failed to save recording");
          }

          const newRecording = await res.json();
          setRecordings((prev) => [newRecording, ...prev]);
        } catch (err) {
          console.error("Upload failed:", err);
          setError(err instanceof Error ? err.message : "Failed to save recording");
        } finally {
          // Clean up stream
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setPermissionDenied(true);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const deleteRecording = async (id: string) => {
    try {
      const res = await fetch(`/api/recordings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || "Failed to delete");
      }
      setRecordings((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to delete recording");
    }
  };

  const togglePlayback = (recording: Recording) => {
    if (activePlaybackId === recording.id) {
      const audio = document.getElementById(`audio-${recording.id}`) as HTMLAudioElement;
      audio.pause();
      setActivePlaybackId(null);
    } else {
      if (activePlaybackId) {
        const prevAudio = document.getElementById(`audio-${activePlaybackId}`) as HTMLAudioElement;
        prevAudio.pause();
      }
      const audio = document.getElementById(`audio-${recording.id}`) as HTMLAudioElement;
      audio.play();
      setActivePlaybackId(recording.id);
    }
  };

  const handlePlaybackEnd = () => {
    setActivePlaybackId(null);
  };

  const downloadRecording = (recording: Recording) => {
    const a = document.createElement("a");
    a.href = recording.url;
    a.download = `recording-${new Date(recording.createdAt).toISOString().slice(0, 19).replace(/:/g, "-")}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 p-4 dark:from-black dark:to-zinc-900">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Record
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Built with Next.js, Prisma & SQLite
          </p>
        </header>

        <main>
          {/* Recording Controls */}
          <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-800">
            <div className="flex flex-col items-center gap-6">
              {/* Timer */}
              <div className="text-6xl font-mono font-light text-zinc-900 dark:text-zinc-50">
                {formatTime(duration)}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:scale-105 hover:bg-red-600 active:scale-95 disabled:opacity-50"
                    aria-label="Start recording"
                    disabled={isLoading}
                  >
                    <Mic size={28} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={pauseRecording}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500 text-white shadow-lg transition-all hover:scale-105 hover:bg-yellow-600 active:scale-95"
                      aria-label={isPaused ? "Resume recording" : "Pause recording"}
                    >
                      {isPaused ? <Play size={24} /> : <Pause size={24} />}
                    </button>
                    <button
                      onClick={stopRecording}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all hover:scale-105 hover:bg-red-700 active:scale-95"
                      aria-label="Stop recording"
                    >
                      <Square size={28} />
                    </button>
                  </>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {isRecording && (
                  <>
                    <span
                      className={`h-3 w-3 rounded-full ${isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`}
                    />
                    {isPaused ? "Paused" : "Recording"}
                  </>
                )}
                {!isRecording && !permissionDenied && recordings.length === 0 && isLoading && (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Loading recordings...
                  </span>
                )}
                {!isRecording && !permissionDenied && recordings.length === 0 && !isLoading && (
                  "Click the microphone to start"
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-100 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Permission error */}
              {permissionDenied && (
                <div className="flex items-center gap-2 rounded-lg bg-red-100 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  <MicOff size={20} />
                  <span>Microphone access denied. Please allow microphone access to record.</span>
                </div>
              )}
            </div>
          </div>

          {/* Recordings List */}
          {recordings.length > 0 && (
            <div className="space-y-3">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Your Recordings ({recordings.length})
              </h2>
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-md dark:bg-zinc-800"
                >
                  {/* Play Button */}
                  <button
                    onClick={() => togglePlayback(recording)}
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 disabled:opacity-50"
                    aria-label={activePlaybackId === recording.id ? "Pause" : "Play"}
                  >
                    {activePlaybackId === recording.id ? (
                      <Pause size={20} />
                    ) : (
                      <Play size={20} className="ml-1" />
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {new Date(recording.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatTime(recording.duration)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadRecording(recording)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                      aria-label="Download recording"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                      aria-label="Delete recording"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Hidden Audio Element */}
                  <audio
                    id={`audio-${recording.id}`}
                    src={recording.url}
                    onEnded={handlePlaybackEnd}
                    className="hidden"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {recordings.length === 0 && !isLoading && !permissionDenied && (
            <div className="rounded-2xl border-2 border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Mic size={32} className="text-zinc-400" />
              </div>
              <h3 className="mb-1 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                No recordings yet
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                Start your first recording to see it here
              </p>
            </div>
          )}
        </main>

        <footer className="mt-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>Built with Next.js, Prisma & SQLite</p>
        </footer>
      </div>
    </div>
  );
}
