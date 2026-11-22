from __future__ import annotations

import sys
from pathlib import Path

import pytest

API_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = API_DIR.parents[1] / "data" / "generated" / "csv"
sys.path.insert(0, str(API_DIR))


@pytest.fixture(scope="session")
def engine():
    if not (DATA_DIR / "orders.csv").exists():
        pytest.fail(f"dataset ausente em {DATA_DIR}: rode `npm run generate:data` na raiz do repositório")
    from src.analytics.engine import AnalyticsEngine

    return AnalyticsEngine(data_dir=str(DATA_DIR))
