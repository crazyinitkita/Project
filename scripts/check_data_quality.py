
from pathlib import Path
import pandas as pd

# Folder containing the original CIC-IDS2017 CSV files
DATASET_FOLDER = Path(
    r"C:\Users\Sudha Kruthi\Downloads\MachineLearningCSV-20261016T173645Z-1-001\MachineLearningCSV\MachineLearningCVE"
)

# Save the report inside our project
PROJECT_FOLDER = Path(__file__).resolve().parent.parent
REPORT_FOLDER = PROJECT_FOLDER / "reports"
REPORT_FOLDER.mkdir(parents=True, exist_ok=True)

results = []

csv_files = sorted(DATASET_FOLDER.glob("*.csv"))

if not csv_files:
    raise FileNotFoundError(
        f"No CSV files found in: {DATASET_FOLDER}"
    )

for file_path in csv_files:
    print(f"\nChecking: {file_path.name}")

    total_rows = 0
    missing_rows = 0
    duplicate_rows = 0
    label_counts = {}

    for chunk in pd.read_csv(
        file_path,
        chunksize=50_000,
        encoding="utf-8",
        encoding_errors="replace",
        low_memory=False,
    ):
        # Remove accidental spaces from column names
        chunk.columns = chunk.columns.str.strip()

        total_rows += len(chunk)

        # Count rows containing at least one missing value
        missing_rows += int(chunk.isna().any(axis=1).sum())

        # Count duplicate rows within this chunk
        duplicate_rows += int(chunk.duplicated().sum())

        # Count labels
        if "Label" in chunk.columns:
            labels = (
                chunk["Label"]
                .astype("string")
                .str.strip()
                .fillna("MISSING_LABEL")
            )

            counts = labels.value_counts()
            for label, count in counts.items():
                label_counts[str(label)] = (
                    label_counts.get(str(label), 0) + int(count)
                )

    results.append({
        "file": file_path.name,
        "rows": total_rows,
        "rows_with_missing_values": missing_rows,
        "duplicate_rows_within_chunks": duplicate_rows,
        "labels": str(label_counts),
    })

    print(f"Rows: {total_rows:,}")
    print(f"Rows with missing values: {missing_rows:,}")
    print(f"Duplicate rows found within chunks: {duplicate_rows:,}")
    print(f"Labels: {label_counts}")

report_path = REPORT_FOLDER / "data_quality_report.csv"
pd.DataFrame(results).to_csv(report_path, index=False)

print(f"\nQuality report saved to: {report_path}")
print("\nImportant: duplicate counts are within individual chunks only.")
