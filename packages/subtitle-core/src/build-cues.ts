import { SubtitleCue, TranscriptSegment } from "./types.js";

export interface CueBuildingOptions {
  maxCharsPerLine?: number;
  maxLines?: number;
  minDurationMs?: number;
  maxDurationMs?: number;
  gapMs?: number;
}

/**
 * Split a sentence into lines respecting maximum line length without breaking words.
 */
export function formatCueLines(text: string, maxCharsPerLine = 37, maxLines = 2): string {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxCharsPerLine) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  // If lines exceed maxLines, join excess into the last line
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines - 1);
    kept.push(lines.slice(maxLines - 1).join(" "));
    return kept.join("\n");
  }

  return lines.join("\n");
}

/**
 * Builds subtitle cues from transcript segments with translated English text.
 */
export function buildCuesFromSegments(
  segments: { id: string; startMs: number; endMs: number; text: string; confidence?: number }[],
  options: CueBuildingOptions = {}
): SubtitleCue[] {
  const maxChars = options.maxCharsPerLine ?? 42;
  const maxLines = options.maxLines ?? 2;
  const cues: SubtitleCue[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const formattedText = formatCueLines(seg.text, maxChars, maxLines);
    let startMs = Math.max(0, seg.startMs);
    let endMs = Math.max(startMs + 500, seg.endMs);

    // Apply minimum gap from previous cue
    if (i > 0 && options.gapMs) {
      const prevCue = cues[i - 1];
      if (startMs < prevCue.endMs + options.gapMs) {
        startMs = prevCue.endMs + options.gapMs;
        if (endMs <= startMs) {
          endMs = startMs + 500;
        }
      }
    }

    cues.push({
      id: `cue_${i + 1}`,
      startMs,
      endMs,
      text: formattedText,
      sourceSegmentIds: [seg.id],
      confidence: seg.confidence,
    });
  }

  return cues;
}
