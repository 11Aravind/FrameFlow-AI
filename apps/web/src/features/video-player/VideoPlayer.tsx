"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { formatDisplayTime } from "@/lib/format-time";
import type { SubtitleCue } from "@malayalam-subtitle/subtitle-core";

interface VideoPlayerProps {
  src: string;
  activeCue?: SubtitleCue | null;
  onTimeUpdate?: (currentTimeMs: number) => void;
  seekToMs?: number | null;
}

export function VideoPlayer({
  src,
  activeCue,
  onTimeUpdate,
  seekToMs,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Handle external seek requests (e.g. clicking a subtitle cue or timeline block)
  useEffect(() => {
    if (seekToMs !== undefined && seekToMs !== null && videoRef.current) {
      videoRef.current.currentTime = seekToMs / 1000;
      setCurrentTimeMs(seekToMs);
    }
  }, [seekToMs]);

  function togglePlay() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }

  function handleTimeUpdate() {
    if (!videoRef.current) return;
    const ms = Math.floor(videoRef.current.currentTime * 1000);
    setCurrentTimeMs(ms);
    onTimeUpdate?.(ms);
  }

  function handleLoadedMetadata() {
    if (!videoRef.current) return;
    setDurationMs(Math.floor(videoRef.current.duration * 1000));
  }

  function handleScrub(e: React.ChangeEvent<HTMLInputElement>) {
    const targetMs = parseInt(e.target.value, 10);
    if (videoRef.current) {
      videoRef.current.currentTime = targetMs / 1000;
      setCurrentTimeMs(targetMs);
      onTimeUpdate?.(targetMs);
    }
  }

  function toggleMute() {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }

  function handleFullscreen() {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  }

  return (
    <div className="relative flex flex-col bg-slate-950 rounded-xl overflow-hidden border border-surfaceBorder shadow-xl group">
      {/* Video Viewport */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center cursor-pointer" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
        />

        {/* Active Subtitle Overlay */}
        {activeCue && (
          <div className="absolute bottom-12 inset-x-4 flex justify-center pointer-events-none">
            <span className="bg-black/75 text-white px-4 py-1.5 rounded-md text-sm sm:text-base font-medium text-center shadow-lg border border-white/10 backdrop-blur-sm max-w-[85%] whitespace-pre-line leading-relaxed">
              {activeCue.text}
            </span>
          </div>
        )}
      </div>

      {/* Media Controls Bar */}
      <div className="bg-surfaceSubtle border-t border-surfaceBorder px-4 py-2 flex flex-col gap-2">
        {/* Seek Bar */}
        <input
          type="range"
          min={0}
          max={durationMs || 100}
          value={currentTimeMs}
          onChange={handleScrub}
          className="w-full h-1 bg-surfaceBorder accent-emerald-400 rounded-lg cursor-pointer"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg bg-surface hover:bg-emerald-500/20 text-textPrimary hover:text-emerald-400 transition"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary transition"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <span className="text-xs font-mono text-textSecondary">
              {formatDisplayTime(currentTimeMs)} / {formatDisplayTime(durationMs)}
            </span>
          </div>

          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary transition"
            title="Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
