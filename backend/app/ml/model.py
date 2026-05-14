"""LightGBM model loading helpers."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib

from app.core.config import settings


class ModelRegistry:
    """Lazy model registry for the optional trained LightGBM model."""

    def __init__(self, model_path: Path | None = None) -> None:
        self.model_path = model_path or settings.resolved_model_path
        self._model: Any | None = None

    def load(self) -> Any | None:
        """Load the serialized model if it exists."""

        if self._model is not None:
            return self._model
        if self.model_path.exists():
            self._model = joblib.load(self.model_path)
        return self._model


model_registry = ModelRegistry()
