import json
from pathlib import Path
from datetime import datetime, timezone
from app.core.config import settings
from app.core.security import resolve_safe_path
from app.schemas.projects import SubtitleProject


class LocalProjectRepository:
    def __init__(self, base_dir: Path | None = None):
        self.base_dir = (base_dir or settings.data_dir).resolve()
        self.projects_dir = self.base_dir / "projects"
        self.projects_dir.mkdir(parents=True, exist_ok=True)

    def _get_project_dir(self, project_id: str) -> Path:
        p_dir = resolve_safe_path(self.projects_dir, project_id)
        p_dir.mkdir(parents=True, exist_ok=True)
        return p_dir

    def _get_project_file(self, project_id: str) -> Path:
        return self._get_project_dir(project_id) / "project.json"

    def save(self, project: SubtitleProject) -> SubtitleProject:
        project.updatedAt = datetime.now(timezone.utc).isoformat()
        file_path = self._get_project_file(project.id)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(project.model_dump_json(indent=2))
        return project

    def get(self, project_id: str) -> SubtitleProject | None:
        file_path = self._get_project_file(project_id)
        if not file_path.exists():
            return None
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return SubtitleProject.model_validate(data)

    def list_all(self) -> list[SubtitleProject]:
        projects: list[SubtitleProject] = []
        if not self.projects_dir.exists():
            return projects

        for p_dir in self.projects_dir.iterdir():
            if p_dir.is_dir():
                file_path = p_dir / "project.json"
                if file_path.exists():
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                        projects.append(SubtitleProject.model_validate(data))
                    except Exception:
                        continue
        # Sort by creation time descending
        projects.sort(key=lambda p: p.createdAt, reverse=True)
        return projects

    def delete(self, project_id: str) -> bool:
        p_dir = self._get_project_dir(project_id)
        if p_dir.exists():
            import shutil
            shutil.rmtree(p_dir, ignore_errors=True)
            return True
        return False
