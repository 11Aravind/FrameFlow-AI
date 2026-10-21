import uuid
import threading
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from app.schemas.jobs import JobResponse, JobType, JobStatus
from app.repositories.local_project_repository import LocalProjectRepository
from app.services.media_service import MediaService
from app.services.transcription_service import TranscriptionService
from app.services.translation_service import TranslationService

router = APIRouter(tags=["Jobs"])
repo = LocalProjectRepository()
_jobs_store: dict[str, JobResponse] = {}


def _run_transcribe_worker(job_id: str, project_id: str):
    job = _jobs_store.get(job_id)
    if not job:
        return

    try:
        project = repo.get(project_id)
        if not project:
            job.status = "failed"
            job.error = "Project not found"
            return

        job.status = "running"
        job.progress = 20.0
        job.stageDescription = "Extracting audio with FFmpeg..."
        job.updatedAt = datetime.now(timezone.utc).isoformat()

        project_dir = repo._get_project_dir(project_id)
        video_path = project_dir / "source.mp4"
        audio_path = project_dir / "audio.wav"

        # 1. Probe duration if missing
        if project.durationMs <= 0:
            try:
                project.durationMs = MediaService.probe_duration_ms(video_path)
            except Exception:
                pass

        # 2. Extract audio
        MediaService.extract_audio(video_path, audio_path)

        # 3. Transcribe Malayalam audio
        job.progress = 60.0
        job.stageDescription = "Transcribing Malayalam speech with local Whisper model..."
        job.updatedAt = datetime.now(timezone.utc).isoformat()

        segments = TranscriptionService.transcribe(audio_path)
        project.transcript = segments
        project.status = "awaiting_transcript_review"
        repo.save(project)

        job.status = "completed"
        job.progress = 100.0
        job.stageDescription = f"Transcription complete: {len(segments)} segments recognized."
        job.updatedAt = datetime.now(timezone.utc).isoformat()

    except Exception as e:
        job.status = "failed"
        job.error = str(e)
        job.stageDescription = "Transcription failed"
        job.updatedAt = datetime.now(timezone.utc).isoformat()


def _run_translate_worker(job_id: str, project_id: str):
    job = _jobs_store.get(job_id)
    if not job:
        return

    try:
        project = repo.get(project_id)
        if not project:
            job.status = "failed"
            job.error = "Project not found"
            return

        job.status = "running"
        job.progress = 40.0
        job.stageDescription = "Translating Malayalam segments to English..."
        job.updatedAt = datetime.now(timezone.utc).isoformat()

        cues = TranslationService.translate_segments(project.transcript)
        project.subtitles = cues
        project.status = "ready"
        repo.save(project)

        job.status = "completed"
        job.progress = 100.0
        job.stageDescription = f"Translation complete: {len(cues)} subtitle cues created."
        job.updatedAt = datetime.now(timezone.utc).isoformat()

    except Exception as e:
        job.status = "failed"
        job.error = str(e)
        job.stageDescription = "Translation failed"
        job.updatedAt = datetime.now(timezone.utc).isoformat()


@router.post("/projects/{project_id}/jobs/transcribe", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
def start_transcribe_job(project_id: str) -> JobResponse:
    project = repo.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    job_id = f"job_{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()
    job = JobResponse(
        id=job_id,
        projectId=project_id,
        type="transcribe",
        status="queued",
        progress=0.0,
        stageDescription="Job queued",
        createdAt=now,
        updatedAt=now,
    )
    _jobs_store[job_id] = job

    # Run in background thread to avoid blocking FastAPI
    threading.Thread(target=_run_transcribe_worker, args=(job_id, project_id), daemon=True).start()
    return job


@router.post("/projects/{project_id}/jobs/translate", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
def start_translate_job(project_id: str) -> JobResponse:
    project = repo.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    if not project.transcript:
        raise HTTPException(
            status_code=400,
            detail="Cannot translate: Malayalam transcript is empty. Run transcription and review first.",
        )

    job_id = f"job_{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()
    job = JobResponse(
        id=job_id,
        projectId=project_id,
        type="translate",
        status="queued",
        progress=0.0,
        stageDescription="Translation queued",
        createdAt=now,
        updatedAt=now,
    )
    _jobs_store[job_id] = job

    threading.Thread(target=_run_translate_worker, args=(job_id, project_id), daemon=True).start()
    return job


@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job_status(job_id: str) -> JobResponse:
    job = _jobs_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return job
