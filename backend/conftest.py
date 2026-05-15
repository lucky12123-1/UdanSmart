"""Pytest configuration — ensures backend package is importable."""

from __future__ import annotations

import sys
from pathlib import Path

# Add backend/ to sys.path so `from app.xxx import yyy` works
sys.path.insert(0, str(Path(__file__).parent))
