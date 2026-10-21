from typing import Literal
from pydantic import BaseModel, Field


ProjectStatus = Literal[
    "uploaded",
    "queued",
    "extracting_audio",
    "transcribing",
    "awaiting_transcript_review",
    "translating",
    "building_subtitles",
    "ready",
    "failed",
    "cancelled",
]


class SubtitleCue(BaseModel):
    id: str
    startMs: int = Field(ge=0, description="Start time in milliseconds")
    endMs: int = Field(gt=0, description="End time in milliseconds")
    text: str
    sourceSegmentIds: list[str] = []
    confidence: float | None = None
    edited: bool = False


class TranscriptSegment(BaseModel):
    id: str
    startMs: int = Field(ge=0, description="Start time in milliseconds")
    endMs: int = Field(gt=0, description="End time in milliseconds")
    text: str
    confidence: float | None = None


class SubtitleProject(BaseModel):
    id: str
    name: str
    originalFileName: str
    durationMs: int = Field(ge=0)
    sourceLanguage: Literal["ml"] = "ml"
    targetLanguage: Literal["en"] = "en"
    status: ProjectStatus
    transcript: list[TranscriptSegment] = []
    subtitles: list[SubtitleCue] = []
    createdAt: str
    updatedAt: str


class ProjectCreateResponse(BaseModel):
    project: SubtitleProject
    message: str = "Project created successfully"


class UpdateTranscriptRequest(BaseModel):
    transcript: list[TranscriptSegment]


class UpdateSubtitlesRequest(BaseModel):
    subtitles: list[SubtitleCue]
