import { SubtitleCue } from "../types.js";

/**
 * Parses a WebVTT timestamp format: [HH:]MM:SS.mmm into milliseconds.
 */
export function parseVttTimestamp(ts: string): number {
  const clean = ts.trim();
  const threePartMatch = clean.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
  if (threePartMatch) {
    const hours = parseInt(threePartMatch[1], 10);
    const minutes = parseInt(threePartMatch[2], 10);
    const seconds = parseInt(threePartMatch[3], 10);
    const millis = parseInt(threePartMatch[4], 10);
    return (hours * 3600 + minutes * 60 + seconds) * 1000 + millis;
  }

  const twoPartMatch = clean.match(/^(\d{2}):(\d{2})\.(\d{3})$/);
  if (twoPartMatch) {
    const minutes = parseInt(twoPartMatch[1], 10);
    const seconds = parseInt(twoPartMatch[2], 10);
    const millis = parseInt(twoPartMatch[3], 10);
    return (minutes * 60 + seconds) * 1000 + millis;
  }

  throw new Error(`Invalid WebVTT timestamp: "${ts}"`);
}

/**
 * Parse a raw WebVTT string into SubtitleCue objects.
 */
export function parseVtt(content: string): SubtitleCue[] {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawBlocks = normalized.split(/\n\n+/);
  const cues: SubtitleCue[] = [];

  for (const block of rawBlocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) continue;

    // Skip WEBVTT header block
    if (lines[0].startsWith("WEBVTT")) {
      continue;
    }

    let timingLineIndex = 0;
    // Check if line 0 is a cue identifier
    if (!lines[0].includes("-->") && lines.length >= 2 && lines[1].includes("-->")) {
      timingLineIndex = 1;
    }

    const timingLine = lines[timingLineIndex];
    if (!timingLine || !timingLine.includes("-->")) {
      continue;
    }

    const timingMatch = timingLine.match(
      /((?:\d{2}:)?\d{2}:\d{2}\.\d{3})\s*-->\s*((?:\d{2}:)?\d{2}:\d{2}\.\d{3})/
    );

    if (!timingMatch) {
      continue;
    }

    const startMs = parseVttTimestamp(timingMatch[1]);
    const endMs = parseVttTimestamp(timingMatch[2]);
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
