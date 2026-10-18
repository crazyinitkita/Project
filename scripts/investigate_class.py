
from pathlib import Path
import pandas as pd
import numpy as np

SOURCE = Path(
    r"C:\Users\Sudha Kruthi\Downloads\MachineLearningCSV-20261016T173645Z-1-001\MachineLearningCSV\MachineLearningCVE\Friday-WorkingHours-Afternoon-PortScan.pcap_ISCX.csv"
)

CHUNK_SIZE = 50_000

total = 0
portscan_rows = 0
portscan_missing = 0
portscan_infinite = 0
portscan_duplicates = 0
portscan_valid = 0

for chunk in pd.read_csv(
    SOURCE,
    chunksize=CHUNK_SIZE,
    encoding="utf-8",
    encoding_errors="replace",
    low_memory=False,
):
    chunk.columns = chunk.columns.astype(str).str.strip()

    labels = chunk["Label"].astype("string").str.strip()
    mask = labels.eq("PortScan").fillna(False)
    attack = chunk.loc[mask].copy()

    total += len(chunk)
    portscan_rows += len(attack)

    if attack.empty:
        continue

    feature_columns = [
        column for column in attack.columns
        if column != "Label"
    ]

    for column in feature_columns:
        attack[column] = pd.to_numeric(
            attack[column], errors="coerce"
        )

    numeric_values = attack[feature_columns].to_numpy(
        dtype=float, na_value=np.nan
    )

    missing_mask = np.isnan(numeric_values).any(axis=1)
    infinite_mask = np.isinf(numeric_values).any(axis=1)

    portscan_missing += int(missing_mask.sum())
    portscan_infinite += int(infinite_mask.sum())

    portscan_duplicates += int(attack.duplicated().sum())

    valid_mask = ~(missing_mask | infinite_mask)
    portscan_valid += int(valid_mask.sum())

print("\nPortScan diagnostic results")
print(f"Original PortScan rows: {portscan_rows:,}")
print(f"Rows with missing features: {portscan_missing:,}")
print(f"Rows with infinite features: {portscan_infinite:,}")
print(
    "Duplicate rows within individual chunks: "
    f"{portscan_duplicates:,}"
)
print(
    "Rows with all numeric features usable: "
    f"{portscan_valid:,}"
)
print(
    "\nNote: missing and infinite counts may overlap. "
    "Duplicate counts are within chunks only."
)
