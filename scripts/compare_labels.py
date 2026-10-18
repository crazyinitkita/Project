
from pathlib import Path
import pandas as pd

# Original CIC-IDS2017 dataset folder
ORIGINAL = Path(
    r"C:\Users\Sudha Kruthi\Downloads\MachineLearningCSV-20261016T173645Z-1-001\MachineLearningCSV\MachineLearningCVE"
)

# Project folders
PROJECT = Path(__file__).resolve().parent.parent
CLEANED = PROJECT / "data" / "processed"
REPORTS = PROJECT / "reports"

REPORTS.mkdir(parents=True, exist_ok=True)


def count_labels(folder):
    """Count labels across CSV files, handling whitespace in headers."""
    counts = {}

    if not folder.exists():
        raise FileNotFoundError(f"Folder not found: {folder}")

    files = sorted(folder.glob("*.csv"))

    if not files:
        raise FileNotFoundError(f"No CSV files found in: {folder}")

    for file in files:
        print(f"Reading labels: {file.name}")

        for chunk in pd.read_csv(
            file,
            chunksize=50_000,
            encoding="utf-8",
            encoding_errors="replace",
            low_memory=False,
        ):
            # Remove spaces around column names
            chunk.columns = chunk.columns.astype(str).str.strip()

            if "Label" not in chunk.columns:
                raise ValueError(
                    f"Label column not found in {file.name}.\n"
                    f"Columns found: {chunk.columns.tolist()}"
                )

            labels = (
                chunk["Label"]
                .astype("string")
                .str.strip()
                .fillna("MISSING_LABEL")
            )

            values = labels.value_counts()

            for label, count in values.items():
                key = str(label)
                counts[key] = counts.get(key, 0) + int(count)

    return counts


def main():
    print("Counting original labels...")
    original_counts = count_labels(ORIGINAL)

    print("\nCounting cleaned labels...")
    cleaned_counts = count_labels(CLEANED)

    rows = []

    for label in sorted(set(original_counts) | set(cleaned_counts)):
        original = original_counts.get(label, 0)
        cleaned = cleaned_counts.get(label, 0)

        rows.append({
            "label": label,
            "original_count": original,
            "cleaned_count": cleaned,
            "removed_count": original - cleaned,
            "preserved_percent": (
                round(cleaned / original * 100, 2)
                if original > 0
                else None
            ),
        })

    report = pd.DataFrame(rows)

    report_path = REPORTS / "label_comparison.csv"
    report.to_csv(report_path, index=False)

    print("\nLabel comparison:")
    print(report.to_string(index=False))

    print(f"\nComparison report saved to: {report_path}")

    # Highlight any rare class that has lost records.
    print("\nRare attack preservation check:")

    rare_labels = [
        "Heartbleed",
        "Infiltration",
        "Web Attack � Sql Injection",
        "Web Attack � XSS",
    ]

    for label in rare_labels:
        original = original_counts.get(label, 0)
        cleaned = cleaned_counts.get(label, 0)

        print(
            f"{label}: original={original}, "
            f"cleaned={cleaned}, removed={original - cleaned}"
        )


if __name__ == "__main__":
    main()
