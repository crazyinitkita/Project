
from pathlib import Path
import pandas as pd

DATA_DIR = Path("data/processed_preserve_duplicates")
files = sorted(DATA_DIR.glob("*.csv"))

if not files:
    raise FileNotFoundError(
        f"No CSV files found in {DATA_DIR.resolve()}"
    )

reference_columns = None
total_rows = 0

for file in files:
    header = pd.read_csv(file, nrows=0)
    columns = list(header.columns)

    if "Label" not in columns:
        raise ValueError(f"Missing Label column: {file.name}")

    if reference_columns is None:
        reference_columns = columns
    elif columns != reference_columns:
        raise ValueError(
            f"Column mismatch found in {file.name}"
        )

    rows = 0
    for chunk in pd.read_csv(file, usecols=["Label"], chunksize=50000):
        rows += len(chunk)

        if chunk["Label"].isna().any():
            raise ValueError(f"Missing labels found in {file.name}")

    total_rows += rows
    print(f"OK: {file.name} — {rows:,} rows")

print("\nAll files have matching columns and valid labels.")
print(f"CSV files checked: {len(files)}")
print(f"Feature columns: {len(reference_columns) - 1}")
print(f"Total rows: {total_rows:,}")
print("Original cleaned files were not modified.")
