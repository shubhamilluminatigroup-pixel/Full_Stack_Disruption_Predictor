from sqlalchemy.orm import Session
from sklearn.preprocessing import MinMaxScaler
from datetime import date
import pandas as pd
import models  # Ensure models.WeightConfig is defined

def calculate_priority_scores(shipments: list, db: Session) -> list:
    if not shipments:
        return []

    # Add calculated feature: days_to_delivery
    for s in shipments:
        if s["delivery_date"]:
            s["days_to_delivery"] = max((s["delivery_date"] - date.today()).days, 0)
        else:
            s["days_to_delivery"] = 0

    # Load into DataFrame
    df = pd.DataFrame(shipments)
    numeric_columns = ["value", "weight", "volume", "shelf_life_days", "days_to_delivery"]
    df[numeric_columns] = df[numeric_columns].fillna(0)

    # Normalize
    scaler = MinMaxScaler()
    df_scaled = pd.DataFrame(scaler.fit_transform(df[numeric_columns]), columns=numeric_columns)

    # Invert time-sensitive features (lower is better)
    if "shelf_life_days" in df_scaled:
        df_scaled["shelf_life_days"] = 1 - df_scaled["shelf_life_days"]
    if "days_to_delivery" in df_scaled:
        df_scaled["days_to_delivery"] = 1 - df_scaled["days_to_delivery"]

    # ✅ Fetch weights from DB
    weight_records = db.query(models.WeightConfig).all()
    weights = {w.feature_name: w.weight_value for w in weight_records}

    # Build weight vector aligned with the column order
    weight_vector = [weights.get(col, 0) for col in numeric_columns]

    # Compute final score
    scores = df_scaled @ weight_vector
    return scores.tolist()
