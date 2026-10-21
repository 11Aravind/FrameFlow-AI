import { SubtitleCue } from "../types.js";

/**
 * Parses an SRT timestamp format: HH:MM:SS,mmm into milliseconds.
 */
export function parseSrtTimestamp(ts: string): number {
  const match = ts.trim().match(/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/);
  if (!match) {
    throw new Error(`Invalid SRT timestamp: "${ts}"`);
  }
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  const millis = parseInt(match[4], 10);

  return (hours * 3600 + minutes * 60 + seconds) * 1000 + millis;
}

/**
 * Parse a raw SRT string into SubtitleCue objects.
 */
export function parseSrt(content: string): SubtitleCue[] {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawBlocks = normalized.split(/\n\n+/);
  const cues: SubtitleCue[] = [];

  for (const block of rawBlocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) continue;

    // Line 0 is usually the index number, or the timing line if index was omitted
    let timingLineIndex = 0;
    if (/^\d+$/.test(lines[0]) && lines.length >= 2) {
      timingLineIndex = 1;
    }

    const timingLine = lines[timingLineIndex];
    const timingMatch = timingLine.match(
      /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/
    );

    if (!timingMatch) {
      continue;
    }

    const startMs = parseSrtTimestamp(timingMatch[1]);
    const endMs = parseSrtTimestamp(timingMatch[2]);
    const textLines = lines.slice(timingLineIndex + 1);
    const text = textLines.join("\n");

    cues.push({
      id: `cue_${cues.length + 1}`,
      startMs,
      endMs,
      text,
    });
  }

  return cues;
}
