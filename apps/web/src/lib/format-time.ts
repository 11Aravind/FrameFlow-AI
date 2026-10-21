/**
 * Format milliseconds into MM:SS display
 */
export function formatDisplayTime(ms: number): string {
  if (ms < 0 || !Number.isFinite(ms)) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Format milliseconds into MM:SS.mmm display for precise subtitle editing
 */
export function formatPreciseTime(ms: number): string {
  if (ms < 0 || !Number.isFinite(ms)) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor(ms % 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}
