import { SubtitleCue, CueValidationIssue } from "./types.js";

export interface ValidationOptions {
  videoDurationMs?: number;
  minDurationMs?: number;
  maxDurationMs?: number;
}

/**
 * Validates a list of subtitle cues for timing, overlap, text content, and video bounds.
 */
export function validateCues(
  cues: SubtitleCue[],
  options: ValidationOptions = {}
): CueValidationIssue[] {
  const issues: CueValidationIssue[] = [];
  const minDuration = options.minDurationMs ?? 200;
  const maxDuration = options.maxDurationMs ?? 10000;

  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];

    // Check finite numbers
    if (!Number.isFinite(cue.startMs) || !Number.isFinite(cue.endMs)) {
      issues.push({
        cueId: cue.id,
        type: "invalid_order",
        message: `Cue ${cue.id} has invalid non-finite timestamp values.`,
        severity: "error",
      });
      continue;
    }

    // Check negative start
    if (cue.startMs < 0) {
      issues.push({
        cueId: cue.id,
        type: "negative_start",
        message: `Cue ${cue.id} start time (${cue.startMs}ms) cannot be negative.`,
        severity: "error",
      });
    }

    // Check start < end
    if (cue.endMs <= cue.startMs) {
      issues.push({
        cueId: cue.id,
        type: "invalid_order",
        message: `Cue ${cue.id} end time (${cue.endMs}ms) must be greater than start time (${cue.startMs}ms).`,
        severity: "error",
      });
    }

    // Check empty text
    if (!cue.text || cue.text.trim().length === 0) {
      issues.push({
        cueId: cue.id,
        type: "empty_text",
        message: `Cue ${cue.id} text is empty.`,
        severity: "warning",
      });
    }

    // Check bounds against video duration
    if (options.videoDurationMs !== undefined && options.videoDurationMs > 0) {
      if (cue.endMs > options.videoDurationMs) {
        issues.push({
          cueId: cue.id,
          type: "exceeds_duration",
          message: `Cue ${cue.id} ends at ${cue.endMs}ms, exceeding video duration of ${options.videoDurationMs}ms.`,
          severity: "error",
        });
      }
    }

    // Duration warnings
    const duration = cue.endMs - cue.startMs;
    if (duration > 0 && duration < minDuration) {
      issues.push({
        cueId: cue.id,
        type: "too_short",
        message: `Cue ${cue.id} is very short (${duration}ms < ${minDuration}ms) and may flash too quickly.`,
        severity: "warning",
      });
    } else if (duration > maxDuration) {
      issues.push({
        cueId: cue.id,
        type: "too_long",
        message: `Cue ${cue.id} is very long (${duration}ms > ${maxDuration}ms); consider splitting into multiple cues.`,
        severity: "warning",
      });
    }

    // Overlap detection with previous cue
    if (i > 0) {
      const prevCue = cues[i - 1];
      if (prevCue.endMs > cue.startMs) {
        issues.push({
          cueId: cue.id,
          type: "overlap",
          message: `Cue ${cue.id} starts at ${cue.startMs}ms before previous cue ${prevCue.id} ends at ${prevCue.endMs}ms (overlap of ${prevCue.endMs - cue.startMs}ms).`,
          severity: "warning",
        });
      }
    }
  }

  return issues;
}
