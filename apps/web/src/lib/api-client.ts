import { APP_CONFIG } from "./config";
import type { SubtitleProject, TranscriptSegment, SubtitleCue } from "@malayalam-subtitle/subtitle-core";

const BASE = APP_CONFIG.apiBaseUrl;

export interface HealthStatus {
  status: string;
  version: string;
  ffmpegAvailable: boolean;
  asrReady: boolean;
  translationReady: boolean;
}

export interface JobStatusResponse {
  id: string;
  projectId: string;
  type: string;
  status: string;
  progress: number;
  stageDescription: string;
  error?: string;
}

export const apiClient = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${BASE}/api/v1/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  async uploadVideo(file: File): Promise<{ project: SubtitleProject }> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE}/api/v1/projects`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "Upload failed");
    }

    return res.json();
  },

  async getProject(projectId: string): Promise<SubtitleProject> {
    const res = await fetch(`${BASE}/api/v1/projects/${projectId}`);
    if (!res.ok) throw new Error("Failed to load project");
    return res.json();
  },

  async updateTranscript(projectId: string, transcript: TranscriptSegment[]): Promise<SubtitleProject> {
    const res = await fetch(`${BASE}/api/v1/projects/${projectId}/transcript`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
    if (!res.ok) throw new Error("Failed to update transcript");
    return res.json();
  },

  async updateSubtitles(projectId: string, subtitles: SubtitleCue[]): Promise<SubtitleProject> {
    const res = await fetch(`${BASE}/api/v1/projects/${projectId}/subtitles`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtitles }),
    });
    if (!res.ok) throw new Error("Failed to update subtitles");
    return res.json();
  },

  async startTranscribe(projectId: string): Promise<JobStatusResponse> {
    const res = await fetch(`${BASE}/api/v1/projects/${projectId}/jobs/transcribe`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to start transcription job");
    return res.json();
  },

  async startTranslate(projectId: string): Promise<JobStatusResponse> {
    const res = await fetch(`${BASE}/api/v1/projects/${projectId}/jobs/translate`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to start translation job");
    return res.json();
  },

  async getJob(jobId: string): Promise<JobStatusResponse> {
    const res = await fetch(`${BASE}/api/v1/jobs/${jobId}`);
    if (!res.ok) throw new Error("Failed to fetch job status");
    return res.json();
  },

  getMediaUrl(projectId: string): string {
    return `${BASE}/api/v1/projects/${projectId}/media`;
  },

  getExportUrl(projectId: string, format: "srt" | "vtt"): string {
    return `${BASE}/api/v1/projects/${projectId}/export.${format}`;
  },
};
