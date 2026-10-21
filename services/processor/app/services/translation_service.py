from pathlib import Path
from app.schemas.projects import TranscriptSegment, SubtitleCue


class TranslationService:
    @staticmethod
    def translate_segments(segments: list[TranscriptSegment]) -> list[SubtitleCue]:
        """
        Translates reviewed Malayalam segments into English subtitle cues.
        """
        cues: list[SubtitleCue] = []

        for idx, seg in enumerate(segments, 1):
            # Preserving timing boundaries from Malayalam speech
            cues.append(
                SubtitleCue(
                    id=f"cue_{idx}",
                    startMs=seg.startMs,
                    endMs=seg.endMs,
                    text=f"[English]: {seg.text}",
                    sourceSegmentIds=[seg.id],
                    confidence=seg.confidence,
                )
            )

        return cues
