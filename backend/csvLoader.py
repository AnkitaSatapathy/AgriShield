import pandas as pd
import os

def load_crop_csv():
    """
    Load crop CSV using absolute path (works with uvicorn)
    """

    # backend folder ka path
    base_dir = os.path.dirname(os.path.abspath(__file__))

    project_root = os.path.dirname(base_dir)

    csv_path = os.path.join(
        project_root,
        "data",
        "processed",
        "indian_crop_management_dataset.csv"
    )

    df = pd.read_csv(csv_path)
    print(df.head())  # debug line


    csv_path = os.path.normpath(csv_path)

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found at: {csv_path}")

    df = pd.read_csv(csv_path)

    data = {}
    for _, row in df.iterrows():
        crop = str(row.get("crop", "")).lower().strip()

        if not crop:
            continue

        data[crop] = {
            "soil": str(row.get("soil", "")),
            "water": str(row.get("water", "")),
            "fertilizer": str(row.get("fertilizer", "")),
            "pesticide": str(row.get("pesticide", "")),
            "organic_tips": str(row.get("organic_tips", "")),
            "diseases": str(row.get("diseases", "")),
            "note": str(row.get("note", ""))
        }

    return data