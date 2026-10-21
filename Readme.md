# Malayalam Subtitle AI
## Product Requirements, Architecture & Implementation Guide

**Coding agent:** Antigravity  
**Product:** Web-first Malayalam speech to English subtitle editor  
**Cost goal:** No mandatory paid APIs; prefer open-source models and local processing.  
**Future:** Reuse the core logic for a desktop app, potentially using Tauri 2.

---

## 1. Product Vision

Build a polished web application where a user uploads a Malayalam-speaking farming video and the app:

1. Extracts the audio.
2. Transcribes Malayalam speech.
3. Lets the user review and correct the Malayalam transcript.
4. Translates it into natural English while preserving meaning and farming terminology.
5. Creates readable subtitle cues with timestamps aligned to the spoken content.
6. Shows subtitles synchronized with video playback.
7. Allows text and timing edits.
8. Exports valid `.srt` and `.vtt` files.

The application must be useful even when no paid AI API key is configured. Prefer local processing for the MVP, subject to available hardware.

### Product principles

- Accuracy and clear error messages matter more than pretending every result is perfect.
- Keep speech recognition, translation, alignment, cue generation, and media processing replaceable.
- Do not silently invent speech that was not recognized.
- Preserve the Malayalam transcript so the user can verify the English translation.
- Do not load an entire large video into JavaScript memory.
- Do not expose user videos publicly.
- Keep subtitle logic framework-independent so a desktop client can reuse it later.
- Do not run destructive commands, overwrite unrelated files, or execute database migrations automatically.

## 2. Scope

### MVP — required

- Responsive website.
- Video upload with validation and progress.
- MP4 support first; add more formats only after testing.
- Video metadata and preview.
- Audio extraction using FFmpeg.
- Malayalam speech-to-text using a configurable open-source provider/model.
- Transcript segments with timestamps and confidence where available.
- English translation using a replaceable provider interface.
- Subtitle cue generation and timing validation.
- Editable Malayalam transcript and English subtitle cues.
- Synchronized video preview and active cue highlighting.
- Subtitle list and a basic visual timeline.
- Manual start/end time editing.
- SRT and WebVTT export.
- Progress/status, useful errors, retry, and cancellation where feasible.
- Unit and integration tests.
- Setup documentation and known limitations.

### Not in the initial MVP

- User accounts, payments, subscriptions, teams, or SaaS administration.
- Mandatory cloud AI processing.
- Public video sharing.
- Mobile app or desktop app.
- Automatic social publishing.
- Guaranteed perfect transcription or translation.
- Permanent subtitle burn-in. This may be added after the core workflow works.
- Mandatory database or Supabase dependency.

### Future roadmap

- Subtitle font, size, color, outline, position, and background controls.
- Burn subtitles into a new video with FFmpeg.
- Project persistence and recovery.
- Optional cloud storage/processing adapters.
- Farming terminology dictionary and reusable corrections.
- YouTube, Instagram Reels, and Shorts export presets.
- Desktop shell, preferably evaluate Tauri 2 after the web MVP is stable.
- Optional word-level highlighting if alignment quality supports it.

## 3. Free and Open-source Strategy

Use provider interfaces rather than locking the app to one vendor/model.

| Need | Candidate | Important notes |
|---|---|---|
| Web | Next.js, React, TypeScript | Web-first application |
| UI | Tailwind CSS and accessible component primitives | Build a purpose-designed editor, not a generic dashboard |
| Speech recognition | OpenAI Whisper implementation or a tested Malayalam-tuned Whisper/WhisperX model | Test on real Kerala Malayalam audio before choosing the default |
| Alignment | WhisperX or another aligner | Verify Malayalam support and model compatibility; do not assume it works equally well for every language |
| Translation | Local multilingual translation model selected after testing | Must not require a paid API |
| Media processing | FFmpeg | Check the selected build's licensing and distribution obligations |
| Python API | FastAPI | Local processing service |
| Validation | Pydantic and Zod | Validate data at service boundaries |
| Tests | pytest and Vitest | Backend and TypeScript tests |
| Monorepo | pnpm workspaces | Shared packages and consistent scripts |
| Future desktop | Tauri 2 | Evaluate packaging and platform requirements later |

### Repositories and references to evaluate

These are candidates for investigation, not automatic endorsements. Check current code licenses, model-weight licenses, compatibility, and commercial-use conditions before use.

