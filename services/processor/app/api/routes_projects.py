import uuid
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from app.schemas.projects import (
    SubtitleProject,
    ProjectCreateResponse,
    UpdateTranscriptRequest,
    UpdateSubtitlesRequest,
)
from app.repositories.local_project_repository import LocalProjectRepository
from app.core.security import sanitize_filename, resolve_safe_path
from app.core.config import settings

router = APIRouter(prefix="/projects", tags=["Projects"])
repo = LocalProjectRepository()


@router.post("", response_model=ProjectCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_project(file: UploadFile = File(...)) -> ProjectCreateResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename.")

    # Validate file format (MP4 required first as per spec)
    file_ext = Path(file.filename).suffix.lower()
    if file_ext != ".mp4":
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{file_ext}'. Only .mp4 is supported in the current MVP.",
        )

    project_id = f"proj_{uuid.uuid4().hex[:8]}"
    clean_name = sanitize_filename(file.filename)
    now_iso = datetime.now(timezone.utc).isoformat()

    project = SubtitleProject(
        id=project_id,
        name=clean_name,
        originalFileName=file.filename,
        durationMs=0,
        sourceLanguage="ml",
        targetLanguage="en",
        status="uploaded",
        transcript=[],
        subtitles=[],
        createdAt=now_iso,
        updatedAt=now_iso,
    )

    # Save media file in private project workspace
    project_dir = repo._get_project_dir(project_id)
    video_path = project_dir / f"source{file_ext}"

    # Write file stream safely
    content = await file.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Uploaded file exceeds maximum configured size of {settings.max_upload_mb}MB.",
        )

    with open(video_path, "wb") as f:
        f.write(content)

    # Probe duration using FFprobe
    from app.services.media_service import MediaService
    try:
        duration_ms = MediaService.probe_duration_ms(video_path)
        project.durationMs = duration_ms
    except Exception as e:
        print(f"Warning: could not probe duration: {e}")

    saved_project = repo.save(project)
    return ProjectCreateResponse(project=saved_project)


@router.get("", response_model=list[SubtitleProject])
def list_projects() -> list[SubtitleProject]:
    return repo.list_all()


@router.get("/{project_id}", response_model=SubtitleProject)
def get_project(project_id: str) -> SubtitleProject:
    project = repo.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project


@router.get("/{project_id}/media")
def get_project_media(project_id: str):
    project = repo.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    project_dir = repo._get_project_dir(project_id)
    video_path = project_dir / "source.mp4"
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video media file not found on disk.")

    return FileResponse(
        path=video_path,
        media_type="video/mp4",
        filename=project.originalFileName,
    )


@router.patch("/{project_id}/transcript", response_model=SubtitleProject)
def update_transcript(project_id: str, req: UpdateTranscriptRequest) -> SubtitleProject:
    project = repo.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    project.transcript = req.transcript
    return repo.save(project)


@router.patch("/{project_id}/subtitles", response_model=SubtitleProject)
def update_subtitles(project_id: str, req: UpdateSubtitlesRequest) -> SubtitleProject:
    project = repo.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    project.subtitles = req.subtitles
    return repo.save(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str):
    deleted = repo.delete(project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found.")
    return None
