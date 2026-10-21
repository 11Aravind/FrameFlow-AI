"use client";

import React, { useState } from "react";
import { Download, Copy, Check, X, FileText, AlertTriangle } from "lucide-react";
import { serializeSrt, serializeVtt, validateCues } from "@malayalam-subtitle/subtitle-core";
import type { SubtitleCue } from "@malayalam-subtitle/subtitle-core";

interface ExportModalProps {
  cues: SubtitleCue[];
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ cues, projectName, isOpen, onClose }: ExportModalProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const issues = validateCues(cues);
  const errors = issues.filter((i) => i.severity === "error");
  const baseName = projectName.replace(/\.[^/.]+$/, "");

  function handleDownload(format: "srt" | "vtt") {
    const text = format === "srt" ? serializeSrt(cues) : serializeVtt(cues);
    const mime = format === "srt" ? "text/plain;charset=utf-8" : "text/vtt;charset=utf-8";
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleCopy(format: "srt" | "vtt") {
    const text = format === "srt" ? serializeSrt(cues) : serializeVtt(cues);
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-surfaceBorder rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-textMuted hover:text-textPrimary hover:bg-surfaceSubtle transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-textPrimary">Export Subtitles</h3>
            <p className="text-xs text-textSecondary">{cues.length} valid subtitle cues ready</p>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Timing warnings detected:</p>
              <p className="text-textMuted mt-0.5">{errors[0].message}</p>
            </div>
          </div>
        )}

        <div className="space-y-3 mt-4">
          {/* SRT Export */}
          <div className="p-3.5 rounded-xl bg-surfaceSubtle border border-surfaceBorder flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-textPrimary">SubRip (.srt)</p>
                <p className="text-xs text-textMuted">Universal standard for media players</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy("srt")}
                className="p-2 rounded-lg bg-surface border border-surfaceBorder text-textSecondary hover:text-textPrimary transition"
                title="Copy SRT to clipboard"
              >
                {copiedFormat === "srt" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => handleDownload("srt")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* WebVTT Export */}
          <div className="p-3.5 rounded-xl bg-surfaceSubtle border border-surfaceBorder flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-sky-400" />
              <div>
                <p className="text-sm font-semibold text-textPrimary">WebVTT (.vtt)</p>
                <p className="text-xs text-textMuted">Optimized for HTML5 web videos</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy("vtt")}
                className="p-2 rounded-lg bg-surface border border-surfaceBorder text-textSecondary hover:text-textPrimary transition"
                title="Copy VTT to clipboard"
              >
                {copiedFormat === "vtt" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => handleDownload("vtt")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-400 text-slate-950 hover:bg-sky-300 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