- Whisper: https://github.com/openai/whisper
- WhisperX: https://github.com/m-bain/whisperX
- FFmpeg: https://ffmpeg.org/
- Subtitle Edit: https://github.com/SubtitleEdit/subtitleedit
- Tauri: https://tauri.app/

Before integrating any third-party code or model:

1. Check the current official repository and license.
2. Check model weights separately from source-code licensing.
3. Check commercial use, redistribution, attribution, and bundled-binary conditions.
4. Record version, source, license, hardware needs, and decision in `docs/OPEN_SOURCE_COMPONENTS.md`.
5. Do not copy substantial code from another project without license review and attribution.
6. Prefer documented libraries and clean adapters over cloning an entire editor.

### Cost expectations

- Local inference avoids per-request API charges but uses CPU/GPU, RAM, disk, electricity, and setup time.
- Free hosted quotas can change; do not assume they are permanent.
- Long-running workers and large uploads may exceed free hosting limits.
- The local MVP must not require a paid API key.
- If a local translation model is too slow or inaccurate on the available machine, document the trade-off and keep an optional provider interface. Do not silently add a paid dependency.

## 4. Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    Next.js Web UI                       │
│ Upload • Project • Player • Cue Editor • Timeline       │
└───────────────────────────┬─────────────────────────────┘
                            │ typed HTTP API
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 Python FastAPI Service                  │
│ Jobs • Validation • Progress • Cancellation • Results   │
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
                ▼                     ▼
┌──────────────────────────┐  ┌───────────────────────────┐
│ Media Processing Adapter │  │ AI Provider Interfaces    │
│ FFmpeg • audio extraction│  │ ASR • translation • align │
└──────────────┬───────────┘  └──────────────┬────────────┘
               └──────────────┬──────────────┘
                              ▼
┌─────────────────────────────────────────────────────────┐
│               Shared Subtitle Core                     │
│ Types • cue rules • timing validation • SRT • VTT       │
└───────────────────────────┬─────────────────────────────┘
                            ▼
                Private project/result files
