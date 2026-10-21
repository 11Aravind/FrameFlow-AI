import shutil
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str
    version: str
    ffmpegAvailable: bool
    asrReady: bool
    translationReady: bool


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    ffmpeg_found = shutil.which("ffmpeg") is not None
    return HealthResponse(
        status="healthy",
        version="0.1.0",
        ffmpegAvailable=ffmpeg_found,
        asrReady=True,
        translationReady=True,
    )
