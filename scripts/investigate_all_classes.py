
from pathlib import Path
import pandas as pd
import numpy as np

SOURCE_FOLDER = Path(
    r"C:\Users\Sudha Kruthi\Downloads\MachineLearningCSV-20261016T173645Z-1-001\MachineLearningCSV\MachineLearningCVE"
)

CHUNK_SIZE = 50_000
results = []

for file in sorted(SOURCE_FOLDER.glob("*.csv")):
    print(f"\nInvestigating: {file.name}")

    counts = {}

    for chunk in pd.read_csv(
        file,
        chunksize=CHUNK_SIZE,
        encoding="utf-8",
        encoding_errors="replace",
        low_memory=False,
    ):
        chunk.columns = chunk.columns.astype(str).str.strip()
        chunk["Label"] = chunk["Label"].astype("string").str.strip()

        features = [c for c in chunk.columns if c != "Label"]

        # Convert features to numeric for validity checks.
        for column in features:
            chunk[column] = pd.to_numeric(
                chunk[column], errors="coerce"
            )

        numeric = chunk[features].to_numpy(
            dtype=float, na_value=np.nan
        )

        invalid = (
            np.isnan(numeric).any(axis=1)
            | np.isinf(numeric).any(axis=1)
        )

        # Count duplicates within this chunk, by label.
        duplicate = chunk.duplicated(keep="first")

        for label in chunk["Label"].dropna().unique():
            mask = chunk["Label"].eq(label).fillna(False)

            entry = counts.setdefault(
                str(label),
                {
                    "rows": 0,
                    "invalid_feature_rows": 0,
                    "duplicate_rows_within_chunks": 0,
                },
            )

            entry["rows"] += int(mask.sum())
            entry["invalid_feature_rows"] += int(
                (mask.to_numpy() & invalid).sum()
            )
            entry["duplicate_rows_within_chunks"] += int(
                (mask.to_numpy() & duplicate.to_numpy()).sum()
            )

    for label, values in counts.items():
        results.append({
            "file": file.name,
            "label": label,
            **values,
        })

report = pd.DataFrame(results)
output = Path(__file__).resolve().parent.parent / "reports"
output.mkdir(parents=True, exist_ok=True)

report_path = output / "class_quality_diagnostics.csv"
report.to_csv(report_path, index=False)

print("\nSummary by file and label:")
print(report.to_string(index=False))
print(f"\nReport saved to: {report_path}")
