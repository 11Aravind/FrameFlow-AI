import { SubtitleCue } from "../types.js";

/**
 * Format milliseconds into standard WebVTT timestamp format: HH:MM:SS.mmm
 */
export function formatVttTimestamp(ms: number): string {
  if (ms < 0 || !Number.isFinite(ms)) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const milliseconds = Math.floor(ms % 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number, z = 2) => String(n).padStart(z, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
}

/**
 * Serialize an array of SubtitleCues to WebVTT (.vtt) string.
 */
export function serializeVtt(cues: SubtitleCue[]): string {
  const blocks: string[] = ["WEBVTT\n"];

  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    const index = i + 1;
    const timeRange = `${formatVttTimestamp(cue.startMs)} --> ${formatVttTimestamp(cue.endMs)}`;
    const text = cue.text.trim();
    blocks.push(`${index}\n${timeRange}\n${text}`);
  }

  return blocks.join("\n\n") + "\n";
}
