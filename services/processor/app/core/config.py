import os
import shutil
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Ensure current process PATH includes updated User environment variables on Windows
if os.name == "nt":
    user_path = os.environ.get("Path", "")
    winget_ffmpeg_dir = Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "WinGet" / "Packages"
    if winget_ffmpeg_dir.exists():
        for candidate in winget_ffmpeg_dir.glob("**/ffmpeg.exe"):
            bin_dir = str(candidate.parent)
            if bin_dir not in user_path:
                os.environ["PATH"] = f"{bin_dir};{os.environ['PATH']}"
                break


class Settings(BaseSettings):
    app_name: str = "Malayalam Subtitle AI Processor"
    app_env: str = "development"
    api_host: str = "127.0.0.1"
    api_port: int = 8000
    data_dir: Path = Path("./.local-data")
    max_upload_mb: int = 500
    max_video_duration_seconds: int = 3600
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    asr_provider: str = "whisper"
    asr_model: str = "small"
    translation_provider: str = "local"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


settings = Settings()
