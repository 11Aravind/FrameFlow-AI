"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { VideoPlayer } from "@/features/video-player/VideoPlayer";
import { SubtitleListEditor } from "@/features/subtitle-editor/SubtitleListEditor";
import { TranscriptReviewPanel } from "@/features/transcript/TranscriptReviewPanel";
import { VisualTimeline } from "@/features/timeline/VisualTimeline";
import { ExportModal } from "@/features/export/ExportModal";
import { apiClient } from "@/lib/api-client";
import type { SubtitleProject, SubtitleCue, TranscriptSegment } from "@malayalam-subtitle/subtitle-core";
import { Download, Save, Loader2, ArrowLeft, Mic, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

// Clearly identified mock data for Phase 1 scaffolding / demo preview
const MOCK_DEMO_PROJECT: SubtitleProject = {
  id: "demo",
  name: "kerala_organic_farming_sample.mp4",
  originalFileName: "kerala_organic_farming_sample.mp4",
  durationMs: 22000,
  sourceLanguage: "ml",
  targetLanguage: "en",
  status: "ready",
  transcript: [
    {
      id: "seg_1",
      startMs: 1000,
      endMs: 5000,
      text: "ഞങ്ങൾ ഇന്ന് ജൈവ കൃഷിയെക്കുറിച്ചാണ് സംസാരിക്കുന്നത്.",
      confidence: 0.94,
    },
    {
      id: "seg_2",
      startMs: 5500,
      endMs: 11000,
      text: "പച്ചക്കറികൾക്ക് കീടനാശിനികൾ ഇല്ലാതെ തന്നെ നല്ല വിളവ് ലഭിക്കും.",
      confidence: 0.91,
    },
    {
      id: "seg_3",
      startMs: 11800,
      endMs: 16500,
      text: "വേപ്പിൻ പിണ്ണാക്കും ചാണകപ്പൊടിയും ചേർത്താണ് ഈ വളക്കൂട്ട് ഉണ്ടാക്കുന്നത്.",
      confidence: 0.88,
    },
    {
      id: "seg_4",
      startMs: 17200,
      endMs: 21500,
      text: "ഇത് മണ്ണിന്റെ ഫലഭൂയിഷ്ഠത കൂട്ടാൻ സഹായിക്കുന്നു.",
      confidence: 0.96,
    },
  ],
  subtitles: [
    {
      id: "cue_1",
      startMs: 1000,
      endMs: 5000,
      text: "Today we are discussing organic farming practices.",
      sourceSegmentIds: ["seg_1"],
    },
    {
      id: "cue_2",
      startMs: 5500,
      endMs: 11000,
      text: "Vegetables can yield well even without chemical pesticides.",
      sourceSegmentIds: ["seg_2"],
    },
    {
      id: "cue_3",
      startMs: 11800,
      endMs: 16500,
      text: "This fertilizer mix is made of neem cake and cow dung powder.",
      sourceSegmentIds: ["seg_3"],
    },
    {
      id: "cue_4",
      startMs: 17200,
      endMs: 21500,
      text: "This greatly helps improve soil fertility and health.",
      sourceSegmentIds: ["seg_4"],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function ProjectEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.projectId as string) || "demo";
  const isDemo = projectId === "demo";

  const [project, setProject] = useState<SubtitleProject>(MOCK_DEMO_PROJECT);
  const [loading, setLoading] = useState(!isDemo);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [seekTargetMs, setSeekTargetMs] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"subtitles" | "transcript">("transcript");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Background Job States
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [jobStage, setJobStage] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  async function loadData() {
    if (isDemo) {
      setProject(MOCK_DEMO_PROJECT);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiClient.getProject(projectId);
      setProject(data);
      // If project already has subtitles, open subtitles tab; otherwise open transcript tab
      if (data.subtitles && data.subtitles.length > 0) {
        setActiveTab("subtitles");
      } else {
        setActiveTab("transcript");
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [projectId, isDemo]);

  // Polling helper for background jobs
  function startPollingJob(jobId: string, onComplete: () => void) {
    setActiveJobId(jobId);
    setJobError(null);

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const job = await apiClient.getJob(jobId);
        setJobStatus(job.status);
        setJobStage(job.stageDescription);

        if (job.status === "completed") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setActiveJobId(null);
          onComplete();
        } else if (job.status === "failed") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setActiveJobId(null);
          setJobError(job.error || "Processing failed.");
        }
      } catch (err: any) {
        console.error("Job poll error:", err);
      }
    }, 1500);
  }

  async function handleStartTranscription() {
    if (isDemo) return;

    setJobError(null);
    setJobStage("Queuing audio transcription...");
    try {
      const job = await apiClient.startTranscribe(projectId);
      startPollingJob(job.id, async () => {
        const updated = await apiClient.getProject(projectId);
        setProject(updated);
        setActiveTab("transcript");
      });
    } catch (err: any) {
      setJobError(err.message || "Failed to trigger transcription.");
    }
  }

  async function handleStartTranslation() {
    if (isDemo) return;

    setJobError(null);
    setJobStage("Queuing English translation...");
    try {
      const job = await apiClient.startTranslate(projectId);
      startPollingJob(job.id, async () => {
        const updated = await apiClient.getProject(projectId);
        setProject(updated);
        setActiveTab("subtitles");
      });
    } catch (err: any) {
      setJobError(err.message || "Failed to trigger translation.");
    }
  }

  // Active subtitle cue during playback
  const activeCue =
    project.subtitles.find(
      (cue) => currentTimeMs >= cue.startMs && currentTimeMs <= cue.endMs
    ) || null;

  function handleSeek(ms: number) {
    setSeekTargetMs(ms);
    setCurrentTimeMs(ms);
  }

  function handleUpdateCue(cueId: string, updates: Partial<SubtitleCue>) {
    setProject((prev) => ({
      ...prev,
      subtitles: prev.subtitles.map((c) => (c.id === cueId ? { ...c, ...updates } : c)),
    }));
    setHasUnsavedChanges(true);
  }

  function handleAddCue(afterIndex: number) {
    const prevCue = project.subtitles[afterIndex];
    const newStart = prevCue ? prevCue.endMs + 100 : currentTimeMs;
    const newEnd = newStart + 3000;

    const newCue: SubtitleCue = {
      id: `cue_${Date.now()}`,
      startMs: newStart,
      endMs: newEnd,
      text: "New subtitle line",
      edited: true,
    };

    const nextCues = [...project.subtitles];
    nextCues.splice(afterIndex + 1, 0, newCue);

    setProject((prev) => ({ ...prev, subtitles: nextCues }));
    setHasUnsavedChanges(true);
  }

  function handleDeleteCue(cueId: string) {
    setProject((prev) => ({
      ...prev,
      subtitles: prev.subtitles.filter((c) => c.id !== cueId),
    }));
    setHasUnsavedChanges(true);
  }

  function handleUpdateTranscriptSegment(segmentId: string, text: string) {
    setProject((prev) => ({
      ...prev,
      transcript: prev.transcript.map((s) => (s.id === segmentId ? { ...s, text } : s)),
    }));
    setHasUnsavedChanges(true);
  }

  async function handleSave() {
    if (isDemo) {
      setHasUnsavedChanges(false);
      return;
    }

    try {
      setIsSaving(true);
      await apiClient.updateSubtitles(projectId, project.subtitles);
      await apiClient.updateTranscript(projectId, project.transcript);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-textSecondary gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        <p className="text-sm">Loading project workspace...</p>
      </div>
    );
  }

  const isTranscribing = activeJobId !== null && jobStage?.includes("Transcribing");
  const isTranslating = activeJobId !== null && jobStage?.includes("Translating");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        projectName={project.name}
        statusBadge={
          isDemo ? (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Demo Preview Scaffolding
            </span>
          ) : (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-mono uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-800/60">
              {project.status.replace("_", " ")}
            </span>
          )
        }
        rightActions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surfaceSubtle border border-surfaceBorder hover:border-slate-700 text-textSecondary hover:text-textPrimary disabled:opacity-40 transition"
              title="Save changes"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{hasUnsavedChanges ? "Save" : "Saved"}</span>
            </button>

            <button
              onClick={() => setIsExportOpen(true)}
              disabled={project.subtitles.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        }
      />

      {/* Editor Body */}
      <main className="flex-1 p-3 sm:p-4 max-w-7xl mx-auto w-full flex flex-col gap-3">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-textMuted hover:text-textPrimary transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Upload</span>
          </Link>

          {isDemo && (
            <span className="text-[11px] text-textMuted">
              Demonstrating synchronized cue overlay, Malayalam review & timeline.
            </span>
          )}
        </div>

        {/* Action Banner when transcript is empty */}
        {project.transcript.length === 0 && !isDemo && (
          <div className="p-4 rounded-xl bg-surface border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-textPrimary">
                  Step 1: Extract & Transcribe Malayalam Speech
                </h4>
                <p className="text-xs text-textSecondary mt-0.5">
                  Audio must be extracted and transcribed before subtitles can be generated.
                </p>
              </div>
            </div>

            <button
              onClick={handleStartTranscription}
              disabled={activeJobId !== null}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:opacity-40 transition flex items-center gap-2 shadow-lg shadow-emerald-500/10 flex-shrink-0"
            >
              {activeJobId ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Transcribe Malayalam Audio</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Active Stage or Error Feedback */}
        {activeJobId && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-300">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400 flex-shrink-0" />
            <span>{jobStage || "Processing video..."}</span>
          </div>
        )}

        {jobError && (
          <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 flex items-start justify-between gap-2.5 text-xs text-red-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Processing Alert</p>
                <p className="text-textSecondary mt-1 leading-relaxed">{jobError}</p>
              </div>
            </div>

            <button
              onClick={handleStartTranscription}
              className="px-2.5 py-1 rounded bg-surface border border-red-800 text-red-300 hover:bg-surfaceSubtle transition flex items-center gap-1 flex-shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Left Column: Video & Visual Timeline */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <VideoPlayer
              src={isDemo ? "" : apiClient.getMediaUrl(projectId)}
              activeCue={activeCue}
              onTimeUpdate={(ms) => setCurrentTimeMs(ms)}
              seekToMs={seekTargetMs}
            />

            <VisualTimeline
              durationMs={project.durationMs || 10000}
              currentTimeMs={currentTimeMs}
              cues={project.subtitles}
              activeCueId={activeCue?.id}
              onSeek={handleSeek}
            />
          </div>

          {/* Right Column: Tabbed Panels (Transcript / Subtitles) */}
          <div className="lg:col-span-5 flex flex-col h-[520px] lg:h-auto">
            {/* Panel Switcher Tabs */}
            <div className="flex rounded-xl bg-surface p-1 border border-surfaceBorder mb-2.5">
              <button
                onClick={() => setActiveTab("transcript")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === "transcript"
                    ? "bg-surfaceSubtle text-emerald-400 shadow"
                    : "text-textMuted hover:text-textSecondary"
                }`}
              >
                Malayalam Review ({project.transcript.length})
              </button>
              <button
                onClick={() => setActiveTab("subtitles")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === "subtitles"
                    ? "bg-surfaceSubtle text-emerald-400 shadow"
                    : "text-textMuted hover:text-textSecondary"
                }`}
              >
                English Subtitles ({project.subtitles.length})
              </button>
            </div>

            {/* Active Panel */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "transcript" ? (
                <TranscriptReviewPanel
                  transcript={project.transcript}
                  onUpdateSegment={handleUpdateTranscriptSegment}
                  onTranslate={handleStartTranslation}
                  isTranslating={isTranslating}
                  onSeek={handleSeek}
                />
              ) : (
                <SubtitleListEditor
                  cues={project.subtitles}
                  activeCueId={activeCue?.id}
                  onUpdateCue={handleUpdateCue}
                  onAddCue={handleAddCue}
                  onDeleteCue={handleDeleteCue}
                  onSeek={handleSeek}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Export Modal */}
      <ExportModal
        cues={project.subtitles}
        projectName={project.name}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
