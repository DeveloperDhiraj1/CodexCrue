import os
from pathlib import Path
from typing import Any

import joblib


class ModelUnavailableError(RuntimeError):
    pass


class ArtifactLoader:
    def __init__(self, path: str | None = None):
        default_path = Path(__file__).resolve().parents[1] / "models" / "tfidf_vectorizer.pkl"
        configured_path = os.getenv("MODEL_PATH")
        self.path = Path(path or configured_path or default_path)
        self.artifact: Any = None
        self.error: str | None = None
        self.version = os.getenv("MODEL_VERSION", "tfidf-course-corpus-v1")
        self._load()

    def _load(self) -> None:
        if not self.path.exists():
            self.error = f"Model artifact not found: {self.path}"
            return
        if self.path.stat().st_size == 0:
            self.error = f"Model artifact is empty: {self.path}"
            return
        try:
            artifact = joblib.load(self.path)
            if not hasattr(artifact, "transform"):
                self.error = "Configured model artifact does not provide a transform method."
                return
            self.artifact = artifact
        except Exception as exc:
            self.error = f"Model artifact could not be loaded: {exc}"

    @property
    def loaded(self) -> bool:
        return self.artifact is not None

    def require(self):
        if not self.loaded:
            raise ModelUnavailableError(self.error or "Model artifact is unavailable.")
        return self.artifact
