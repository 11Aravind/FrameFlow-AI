# Testing Strategy & Verification Guide

This document outlines the testing architecture, unit test suites, backend verification, and end-to-end acceptance checks for **Malayalam Subtitle AI**.

---

## 1. Unit Testing: `@malayalam-subtitle/subtitle-core`

The core subtitle package is framework-independent and tested using **Vitest**.

### Executing Tests
```bash
pnpm --filter subtitle-core test
```

### Coverage
- **`tests/validate-cues.test.ts`**:
  - Verification of non-finite and negative millisecond timestamps.
  - Strict ordering check (`endMs > startMs`).
  - Video duration boundary enforcement.
  - Overlap detection between consecutive subtitle cues.
  - Empty text detection.
- **`tests/srt.test.ts`**:
  - Millisecond-to-SRT timestamp formatting (`HH:MM:SS,mmm`).
  - Parsing loose and standard SRT timestamps.
  - Unicode round-trip testing preserving Malayalam glyphs (` chillaksharangal`) and English translations.
- **`tests/vtt.test.ts`**:
  - Millisecond-to-VTT timestamp formatting (`HH:MM:SS.mmm`).
  - WebVTT header and cue serializing.
  - Parsing standard and 2-part timestamps.

---

## 2. Backend Testing: Python FastAPI Processor

The processing service is tested using **pytest** and **pytest-asyncio** with HTTPX test clients.

### Executing Tests
```powershell
cd services/processor
.\.venv\Scripts\python.exe -m pytest tests
```

### Coverage
- **`tests/test_health.py`**:
  - Health check endpoint `/api/v1/health` returning `healthy`, version, and dynamic `ffmpegAvailable` status.
- **`tests/test_schemas.py`**:
  - Pydantic v2 validation for `SubtitleCue`, `TranscriptSegment`, and `SubtitleProject`.
  - Negative timestamp validation and project state constraints.

---

## 3. Frontend & Build Validation

### Typecheck
```bash
pnpm typecheck
```
Ensures strict TypeScript compilation across the Next.js frontend (`apps/web`) and the subtitle core library.

### Next.js Production Build
```bash
pnpm --filter web build
```
Validates route generation, server component compilation, code splitting (keeping initial page bundle at ~3.3 kB), and zero missing dependencies.

---

## 4. End-to-End Acceptance Workflow

1. Start both services using `scripts/dev.ps1` (or in separate terminals).
2. Visit `http://localhost:3000` (or `http://localhost:3005`).
3. Observe the "Local Core" status badge in the navbar indicating FastAPI and FFmpeg are connected.
4. Upload an MP4 video or explore the `/projects/demo` preview.
5. Review Malayalam transcript segments and adjust any terminology.
6. Translate to English subtitles, review active cues in playback, and inspect the visual timeline.
7. Click "Export" to download verified `.srt` or `.vtt` subtitle files.
