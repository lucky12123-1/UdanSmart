"""India-calibrated LightGBM training pipeline."""

from __future__ import annotations

from datetime import date, timedelta
from pathlib import Path

import joblib
import mlflow
import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor, early_stopping
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error
from sklearn.model_selection import train_test_split

from app.core.config import settings
from app.ml.features import FEATURE_COLUMNS, ROUTE_BASE_PRICES, engineer_features
from app.ml.predictor import predictor


def generate_synthetic_data(rows: int = 80_000) -> pd.DataFrame:
    """Generate synthetic India domestic training examples."""

    rng = np.random.default_rng(42)
    routes = list(ROUTE_BASE_PRICES.keys())
    today = date.today()
    records = []
    cabins = ["economy", "premium_economy", "business", "first"]
    for _ in range(rows):
        route = routes[int(rng.integers(0, len(routes)))]
        origin, destination = route.split("-")
        days_before = int(rng.integers(1, 181))
        travel_date = today + timedelta(days=int(rng.integers(1, 365)))
        booking_date = travel_date - timedelta(days=days_before)
        cabin = cabins[int(rng.integers(0, len(cabins)))]
        adults = int(rng.integers(1, 5))
        features = engineer_features(origin, destination, travel_date, booking_date, cabin, adults)
        price = predictor.simulate_price(origin, destination, travel_date, cabin, adults, booking_date)
        records.append({**{k: features[k] for k in FEATURE_COLUMNS}, "travel_date": travel_date, "price": price})
    return pd.DataFrame(records).sort_values("travel_date")


def smape(actual: np.ndarray, predicted: np.ndarray) -> float:
    """Return symmetric mean absolute percentage error."""

    denom = (np.abs(actual) + np.abs(predicted)) / 2
    return float(np.mean(np.abs(actual - predicted) / np.maximum(denom, 1)) * 100)


def train() -> dict[str, float]:
    """Train and save the LightGBM price model."""

    df = generate_synthetic_data()
    split_index = int(len(df) * 0.8)
    train_df = df.iloc[:split_index]
    test_df = df.iloc[split_index:]
    x_train = train_df[FEATURE_COLUMNS]
    y_train = train_df["price"]
    x_test = test_df[FEATURE_COLUMNS]
    y_test = test_df["price"]
    params = {
        "objective": "regression",
        "metric": "mae",
        "n_estimators": 1500,
        "learning_rate": 0.03,
        "num_leaves": 127,
        "feature_fraction": 0.8,
        "bagging_fraction": 0.8,
        "bagging_freq": 5,
        "random_state": 42,
    }
    model = LGBMRegressor(**params)
    with mlflow.start_run(run_name="india-domestic-lightgbm"):
        mlflow.log_params(params)
        model.fit(x_train, y_train, eval_set=[(x_test, y_test)], callbacks=[early_stopping(50)])
        predictions = model.predict(x_test)
        metrics = {
            "mae": float(mean_absolute_error(y_test, predictions)),
            "mape": float(mean_absolute_percentage_error(y_test, predictions) * 100),
            "smape": smape(y_test.to_numpy(), predictions),
        }
        mlflow.log_metrics(metrics)
        settings.resolved_model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(model, settings.resolved_model_path)
        mlflow.log_artifact(str(settings.resolved_model_path))
    print(f"Saved model to {settings.resolved_model_path}")
    print(metrics)
    return metrics


if __name__ == "__main__":
    train()
