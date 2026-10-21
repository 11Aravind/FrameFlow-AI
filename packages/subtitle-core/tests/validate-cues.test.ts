import { describe, it, expect } from "vitest";
import { validateCues } from "../src/validate-cues.js";
import { SubtitleCue } from "../src/types.js";

describe("validateCues", () => {
  it("flags negative start time", () => {
    const cues: SubtitleCue[] = [
      { id: "c1", startMs: -500, endMs: 2000, text: "Negative start" },
    ];
    const issues = validateCues(cues);
    expect(issues.some((i) => i.type === "negative_start" && i.severity === "error")).toBe(true);
  });

  it("flags invalid order when endMs <= startMs", () => {
    const cues: SubtitleCue[] = [
      { id: "c1", startMs: 3000, endMs: 2000, text: "Reversed timing" },
    ];
    const issues = validateCues(cues);
    expect(issues.some((i) => i.type === "invalid_order" && i.severity === "error")).toBe(true);
  });

  it("flags cues exceeding video duration", () => {
    const cues: SubtitleCue[] = [
      { id: "c1", startMs: 1000, endMs: 15000, text: "Too long for video" },
    ];
    const issues = validateCues(cues, { videoDurationMs: 10000 });
    expect(issues.some((i) => i.type === "exceeds_duration" && i.severity === "error")).toBe(true);
  });

  it("detects overlaps between consecutive cues", () => {
    const cues: SubtitleCue[] = [
      { id: "c1", startMs: 1000, endMs: 5000, text: "First cue" },
      { id: "c2", startMs: 4000, endMs: 8000, text: "Overlapping cue" },
    ];
    const issues = validateCues(cues);
    expect(issues.some((i) => i.type === "overlap" && i.cueId === "c2")).toBe(true);
  });

  it("warns about empty subtitle text", () => {
    const cues: SubtitleCue[] = [
      { id: "c1", startMs: 1000, endMs: 2000, text: "   " },
    ];
    const issues = validateCues(cues);
    expect(issues.some((i) => i.type === "empty_text")).toBe(true);
  });

  it("passes valid non-overlapping cues without errors", () => {
    const cues: SubtitleCue[] = [
      { id: "c1", startMs: 1000, endMs: 3000, text: "First line" },
      { id: "c2", startMs: 3500, endMs: 5500, text: "Second line" },
    ];
    const issues = validateCues(cues, { videoDurationMs: 6000 });
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors.length).toBe(0);
  });
});
