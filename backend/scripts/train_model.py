"""CLI wrapper for model training."""

from __future__ import annotations

from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.ml.trainer import train


if __name__ == "__main__":
    train()
