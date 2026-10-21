import { describe, it, expect } from "vitest";
import { formatVttTimestamp, parseVttTimestamp, serializeVtt, parseVtt } from "../src/vtt/index.js";
import { SubtitleCue } from "../src/types.js";

describe("WebVTT Timestamps and Serialization", () => {
  it("formats VTT timestamps with period separator", () => {
    expect(formatVttTimestamp(0)).toBe("00:00:00.000");
    expect(formatVttTimestamp(1500)).toBe("00:00:01.500");
    expect(formatVttTimestamp(73849)).toBe("00:01:13.849");
  });

  it("parses WebVTT standard and 2-part timestamps", () => {
    expect(parseVttTimestamp("00:00:00.000")).toBe(0);
    expect(parseVttTimestamp("00:01:05.250")).toBe(65250);
    expect(parseVttTimestamp("01:05.250")).toBe(65250);
  });

  it("performs a round trip serialize and parse for WebVTT", () => {
    const originalCues: SubtitleCue[] = [
      {
        id: "cue_1",
        startMs: 250,
        endMs: 3750,
        text: "കർഷകർക്ക് ഉപകാരപ്രദമായ സാങ്കേതികവിദ്യ.\nBeneficial technology for farmers.",
      },
    ];

    const vttOutput = serializeVtt(originalCues);
    expect(vttOutput.startsWith("WEBVTT")).toBe(true);
    expect(vttOutput).toContain("00:00:00.250 --> 00:00:03.750");

    const parsed = parseVtt(vttOutput);
    expect(parsed.length).toBe(1);
    expect(parsed[0].startMs).toBe(250);
    expect(parsed[0].endMs).toBe(3750);
    expect(parsed[0].text).toBe(
      "കർഷകർക്ക് ഉപകാരപ്രദമായ സാങ്കേതികവിദ്യ.\nBeneficial technology for farmers."
    );
  });
});
