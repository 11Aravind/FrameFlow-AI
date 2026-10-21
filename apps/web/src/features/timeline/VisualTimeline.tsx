"use client";

import React, { useRef } from "react";
import { formatDisplayTime } from "@/lib/format-time";
import type { SubtitleCue } from "@malayalam-subtitle/subtitle-core";

interface VisualTimelineProps {
  durationMs: number;
  currentTimeMs: number;
  cues: SubtitleCue[];
  activeCueId?: string | null;
  onSeek: (ms: number) => void;
}

export function VisualTimeline({
  durationMs,
  currentTimeMs,
  cues,
  activeCueId,
  onSeek,
}: VisualTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const total = Math.max(durationMs, 1000);
  const playheadPercent = Math.min(100, Math.max(0, (currentTimeMs / total) * 100));

  function handleTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const targetMs = Math.floor((clickX / rect.width) * total);
    onSeek(targetMs);
  }

  // Generate 5-6 interval markers
  const markers = [0, 0.25, 0.5, 0.75, 1.0].map((frac) => ({
    percent: frac * 100,
    time: formatDisplayTime(Math.floor(frac * total)),
  }));

  return (
    <div className="w-full bg-surface border border-surfaceBorder rounded-xl p-3 shadow-md flex flex-col gap-2 select-none">
      <div className="flex items-center justify-between text-xs text-textMuted px-1">
        <span className="font-semibold text-textSecondary">Visual Timeline</span>
        <span className="font-mono text-emerald-400">{formatDisplayTime(currentTimeMs)}</span>
      </div>

      {/* Interactive Timeline Track */}
      <div
        ref={containerRef}
        onClick={handleTimelineClick}
        className="relative h-14 bg-slate-950 rounded-lg border border-surfaceBorder cursor-pointer overflow-hidden group"
      >
        {/* Time ruler ticks */}
        {markers.map((m, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-surfaceBorder/40 pointer-events-none"
            style={{ left: `${m.percent}%` }}
          >
            <span className="text-[9px] font-mono text-textMuted/60 pl-1">
              {m.time}
            </span>
          </div>
        ))}

        {/* Cue Blocks */}
        {cues.map((cue) => {
          const leftPercent = Math.min(100, Math.max(0, (cue.startMs / total) * 100));
          const widthPercent = Math.min(
            100 - leftPercent,
            Math.max(1, ((cue.endMs - cue.startMs) / total) * 100)
          );
          const isActive = cue.id === activeCueId;

          return (
            <div
              key={cue.id}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(cue.startMs);
              }}
              className={`absolute top-5 h-7 rounded px-1.5 flex items-center overflow-hidden transition-all text-[11px] truncate border ${
                isActive
                  ? "bg-emerald-500 text-slate-950 font-semibold border-emerald-300 shadow-md ring-2 ring-emerald-400/50 z-10"
                  : "bg-surfaceSubtle text-textSecondary border-surfaceBorder/80 hover:border-emerald-500/50 hover:text-textPrimary"
              }`}
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
              }}
              title={`${cue.text} (${formatDisplayTime(cue.startMs)} - ${formatDisplayTime(cue.endMs)})`}
            >
              {cue.text}
            </div>
          );
        })}

        {/* Playhead Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-20 pointer-events-none transition-all duration-75"
          style={{ left: `${playheadPercent}%` }}
        >
          <div className="w-2.5 h-2.5 -ml-1 bg-red-400 rounded-full shadow" />
        </div>
      </div>
    </div>
  );
}
