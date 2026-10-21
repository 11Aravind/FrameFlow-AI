import pytest
from pydantic import ValidationError
from app.schemas.projects import SubtitleCue, SubtitleProject


def test_subtitle_cue_valid():
    cue = SubtitleCue(id="cue_1", startMs=1000, endMs=3000, text="Valid cue")
    assert cue.startMs == 1000
    assert cue.endMs == 3000
    assert cue.text == "Valid cue"


def test_subtitle_cue_negative_start_raises():
    with pytest.raises(ValidationError):
        SubtitleCue(id="cue_1", startMs=-500, endMs=3000, text="Negative start")


def test_project_status_validation():
    project = SubtitleProject(
        id="proj_1",
        name="test.mp4",
        originalFileName="test.mp4",
        durationMs=10000,
        status="uploaded",
        createdAt="2026-10-20T17:00:00Z",
        updatedAt="2026-10-20T17:00:00Z",
    )
    assert project.status == "uploaded"
    assert project.sourceLanguage == "ml"
    assert project.targetLanguage == "en"
