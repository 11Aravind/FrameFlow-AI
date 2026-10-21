import subprocess
import shutil
from pathlib import Path
from app.core.config import settings


class MediaService:
    @staticmethod
    def get_ffmpeg_path() -> str:
        path = shutil.which("ffmpeg")
        if not path:
            raise RuntimeError("FFmpeg executable not found in PATH.")
        return path

    @staticmethod
    def get_ffprobe_path() -> str:
        path = shutil.which("ffprobe")
        if not path:
            raise RuntimeError("FFprobe executable not found in PATH.")
        return path

    @classmethod
    def probe_duration_ms(cls, video_path: Path) -> int:
        """
        Inspect video duration in milliseconds using ffprobe.
        """
        ffprobe_bin = cls.get_ffprobe_path()
        cmd = [
            ffprobe_bin,
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(video_path),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        raw_duration = result.stdout.strip()
        try:
            seconds = float(raw_duration)
            return int(seconds * 1000)
        except ValueError:
            return 0

    @classmethod
    def extract_audio(cls, video_path: Path, output_wav_path: Path) -> Path:
        """
        Extract 16kHz 16-bit mono PCM WAV audio using native FFmpeg.
        """
        ffmpeg_bin = cls.get_ffmpeg_path()
        cmd = [
            ffmpeg_bin,
            "-y",
            "-i", str(video_path),
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            str(output_wav_path),
        ]
        subprocess.run(cmd, capture_output=True, text=True, check=True)
        return output_wav_path
