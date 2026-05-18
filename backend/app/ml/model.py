"""LightGBM model loading helpers."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import joblib

from app.core.config import settings

logger = logging.getLogger(__name__)


class ModelRegistry:
    """Lazy model registry for the optional trained LightGBM model."""

    def __init__(self, model_path: Path | None = None) -> None:
        self.model_path = model_path or settings.resolved_model_path
        self._model: Any | None = None
        self._load_failed = False

    def load(self) -> Any | None:
        """Load the serialized model if it exists."""

        if self._model is not None:
            return self._model
        if self._load_failed or not self.model_path.exists():
            return None
        try:
            self._model = joblib.load(self.model_path)
        except OSError as exc:
            self._load_failed = True
            logger.warning(
                "LightGBM native library unavailable (%s). "
                "Install OpenMP on macOS: brew install libomp. Using simulation fallback.",
                exc,
            )
        except Exception as exc:
            self._load_failed = True
            logger.warning("Could not load ML model (%s). Using simulation fallback.", exc)
        return self._model


model_registry = ModelRegistry()
