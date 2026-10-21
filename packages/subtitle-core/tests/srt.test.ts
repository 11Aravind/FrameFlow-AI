import { describe, it, expect } from "vitest";
import { formatSrtTimestamp, parseSrtTimestamp, serializeSrt, parseSrt } from "../src/srt/index.js";
import { SubtitleCue } from "../src/types.js";

describe("SRT Timestamps and Serialization", () => {
  it("formats zero and boundary timestamps correctly", () => {
    expect(formatSrtTimestamp(0)).toBe("00:00:00,000");
    expect(formatSrtTimestamp(500)).toBe("00:00:00,500");
    expect(formatSrtTimestamp(61234)).toBe("00:01:01,234");
    expect(formatSrtTimestamp(3661005)).toBe("01:01:01,005");
  });

  it("parses SRT timestamps back to accurate milliseconds", () => {
    expect(parseSrtTimestamp("00:00:00,000")).toBe(0);
    expect(parseSrtTimestamp("00:00:01,500")).toBe(1500);
    expect(parseSrtTimestamp("01:02:03,456")).toBe((1 * 3600 + 2 * 60 + 3) * 1000 + 456);
  });

  it("performs a round trip serialize and parse with Unicode Malayalam & English", () => {
    const originalCues: SubtitleCue[] = [
      {
        id: "cue_1",
        startMs: 1000,
        endMs: 4000,
        text: "ഇത് ജൈവ വളമാണ്.\nThis is organic fertilizer.",
      },
      {
        id: "cue_2",
        startMs: 4500,
        endMs: 8200,
        text: "We should spray it on the leaves.",
      },
    ];

    const srtOutput = serializeSrt(originalCues);
    expect(srtOutput).toContain("00:00:01,000 --> 00:00:04,000");
    expect(srtOutput).toContain("ഇത് ജൈവ വളമാണ്.");

    const parsedCues = parseSrt(srtOutput);
    expect(parsedCues.length).toBe(2);
    expect(parsedCues[0].startMs).toBe(1000);
    expect(parsedCues[0].endMs).toBe(4000);
    expect(parsedCues[0].text).toBe("ഇത് ജൈവ വളമാണ്.\nThis is organic fertilizer.");
    expect(parsedCues[1].startMs).toBe(4500);
    expect(parsedCues[1].endMs).toBe(8200);
  });
});
