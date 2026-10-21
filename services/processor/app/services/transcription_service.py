import os
import shutil
from pathlib import Path
from app.schemas.projects import TranscriptSegment
from app.services.media_service import MediaService

_model_cache = None


class TranscriptionService:
    @classmethod
    def get_whisper_model(cls):
        global _model_cache
        if _model_cache is not None:
            return _model_cache

        try:
            import whisper
            _model_cache = whisper.load_model("base", device="cpu")
            return _model_cache
        except Exception as e:
            err_msg = str(e)
            if "1114" in err_msg or "DLL" in err_msg or "c10.dll" in err_msg:
                raise RuntimeError(
                    "Microsoft Visual C++ 2015-2022 x64 Redistributable is required on Windows for local Whisper execution. "
                    "Please double-click 'Install_VC_Redist_x64.exe' located in your FrameFlow_AI root folder to install it, then click Retry."
                ) from e
            raise

    @classmethod
    def transcribe(cls, audio_path: Path) -> list[TranscriptSegment]:
        """
        Transcribe Malayalam speech from the extracted audio file.
        """
        model = cls.get_whisper_model()
        # Explicitly enforce Malayalam language and prompt as per specification
        result = model.transcribe(
            str(audio_path),
            language="ml",
            initial_prompt="ഇത് മലയാളം സംസാരിക്കുന്ന വീഡിയോ ആണ്.",
        )

        segments: list[TranscriptSegment] = []
        raw_segments = result.get("segments", [])

        for idx, seg in enumerate(raw_segments, 1):
            start_ms = int(seg.get("start", 0) * 1000)
            end_ms = int(seg.get("end", 0) * 1000)
            text = seg.get("text", "").strip()
            confidence = 1.0 - float(seg.get("no_speech_prob", 0.1))

            if text:
                segments.append(
                    TranscriptSegment(
                        id=f"seg_{idx}",
                        startMs=start_ms,
                        endMs=end_ms,
                        text=text,
                        confidence=round(confidence, 2),
                    )
                )

        return segments
