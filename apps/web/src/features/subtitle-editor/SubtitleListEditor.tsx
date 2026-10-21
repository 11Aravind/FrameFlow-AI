"use client";

import React, { useRef, useEffect } from "react";
import { Plus, Trash2, Clock, AlertCircle } from "lucide-react";
import { formatPreciseTime } from "@/lib/format-time";
import type { SubtitleCue } from "@malayalam-subtitle/subtitle-core";

interface SubtitleListEditorProps {
  cues: SubtitleCue[];
  activeCueId?: string | null;
  onUpdateCue: (cueId: string, updates: Partial<SubtitleCue>) => void;
  onAddCue: (afterIndex: number) => void;
  onDeleteCue: (cueId: string) => void;
  onSeek: (ms: number) => void;
}

export function SubtitleListEditor({
  cues,
  activeCueId,
  onUpdateCue,
  onAddCue,
  onDeleteCue,
  onSeek,
}: SubtitleListEditorProps) {
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Scroll active cue into view gently
  useEffect(() => {
    if (activeCueId && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeCueId]);

  return (
    <div className="flex flex-col h-full bg-surface border border-surfaceBorder rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-3.5 border-b border-surfaceBorder bg-surfaceSubtle/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-textPrimary">English Subtitles</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-surfaceBorder text-textSecondary font-mono">
            {cues.length} cues
          </span>
        </div>

        <button
          onClick={() => onAddCue(cues.length - 1)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Cue</span>
        </button>
      </div>

      {/* Cue List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {cues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-textMuted">
            <Clock className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm font-medium">No subtitles generated yet</p>
            <p className="text-xs text-textMuted mt-1">
              Translate the Malayalam transcript or click "+ Add Cue" to create subtitles manually.
            </p>
          </div>
        ) : (
          cues.map((cue, idx) => {
            const isActive = cue.id === activeCueId;
            const hasTimingError = cue.endMs <= cue.startMs;

            return (
              <div
                key={cue.id}
                ref={isActive ? activeItemRef : null}
                className={`p-3 rounded-lg border transition-all ${
                  isActive
                    ? "bg-surfaceSubtle border-emerald-500/70 shadow-md ring-1 ring-emerald-500/30"
                    : "bg-surfaceSubtle/50 border-surfaceBorder hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  {/* Cue number and seek trigger */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface border border-surfaceBorder text-textMuted">
                      #{idx + 1}
                    </span>
                    <button
                      onClick={() => onSeek(cue.startMs)}
                      className="text-xs font-mono text-emerald-400 hover:underline"
                      title="Seek to start time"
                    >
                      {formatPreciseTime(cue.startMs)} ➔ {formatPreciseTime(cue.endMs)}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAddCue(idx)}
                      className="p-1 rounded text-textMuted hover:text-emerald-400 transition"
                      title="Insert cue below"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCue(cue.id)}
                      className="p-1 rounded text-textMuted hover:text-red-400 transition"
                      title="Delete cue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtitle text textarea */}
                <textarea
                  value={cue.text}
                  onChange={(e) => onUpdateCue(cue.id, { text: e.target.value, edited: true })}
                  rows={2}
                  className="w-full bg-surface border border-surfaceBorder rounded-md p-2 text-xs sm:text-sm text-textPrimary leading-relaxed resize-none focus:border-emerald-400 focus:outline-none"
                  placeholder="Enter English subtitle line..."
                />

                {/* Millisecond precision inputs */}
                <div className="mt-2 pt-2 border-t border-surfaceBorder/40 flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-textMuted font-mono text-[10px]">Start(ms):</span>
                    <input
                      type="number"
                      value={cue.startMs}
                      onChange={(e) =>
                        onUpdateCue(cue.id, {
                          startMs: Math.max(0, parseInt(e.target.value, 10) || 0),
                          edited: true,
                        })
                      }
                      className="w-20 bg-surface border border-surfaceBorder rounded px-1.5 py-0.5 font-mono text-xs text-textPrimary focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-textMuted font-mono text-[10px]">End(ms):</span>
                    <input
                      type="number"
                      value={cue.endMs}
                      onChange={(e) =>
                        onUpdateCue(cue.id, {
                          endMs: Math.max(0, parseInt(e.target.value, 10) || 0),
                          edited: true,
                        })
                      }
                      className="w-20 bg-surface border border-surfaceBorder rounded px-1.5 py-0.5 font-mono text-xs text-textPrimary focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  {hasTimingError && (
                    <div className="flex items-center gap-1 text-[11px] text-red-400 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      <span>End must follow start</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
