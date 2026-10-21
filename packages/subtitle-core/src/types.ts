/**
 * Subtitle cue representation using integer milliseconds internally.
 */
export interface SubtitleCue {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  sourceSegmentIds?: string[];
  confidence?: number;
  edited?: boolean;
}

/**
 * Malayalam speech transcript segment.
 */
export interface TranscriptSegment {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  confidence?: number;
}

/**
 * Status of a subtitle project.
 */
export type ProjectStatus =
  | "uploaded"
  | "queued"
  | "extracting_audio"
  | "transcribing"
  | "awaiting_transcript_review"
  | "translating"
  | "building_subtitles"
  | "ready"
  | "failed"
  | "cancelled";

/**
 * Project metadata and payload state.
 */
export interface SubtitleProject {
  id: string;
  name: string;
  originalFileName: string;
  durationMs: number;
  sourceLanguage: "ml";
  targetLanguage: "en";
  status: ProjectStatus;
  transcript: TranscriptSegment[];
  subtitles: SubtitleCue[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Issue identified during cue validation.
 */
export interface CueValidationIssue {
  cueId: string;
  type: "negative_start" | "invalid_order" | "exceeds_duration" | "overlap" | "empty_text" | "too_short" | "too_long";
  message: string;
  severity: "error" | "warning";
}
