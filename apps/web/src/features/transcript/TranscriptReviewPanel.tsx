"use client";

import React, { useState } from "react";
import { Languages, Check, Sparkles, Loader2 } from "lucide-react";
import { formatPreciseTime } from "@/lib/format-time";
import type { TranscriptSegment } from "@malayalam-subtitle/subtitle-core";

interface TranscriptReviewPanelProps {
  transcript: TranscriptSegment[];
  onUpdateSegment: (segmentId: string, newText: string) => void;
  onTranslate: () => void;
  isTranslating: boolean;
  onSeek: (ms: number) => void;
}

export function TranscriptReviewPanel({
  transcript,
  onUpdateSegment,
  onTranslate,
  isTranslating,
  onSeek,
}: TranscriptReviewPanelProps) {
  return (
    <div className="flex flex-col h-full bg-surface border border-surfaceBorder rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-3.5 border-b border-surfaceBorder bg-surfaceSubtle/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-textPrimary">Malayalam Transcript Review</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-surfaceBorder text-textSecondary font-mono">
            {transcript.length} segments
          </span>
        </div>

        <button
          onClick={onTranslate}
          disabled={transcript.length === 0 || isTranslating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {isTranslating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Translate to English</span>
            </>
          )}
        </button>
      </div>

      {/* Segment List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-textMuted">
            <Languages className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm font-medium">No transcript available yet</p>
            <p className="text-xs text-textMuted mt-1">
              Upload a video or run transcription to view Malayalam speech segments.
            </p>
          </div>
        ) : (
          transcript.map((seg, idx) => (
            <div
              key={seg.id || idx}
              className="p-3 rounded-lg bg-surfaceSubtle border border-surfaceBorder/80 hover:border-emerald-500/40 transition group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <button
                  onClick={() => onSeek(seg.startMs)}
                  className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>{formatPreciseTime(seg.startMs)}</span>
                  <span className="text-textMuted">➔</span>
                  <span>{formatPreciseTime(seg.endMs)}</span>
                </button>

                {seg.confidence !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      seg.confidence > 0.8
                        ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                        : "bg-amber-950/60 text-amber-300 border border-amber-800/60"
                    }`}
                  >
                    {Math.round(seg.confidence * 100)}% match
                  </span>
                )}
              </div>

              <textarea
                value={seg.text}
                onChange={(e) => onUpdateSegment(seg.id, e.target.value)}
                rows={2}
                className="w-full bg-surface border border-surfaceBorder rounded-md p-2 text-xs sm:text-sm text-textPrimary leading-relaxed resize-none focus:border-emerald-400 focus:outline-none"
                placeholder="Malayalam transcript text..."
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