```

### Architecture rules

- The web app must not load ML models directly.
- Keep the API contract typed and documented.
- Keep AI providers replaceable behind interfaces.
- Keep subtitle formatting and timing validation independent of React and FastAPI.
- Store large media files on disk in the local MVP; return metadata/references rather than file bytes in JSON.
- Use generated project IDs and safe per-project temporary directories.
- Never trust a client-supplied filename or path as a filesystem path.
- Configure upload size and duration limits.
- Call FFmpeg with safe argument arrays; never concatenate untrusted input into shell commands.
- Bind the local processing service to localhost by default and protect it against unintended cross-origin requests.
- Define cleanup behavior for temporary files.
- Avoid a database until persistence requirements justify it.

### Processing pipeline

1. Validate upload and file contents.
2. Save to a private project workspace.
3. Inspect metadata using FFprobe.
4. Extract normalized audio using FFmpeg.
5. Run Malayalam speech recognition.
6. Normalize transcript segments while preserving source text and timing.
7. Let the user review/correct the Malayalam transcript.
8. Translate the confirmed transcript to English.
9. Build readable subtitle cues.
10. Validate cue timing and readability.
11. Show synchronized editor preview.
12. Export SRT/VTT.
13. Clean temporary artifacts according to configured retention rules.

Do not divide video duration evenly among translated sentences. Translation changes sentence length. Use speech timing evidence, segment references, and editable cue boundaries.

## 5. Monorepo Folder Structure

Use a pnpm workspace monorepo with a web app, a Python processing service, and a framework-independent subtitle core.

```text
malayalam-subtitle-ai/
├── apps/
│   └── web/
│       ├── public/
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx
│       │   │   ├── layout.tsx
│       │   │   ├── upload/page.tsx
│       │   │   ├── projects/[projectId]/page.tsx
│       │   │   └── api/                  # thin proxy routes only if needed
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   ├── layout/
│       │   │   └── feedback/
│       │   ├── features/
│       │   │   ├── upload/
│       │   │   ├── project/
│       │   │   ├── video-player/
│       │   │   ├── transcript/
│       │   │   ├── subtitle-editor/
│       │   │   ├── timeline/
│       │   │   └── export/
│       │   ├── hooks/
│       │   ├── lib/
│       │   │   ├── api-client.ts
│       │   │   ├── config.ts
│       │   │   └── format-time.ts
│       │   ├── styles/
│       │   └── tests/
│       ├── package.json
│       └── tsconfig.json
├── services/
│   └── processor/
│       ├── app/
│       │   ├── main.py
│       │   ├── api/
│       │   │   ├── routes_health.py
│       │   │   ├── routes_uploads.py
│       │   │   ├── routes_jobs.py
│       │   │   ├── routes_projects.py
│       │   │   └── routes_exports.py
│       │   ├── core/
│       │   │   ├── config.py
│       │   │   ├── logging.py
│       │   │   ├── errors.py
│       │   │   └── security.py
│       │   ├── schemas/
│       │   │   ├── jobs.py
│       │   │   ├── projects.py
│       │   │   ├── transcript.py
│       │   │   └── subtitles.py
│       │   ├── services/
│       │   │   ├── media_service.py
│       │   │   ├── job_service.py
│       │   │   ├── transcription_service.py
│       │   │   ├── translation_service.py
│       │   │   ├── alignment_service.py
│       │   │   └── export_service.py
│       │   ├── providers/
│       │   │   ├── asr/base.py
│       │   │   ├── asr/whisper_provider.py
│       │   │   ├── translation/base.py
│       │   │   ├── translation/local_provider.py
│       │   │   ├── alignment/base.py
│       │   │   └── alignment/default_aligner.py
│       │   ├── repositories/local_project_repository.py
│       │   └── workers/processing_worker.py
│       ├── tests/
│       ├── requirements.txt
│       └── pyproject.toml
├── packages/
│   └── subtitle-core/
│       ├── src/
│       │   ├── types.ts
│       │   ├── validate-cues.ts
│       │   ├── build-cues.ts
│       │   ├── srt/parse.ts
│       │   ├── srt/serialize.ts
│       │   ├── vtt/parse.ts
│       │   ├── vtt/serialize.ts
│       │   └── index.ts
│       ├── tests/
│       └── package.json
├── fixtures/
│   ├── README.md
│   └── expected-subtitle-samples/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── OPEN_SOURCE_COMPONENTS.md
│   ├── MODEL_EVALUATION.md
│   ├── TESTING.md
│   └── DESKTOP_ROADMAP.md
├── scripts/
│   ├── dev.sh
│   ├── check-prerequisites.sh
│   └── cleanup-local-data.sh
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── README.md
└── LICENSE
```

Adjust the structure only when there is a documented technical reason. Avoid empty abstractions that add no value; implement the smallest useful version of each module.

## 6. Data Contracts

Use integer milliseconds internally. Convert to SRT/VTT timestamps only in serialization functions.

### Subtitle cue

```ts
export interface SubtitleCue {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  sourceSegmentIds?: string[];
  confidence?: number;
  edited?: boolean;
}
```

### Transcript segment

```ts
export interface TranscriptSegment {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  confidence?: number;
}
```

### Project metadata

```ts
export interface SubtitleProject {
  id: string;
  name: string;
  originalFileName: string;
  durationMs: number;
  sourceLanguage: "ml";
  targetLanguage: "en";
  status:
    | "uploaded"
    | "queued"
    | "extracting_audio"
    | "transcribing"
    | "awaiting_transcript_review"
    | "translating"
    | "building_subtitles"
    | "ready"
    | "failed"
    | "cancelled";
  transcript: TranscriptSegment[];
  subtitles: SubtitleCue[];
  createdAt: string;
  updatedAt: string;
}
```

Validate finite timestamps, `startMs >= 0`, `endMs > startMs`, and duration bounds. Detect unintended overlaps but do not blindly remove legitimate overlapping speech. Keep data contracts versionable.

## 7. API Contract

Prefix endpoints with `/api/v1`. Validate all requests and return structured errors.

### Health

- `GET /api/v1/health`
- Return service status, version, FFmpeg availability, and selected model readiness. Do not expose secrets or full filesystem paths.

### Upload and projects

- `POST /api/v1/projects` — multipart upload; validate type, size, duration policy, and filename; return project ID and metadata.
- `GET /api/v1/projects/{project_id}` — metadata and current state.
- `GET /api/v1/projects/{project_id}/media` — safe media serving for preview, with byte-range support if feasible.
- `DELETE /api/v1/projects/{project_id}` — delete only after explicit user action.

### Jobs

- `POST /api/v1/projects/{project_id}/jobs/transcribe`
- `POST /api/v1/projects/{project_id}/jobs/translate`
- `POST /api/v1/projects/{project_id}/jobs/generate-subtitles`
- `GET /api/v1/jobs/{job_id}`
- `POST /api/v1/jobs/{job_id}/cancel`

Long tasks must not block request handling. For the local MVP, a simple job runner may be sufficient. Document restart behavior. Do not add Redis or a complex queue unless demonstrated needs justify it.

### Editing and export

- `PATCH /api/v1/projects/{project_id}/transcript`
- `PATCH /api/v1/projects/{project_id}/subtitles`
- `GET /api/v1/projects/{project_id}/export.srt`
- `GET /api/v1/projects/{project_id}/export.vtt`

Document examples in `docs/API.md`.

## 8. Subtitle Quality Rules

- Prefer short, readable phrases rather than one long paragraph.
- Aim for one or two lines per cue.
- Avoid unnatural phrase breaks.
- Avoid extremely brief flashes and overly long static cues.
- Keep cue times within the video duration.
- Avoid unintended overlaps.
- Do not show a future sentence before it is spoken.
- Preserve farming terminology, names, quantities, and units.
- Use natural English punctuation.
- Let users edit every cue and timing.
- Display uncertainty or review-needed indicators where supported.
- Use speech timestamps as evidence; translation may require cue regrouping and manual adjustment.
- Do not promise perfect word-level synchronization until tested on real Malayalam videos.

Treat readability limits as configurable defaults, not universal constants.

## 9. UI/UX Requirements

### Visual direction

Build a premium, calm, practical editor—not a generic admin dashboard.

- Default to a dark editor workspace with restrained green accents.
- Use readable typography and consistent spacing, borders, radii, and icon sizing.
- Ensure accessible contrast and visible keyboard focus.
- Make upload/project screens responsive.
- On small screens, stack panels instead of forcing a desktop-only layout.
- Avoid excessive gradients, needless animation, oversized cards, and clutter.
- Use only dependencies with suitable licenses.

### Editor layout

- Top toolbar: app name/logo, project name, save/status, export.
- Main area: video preview with active subtitle overlay.
- Side panel: transcript and editable subtitle cue list.
- Bottom: timeline with playhead and cue blocks.
- Controls: play/pause, seek, current time, duration, volume.
- Selecting a cue seeks to its start time.
- Highlight the active cue during playback.
- Text edits update the preview immediately.
- Timing edits update the timeline and playback behavior.
- Add/delete cue controls must be clear and keyboard accessible.

### Upload screen

- Drag-and-drop area and browse button.
- Supported formats and configured size limit.
- Filename, size, duration, and upload progress.
- Clearly state where processing occurs. Never claim a file is local/private unless the architecture makes that true.

### Required states

- No video selected.
- Invalid file.
- Uploading.
- Processing stage/progress when measurable.
- Failed processing with actionable error and retry.
- Transcript ready for review.
- Translation ready.
- No subtitles.
- Unsaved edits.
- Exporting and export complete.

Do not use decorative controls that do nothing. Do not rely on color alone for status. Add keyboard shortcuts only after core interactions work.

## 10. Security and Privacy

- Treat every upload as untrusted.
- Validate extension and actual media using FFprobe.
- Enforce configurable upload size and duration limits.
- Generate internal filenames and IDs; never use the original filename as a filesystem path.
- Store project files outside the public web root.
- Never serve arbitrary filesystem paths.
- Avoid logging transcript content or secrets by default.
- Keep `.env` and secrets out of version control.
- Restrict CORS to the configured frontend origin.
- Protect local API endpoints against unintended cross-origin access.
- Use safe subprocess argument arrays and timeouts.
- Stop subprocesses on cancellation where feasible.
- Clean temporary audio and failed-job artifacts.
- If an external provider is ever enabled, disclose that video/audio/text may leave the device.
- Do not add analytics or third-party tracking to the MVP without approval.

## 11. Performance, Low-Spec Devices, and Loading Speed (High Priority)

**This is a core product requirement, not a later optimization.** The application must feel fast to open and edit on modest laptops and phones. AI transcription may take time on weak hardware, but the interface and subtitle editor must remain responsive while work runs.

### Recommended technology decisions

- **Frontend:** Next.js App Router + React + TypeScript. Prefer Server Components for non-interactive pages and use Client Components only where interaction is required.
- **Styling:** Tailwind CSS with lightweight, accessible components. Avoid a large UI framework or animation library unless a clear need is proven.
- **Editor:** Native HTML video playback plus a purpose-built subtitle cue list/timeline. Avoid loading a full professional video-editing engine for the MVP.
- **Subtitle core:** Small framework-independent TypeScript package for cue types, timing rules, and SRT/VTT parsing and export.
- **Media/AI processing:** Python FastAPI + native FFmpeg + configurable open-source ASR/translation providers. Keep this work out of the browser UI thread.
- **Job execution:** Background worker/task queue pattern; show stages and honest progress. Do not block an API request until a whole video finishes.
- **Storage for MVP:** Local per-project files; avoid database/storage round trips unless required.

### Frontend performance rules

1. The upload/home page must not import the editor, timeline, AI libraries, waveform tools, or other heavy dependencies.
2. Lazy-load the project editor, timeline, waveform (only if needed), and advanced settings when the user opens them.
3. Keep initial JavaScript small; use bundle analysis to identify unexpectedly large dependencies.
4. Do not load AI models or FFmpeg WebAssembly into the browser on initial page load. Use native FFmpeg in the processor. Browser-based FFmpeg/WASM is not the default because it can download large assets and use substantial CPU/RAM.
5. Do not keep the full video or repeated copies of it in React state. Use the browser's file/object URL and stream or process the file through the supported upload path.
6. Use virtualized rows only if profiling shows a long subtitle list needs it; do not add complexity without evidence.
7. Debounce autosave and text updates where appropriate. Avoid re-rendering the entire editor for every keystroke or playback tick.
8. Use `requestAnimationFrame` or a throttled time update for active-cue highlighting; do not trigger expensive full-editor updates on every video time event.
9. Load fonts locally with `next/font`; avoid unnecessary third-party scripts, analytics, and remote font requests.
10. Respect `prefers-reduced-motion`; animations must be subtle and must not delay interaction.
11. Provide responsive layouts and usable controls on smaller screens. On narrow screens, stack panels and provide a simple cue-editing mode rather than forcing a complex multi-column desktop layout.
12. Keep error/loading/empty states lightweight and immediately visible. Do not use a blocking full-screen spinner for background processing.

### Processing performance rules

- Inspect the development/runtime hardware and available memory before recommending default AI models.
- Offer a documented **Fast / Balanced / Higher Accuracy** model setting only when those model options have been tested. Start with the smallest acceptable model for low-memory CPUs; do not claim it is accurate until evaluated on real Malayalam farming videos.
- Do not download multi-gigabyte models without showing the size, destination, and asking for confirmation.
- Cache model files between runs and avoid re-downloading them for every project.
- Extract audio once and reuse it for transcription/translation steps where possible.
- Run transcription, translation, and FFmpeg tasks asynchronously in a worker process; provide cancel/retry controls and clean up child processes safely.
- Keep the UI and subtitle editing available while processing runs. Show the current stage (uploading, extracting audio, transcribing Malayalam, translating, preparing subtitles) and only show a percentage when it can be measured honestly.
- Do not run two heavy model jobs simultaneously by default on low-memory devices. Queue jobs and expose a configurable concurrency limit.
- Use temporary files and cleanup policies; avoid holding multiple full-resolution video/audio copies in RAM.
- If a model is too slow on CPU, clearly explain the trade-off and keep an optional provider interface. No paid or remote provider may be required for the MVP.
- Explain that a low-spec device can edit subtitles smoothly, but local AI transcription/translation speed depends on CPU, RAM, video length, and model size. Never promise instant transcription on every device.

### Performance acceptance targets

Measure on a documented low-spec test device and a normal development machine; report real results rather than inventing benchmark numbers.

- The landing/upload screen should become interactive before editor-only dependencies are downloaded.
- Opening an existing subtitle project should not require re-running transcription or translation.
- Video playback, cue selection, and editing must continue to respond while a background job runs.
- Editing a cue must not cause the entire video or full cue list to re-render unnecessarily.
- Use Lighthouse and bundle analysis for production builds; record initial JavaScript size and key performance results in `docs/PERFORMANCE.md`.
- Test a short Malayalam clip first, then a longer clip, and document model, hardware, elapsed time, RAM use if measurable, and transcription quality observations.
- Performance targets are not considered met until tested on a real device; do not use a development-server score as the only evidence.

### Official implementation reference

Follow the current Next.js production checklist and lazy-loading guidance for code splitting, Server Components, caching, and bundle analysis: https://nextjs.org/docs/app/guides/production-checklist and https://nextjs.org/docs/app/guides/lazy-loading.

## 12. Testing and Acceptance Criteria

### Unit tests

- SRT parse/serialize round trip.
- VTT parse/serialize round trip.
- Unicode Malayalam and English.
- Timestamp formatting at zero, millisecond boundaries, and long durations.
- Invalid start/end values.
- Cue beyond video duration.
- Overlap detection.
- Empty subtitle text.
- Newline handling and valid export.

### Backend tests

- Health endpoint.
- Upload validation and invalid media.
- Safe filename handling.
- Unknown project/job IDs.
- Job status transitions.
- Provider failure/retry.
- Export content types and download names.
- Cancellation and cleanup where implemented.

### Frontend tests

- Upload validation/progress.
- Loading, error, and empty states.
- Editing cue text/timing.
- Selecting a cue seeks the video.
- Current cue follows playback time.
- Export downloads a valid file.

### End-to-end acceptance

Use a short Malayalam farming video that the developer has permission to process, with a human-checked reference transcript. Verify:

1. Video upload works.
2. Malayalam transcription completes or returns a clear error.
3. Transcript can be corrected.
4. English translation completes or returns a clear error.
5. Cue timestamps are valid.
6. Subtitles appear and change during playback.
7. User can edit a cue.
8. SRT and VTT open correctly.
9. The configured local MVP requires no paid API.
10. Setup works from a clean environment.

Do not claim quality is good without testing regional accents, background noise, real farming vocabulary, and actual playback timing.

## 13. Phased Implementation Plan

Work in small verified phases. After each phase, run checks and report actual results.

### Phase 0 — Repository/environment audit

- Inspect existing files and tools before changing anything.
- Check Node.js, pnpm, Python, FFmpeg, OS, RAM, and GPU availability.
- Research candidate ASR and translation models.
- Verify code and model licenses.
- Write `docs/OPEN_SOURCE_COMPONENTS.md` and `docs/MODEL_EVALUATION.md`.
- Record unknowns instead of fabricating results.

**Exit:** documented stack decision and runnable workspace skeleton.

### Phase 1 — Monorepo and design system

- Set up pnpm workspace and Next.js.
- Set up FastAPI skeleton and health endpoint.
- Create shared TypeScript subtitle-core package.
- Create design tokens and accessible UI primitives.
- Build landing/upload page and empty editor using clearly identified mock data only.
- Add lint, type-check, and test scripts.

**Exit:** services start, health endpoint works, UI renders, checks pass.

### Phase 2 — Upload and preview

- Implement validated upload.
- Store media outside public directory.
- Read metadata safely.
- Show preview and playback controls.
- Add size/duration limits and errors.

**Exit:** real MP4 uploads and previews safely.

### Phase 3 — Malayalam transcription

- Integrate selected open-source ASR provider.
- Test a real short Malayalam sample.
- Return segments and timestamps.
- Handle provider errors and cancellation where possible.
- Measure performance and document observed errors.

**Exit:** actual local transcript without a paid API, or a documented blocker and alternatives.

### Phase 4 — Translation

- Add a local translation provider selected from model evaluation.
- Keep it behind an interface.
- Translate context-aware chunks where practical.
- Preserve segment references and farming terms.
- Allow source transcript correction before translation.
- Evaluate against human-reviewed examples.

**Exit:** local translation works with limitations documented.

### Phase 5 — Cue generation and editor

- Build readable cues from timestamps and configurable rules.
- Implement editable cue list, synchronized player, playhead, and timeline.
- Add timing validation and unsaved-change state.
- Test playback against real timings.

**Exit:** user can review, edit, and preview synchronized subtitles.

### Phase 6 — Export

- Implement SRT/VTT export.
- Add tests and download actions.
- Validate exported files with a parser or independent player where practical.

**Exit:** valid downloaded subtitle files.

### Phase 7 — Hardening and docs

- Improve errors, progress, cleanup, security, and responsive design.
- Run all checks and end-to-end tests.
- Update setup instructions and limitations.
- Document how to change providers/models.

**Exit:** a new developer can run the MVP from the README.

### Phase 8 — Optional later work

Only after MVP acceptance: subtitle styling, burn-in rendering, project persistence, optional cloud deployment, desktop app.

### Agent report after each phase

Report:
1. What changed.
2. Important files created/modified.
3. Commands executed.
4. Tests and actual results.
5. Hardware/model limitations.
6. Known issues.
7. Exact next step.

Do not claim a test or command ran unless it actually did.

## 14. Future Desktop Application

The web app is the first deliverable. Keep subtitle data and core logic independent of the browser.

Evaluate Tauri 2 only after the web MVP is stable. Reuse the React UI where practical, the subtitle-core package, API/data contracts, and processing logic where feasible.

Desktop-specific work may include:
- Native file picker and save dialog.
- App data directory.
- FFmpeg installation/bundling strategy.
- Model download/management.
- Start/stop lifecycle for a local Python service.
- Local port selection and API protection.
- Packaging for target operating systems.
- Signing and update strategy if distributing.

Do not assume Python, FFmpeg, and model weights can be bundled without platform, licensing, size, and packaging work. Keep desktop work out of the initial MVP.

## 15. Environment Configuration

Create `.env.example` with safe defaults; do not commit `.env`.

```dotenv
# Web
NEXT_PUBLIC_APP_NAME="Malayalam Subtitle AI"
NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8000"

