from typing import Literal
from pydantic import BaseModel, Field


JobType = Literal["extract_audio", "transcribe", "translate", "generate_subtitles"]
JobStatus = Literal["pending", "queued", "running", "completed", "failed", "cancelled"]


class JobResponse(BaseModel):
    id: str
    projectId: str
    type: JobType
    status: JobStatus
    progress: float = Field(ge=0.0, le=100.0, default=0.0)
    stageDescription: str = ""
    error: str | None = None
    createdAt: str
    updatedAt: str
