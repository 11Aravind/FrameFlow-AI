from fastapi import APIRouter, HTTPException, Response
from app.repositories.local_project_repository import LocalProjectRepository

router = APIRouter(tags=["Exports"])
repo = LocalProjectRepository()


def format_srt_time(ms: int) -> str:
    total_seconds = ms // 1000
    milliseconds = ms % 1000
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"


def format_vtt_time(ms: int) -> str:
    total_seconds = ms // 1000
    milliseconds = ms % 1000
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{milliseconds:03d}"


@router.get("/projects/{project_id}/export.srt")
def export_srt(project_id: str):
    project = repo.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    lines: list[str] = []
    for idx, cue in enumerate(project.subtitles, 1):
        timing = f"{format_srt_time(cue.startMs)} --> {format_srt_time(cue.endMs)}"
        lines.append(f"{idx}\n{timing}\n{cue.text.strip()}\n")

    content = "\n".join(lines)
    filename = f"{project.name.rsplit('.', 1)[0]}_subtitles.srt"
    return Response(
        content=content,
        media_type="text/plain; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/projects/{project_id}/export.vtt")
def export_vtt(project_id: str):
    project = repo.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    lines: list[str] = ["WEBVTT\n"]
    for idx, cue in enumerate(project.subtitles, 1):
        timing = f"{format_vtt_time(cue.startMs)} --> {format_vtt_time(cue.endMs)}"
        lines.append(f"{idx}\n{timing}\n{cue.text.strip()}\n")

    content = "\n".join(lines)
    filename = f"{project.name.rsplit('.', 1)[0]}_subtitles.vtt"
    return Response(
        content=content,
        media_type="text/vtt; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
