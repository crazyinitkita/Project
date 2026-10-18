
from pathlib import Path
from collections import Counter
import pandas as pd

# We will set this to your actual extracted dataset folder.
DATASET_FOLDER = Path(
    r"C:\Users\Sudha Kruthi\Downloads\MachineLearningCSV-20261016T173645Z-1-001"
)

CHUNK_SIZE = 100_000


def main():
    if not DATASET_FOLDER.exists():
        print(f"Dataset folder not found: {DATASET_FOLDER}")
        print("Please update DATASET_FOLDER in this script.")
        return

    files = sorted(DATASET_FOLDER.rglob("*.csv"))
    print(f"Found {len(files)} CSV files.")

    if not files:
        print("No CSV files found. Check the folder path.")
        return

    report = []

    for file in files:
        print(f"\nInspecting: {file.name}")

        try:
            columns = pd.read_csv(
                file, nrows=0, encoding_errors="replace"
            ).columns

            label_col = next(
                (col for col in columns
                 if col.strip().lower() == "label"),
                None,
            )

            if label_col is None:
                print("No Label column found; skipping.")
                continue

            counts = Counter()

            for chunk in pd.read_csv(
                file,
                usecols=[label_col],
                chunksize=CHUNK_SIZE,
                encoding_errors="replace",
            ):
                labels = (
                    chunk[label_col]
                    .astype("string")
                    .str.strip()
                    .fillna("<MISSING>")
                )
                counts.update(labels.value_counts().to_dict())

            for label, count in sorted(counts.items()):
                print(f"  {label}: {count:,}")
                report.append({
                    "file": file.name,
                    "label": label,
                    "count": count,
                })

        except Exception as exc:
            print(f"Could not inspect this file: {exc}")

    if report:
        output = (
            Path(__file__).resolve().parent.parent
            / "reports"
            / "label_counts.csv"
        )
        output.parent.mkdir(parents=True, exist_ok=True)
        pd.DataFrame(report).to_csv(output, index=False)
        print(f"\nReport saved to: {output}")


if __name__ == "__main__":
    main()
