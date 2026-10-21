import os
import re
from pathlib import Path
from fastapi import HTTPException


def sanitize_filename(filename: str) -> str:
    """
    Remove potentially dangerous characters from user-supplied filenames.
    """
    clean = re.sub(r"[^a-zA-Z0-9_.-]", "_", filename)
    return clean[:128]


def resolve_safe_path(base_dir: Path, relative_path: str | Path) -> Path:
    """
    Safely resolves a relative path against a base directory,
    preventing directory traversal attacks.
    """
    resolved_base = base_dir.resolve()
    target_path = (resolved_base / relative_path).resolve()

    if not str(target_path).startswith(str(resolved_base)):
        raise HTTPException(
            status_code=400,
            detail="Invalid path: Path traversal detected."
        )

    return target_path