# Processor
APP_ENV="development"
API_HOST="127.0.0.1"
API_PORT="8000"
DATA_DIR="./.local-data"
MAX_UPLOAD_MB="500"
MAX_VIDEO_DURATION_SECONDS="3600"
ALLOWED_ORIGINS="http://localhost:3000"
ASR_PROVIDER="whisper"
ASR_MODEL="small"
TRANSLATION_PROVIDER="local"
```

These are starting defaults, not guarantees. Confirm hardware and model compatibility before finalizing model settings. Never put secrets in `NEXT_PUBLIC_*` variables.

## 16. Developer Experience

Provide one clear setup path for the supported environment. Document commands for:

- `pnpm install`
- `pnpm dev`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Python virtual environment and dependency installation.
- FFmpeg prerequisite check.
- Model download/preparation.
- Optional Docker only if it materially simplifies setup.

If web and processor run in separate terminals, explain that clearly. A `scripts/dev.sh` helper may start both after checking prerequisites. Do not automatically download multi-gigabyte models without warning the user.

## 17. Required Documentation

Keep these files current:

- `README.md` — overview, requirements, installation, run, tests, limitations.
- `docs/ARCHITECTURE.md` — components and data flow.
- `docs/API.md` — endpoints and request/response examples.
- `docs/OPEN_SOURCE_COMPONENTS.md` — libraries, model licenses, versions, sources.
- `docs/MODEL_EVALUATION.md` — tested Malayalam ASR/translation candidates and actual results.
- `docs/TESTING.md` — tests and end-to-end workflow.
- `docs/PERFORMANCE.md` — bundle size, Lighthouse results, low-spec device tests, model runtime, and known bottlenecks.
- `docs/DESKTOP_ROADMAP.md` — future Tauri/desktop plan.

## 18. Final Instructions to Antigravity

Treat this document as the product and engineering specification.

1. Inspect the existing workspace; do not overwrite unrelated work.
2. Implement Phase 0 and Phase 1 first, and verify them.
3. Research current model choices and licenses rather than assuming suitability.
4. Do not introduce a paid API as a required dependency.
5. Do not add authentication, payments, Supabase, or database migrations without a demonstrated need.
6. Never present mock transcription/translation as real. Mock data is allowed only for clearly identified UI scaffolding.
7. Keep the web-first architecture desktop-ready through reusable core packages and stable contracts.
8. Run actual checks and report actual results.
9. After Phase 1 is verified, proceed phase-by-phase without skipping acceptance checks.
10. Ask questions only when a decision is genuinely blocking; otherwise choose a sensible documented default.

### Definition of success

A polished, functional web application that processes a real Malayalam farming video without a mandatory paid API, produces editable and time-synchronized English subtitles, exports valid SRT/VTT files, clearly communicates local-model limitations, and remains structured for a future desktop application.
