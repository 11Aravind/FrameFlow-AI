# REST API Specification

Base URL: `/api/v1`

All responses follow a predictable JSON envelope or return standard HTTP status codes.

---

## 1. System Health

### `GET /api/v1/health`
Checks backend availability, FFmpeg readiness, and local model states.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "ffmpegAvailable": true,
  "asrReady": true,
  "translationReady": true
}
```

---

## 2. Projects & Uploads

### `POST /api/v1/projects`
Uploads a new video file.
- **Content-Type:** `multipart/form-data`
- **Fields:** `file` (MP4 video binary)

**Response `201 Created`:**
```json
{
  "id": "proj_9f81a7b2",
  "name": "farming_intro.mp4",
  "originalFileName": "farming_intro.mp4",
  "durationMs": 42150,
  "sourceLanguage": "ml",
  "targetLanguage": "en",
  "status": "uploaded",
  "transcript": [],
  "subtitles": [],
  "createdAt": "2026-10-20T17:30:00Z",
  "updatedAt": "2026-10-20T17:30:00Z"
}
```

### `GET /api/v1/projects/{project_id}`
Returns metadata, current transcript, and subtitles for a project.

**Response `200 OK`:**
```json
{
  "id": "proj_9f81a7b2",
  "name": "farming_intro.mp4",
  "durationMs": 42150,
  "status": "ready",
  "transcript": [
    {
      "id": "seg_1",
      "startMs": 1200,
      "endMs": 4500,
      "text": "ഞങ്ങൾ ഇന്ന് ജൈവ കൃഷിയെക്കുറിച്ചാണ് സംസാരിക്കുന്നത്.",
      "confidence": 0.94
    }
  ],
  "subtitles": [
    {
      "id": "cue_1",
      "startMs": 1200,
      "endMs": 4500,
      "text": "Today we are talking about organic farming.",
      "sourceSegmentIds": ["seg_1"]
    }
  ]
}
```

### `GET /api/v1/projects/{project_id}/media`
Streams project video file with HTTP byte-range support for smooth seek and playback.

---

## 3. Background Jobs

### `POST /api/v1/projects/{project_id}/jobs/transcribe`
Starts asynchronous Malayalam speech-to-text extraction.

**Response `202 Accepted`:**
```json
{
  "jobId": "job_3d281a9f",
  "projectId": "proj_9f81a7b2",
  "type": "transcribe",
  "status": "queued",
  "progress": 0.0
}
```

### `POST /api/v1/projects/{project_id}/jobs/translate`
Starts asynchronous English translation of confirmed Malayalam transcript.

### `GET /api/v1/jobs/{job_id}`
Returns job status, stage, progress, or failure message.

---

## 4. Subtitle and Transcript Edits

### `PATCH /api/v1/projects/{project_id}/transcript`
Updates reviewed Malayalam segments.

### `PATCH /api/v1/projects/{project_id}/subtitles`
Updates English subtitle cues and timings.

---

## 5. Export

### `GET /api/v1/projects/{project_id}/export.srt`
Returns SubRip `.srt` subtitle format (`text/plain; charset=utf-8`).

### `GET /api/v1/projects/{project_id}/export.vtt`
Returns WebVTT `.vtt` subtitle format (`text/vtt; charset=utf-8`).
