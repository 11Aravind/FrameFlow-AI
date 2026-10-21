"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Film, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { APP_CONFIG } from "@/lib/config";

export function VideoUploadCard() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validateAndSetFile(file: File) {
    setUploadError(null);
    if (!file.name.toLowerCase().endsWith(".mp4")) {
      setUploadError("Only MP4 video files (.mp4) are currently supported.");
      return;
    }

    const maxBytes = APP_CONFIG.maxUploadMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`File size exceeds maximum allowed size of ${APP_CONFIG.maxUploadMb}MB.`);
      return;
    }

    setSelectedFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(20);

    try {
      setUploadProgress(60);
      const res = await apiClient.uploadVideo(selectedFile);
      setUploadProgress(100);
      router.push(`/projects/${res.project.id}`);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Ensure backend service is running.");
      setIsUploading(false);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-surface border border-surfaceBorder rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-textPrimary tracking-tight">
          Upload Malayalam Video
        </h2>
        <p className="text-xs sm:text-sm text-textSecondary mt-1">
          Transcribe Malayalam speech, review terms, and generate English subtitles locally.
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-emerald-500 bg-emerald-500/5"
            : "border-surfaceBorder hover:border-emerald-500/50 hover:bg-surfaceSubtle/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp4"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              validateAndSetFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-surfaceSubtle border border-surfaceBorder flex items-center justify-center text-emerald-400">
          {selectedFile ? <Film className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
        </div>

        {selectedFile ? (
          <div>
            <p className="text-sm font-semibold text-textPrimary truncate">{selectedFile.name}</p>
            <p className="text-xs text-textMuted mt-1">
              {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
            </p>
            <p className="text-xs text-emerald-400 mt-2 font-medium">Click to select another file</p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-textPrimary">
              Drag & drop your MP4 video here, or <span className="text-emerald-400 underline underline-offset-2">browse</span>
            </p>
            <p className="text-xs text-textMuted mt-2">
              Supports MP4 up to {APP_CONFIG.maxUploadMb}MB
            </p>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-textMuted mb-1 font-mono">
            <span>Uploading to local project workspace...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-surfaceSubtle h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <button
          disabled={!selectedFile || isUploading}
          onClick={handleUpload}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Preparing Workspace...</span>
            </>
          ) : (
            <span>Start Subtitle Project</span>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-textMuted">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>100% Private local processing. No video uploaded to third-party cloud.</span>
        </div>
      </div>
    </div>
  );
}
