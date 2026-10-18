
from pathlib import Path
from collections import Counter
import pandas as pd

PROJECT_FOLDER = Path(__file__).resolve().parent.parent
DATA_FOLDER = PROJECT_FOLDER / "data" / "processed_preserve_duplicates"

CHUNK_SIZE = 50_000
LABEL_COLUMN = "Label"

counts = Counter()

files = sorted(DATA_FOLDER.glob("*.csv"))

if not files:
    raise FileNotFoundError(
        f"No processed CSV files found in {DATA_FOLDER}"
    )

for file in files:
    print(f"Checking: {file.name}")

    for chunk in pd.read_csv(
        file,
        chunksize=CHUNK_SIZE,
        encoding="utf-8",
        encoding_errors="replace",
        low_memory=False,
    ):
        chunk.columns = [str(c).strip() for c in chunk.columns]

        if LABEL_COLUMN not in chunk.columns:
            raise ValueError(f"Label column missing in {file.name}")

        labels = chunk[LABEL_COLUMN].astype("string").str.strip()
        counts.update(labels.dropna().tolist())

print("\nProcessed class counts:")
for label, count in sorted(counts.items()):
    print(f"{label}: {count:,}")

print(f"\nTotal retained rows: {sum(counts.values()):,}")
