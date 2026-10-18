
from pathlib import Path
import pandas as pd
import numpy as np

# Original CIC-IDS2017 files: never modify these.
SOURCE_FOLDER = Path(
    r"C:\Users\Sudha Kruthi\Downloads\MachineLearningCSV-20261016T173645Z-1-001\MachineLearningCSV\MachineLearningCVE"
)

PROJECT_FOLDER = Path(__file__).resolve().parent.parent

# Separate output folder so the previous cleaned files stay untouched.
OUTPUT_FOLDER = (
    PROJECT_FOLDER / "data" / "processed_preserve_duplicates"
)
REPORT_FOLDER = PROJECT_FOLDER / "reports"

OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)
REPORT_FOLDER.mkdir(parents=True, exist_ok=True)

CHUNK_SIZE = 50_000
LABEL_COLUMN = "Label"


def clean_column_names(columns):
    return [str(column).strip() for column in columns]


def main():
    files = sorted(SOURCE_FOLDER.glob("*.csv"))

    if not files:
        raise FileNotFoundError(
            f"No CSV files found in {SOURCE_FOLDER}"
        )

    file_summaries = []
    label_summaries = []

    for source_file in files:
        output_file = OUTPUT_FOLDER / source_file.name
        print(f"\nProcessing: {source_file.name}")

        total_rows = 0
        saved_rows = 0
        invalid_label_rows = 0
        invalid_feature_rows = 0
        label_counts = {}

        # Only replace output from this script's own new folder.
        if output_file.exists():
            output_file.unlink()

        for chunk in pd.read_csv(
            source_file,
            chunksize=CHUNK_SIZE,
            encoding="utf-8",
            encoding_errors="replace",
            low_memory=False,
        ):
            total_rows += len(chunk)
            chunk.columns = clean_column_names(chunk.columns)

            if LABEL_COLUMN not in chunk.columns:
                raise ValueError(
                    f"'Label' column not found in {source_file.name}"
                )

            chunk[LABEL_COLUMN] = (
                chunk[LABEL_COLUMN]
                .astype("string")
                .str.strip()
            )

            label_valid = (
                chunk[LABEL_COLUMN].notna()
                & chunk[LABEL_COLUMN].ne("")
            )

            feature_columns = [
                col for col in chunk.columns
                if col != LABEL_COLUMN
            ]

            if not feature_columns:
                raise ValueError(
                    f"No feature columns found in {source_file.name}"
                )

            # Convert features to numbers. Unparseable values become NaN.
            for col in feature_columns:
                chunk[col] = pd.to_numeric(
                    chunk[col], errors="coerce"
                )

            # Infinity is not a usable numeric feature value.
            chunk[feature_columns] = chunk[
                feature_columns
            ].replace([np.inf, -np.inf], np.nan)

            features_valid = chunk[
                feature_columns
            ].notna().all(axis=1)

            invalid_label_rows += int((~label_valid).sum())

            # Count invalid feature rows only when the label is usable.
            invalid_feature_rows += int(
                (label_valid & ~features_valid).sum()
            )

            # Keep rows with a usable label and all usable features.
            valid_mask = label_valid & features_valid
            cleaned_chunk = chunk.loc[valid_mask].copy()

            # IMPORTANT: deliberately do NOT call drop_duplicates().
            # Repeated observations are retained.

            counts = cleaned_chunk[LABEL_COLUMN].value_counts()
            for label, count in counts.items():
                label = str(label)
                count = int(count)

                label_counts[label] = (
                    label_counts.get(label, 0) + count
                )

            if not cleaned_chunk.empty:
                cleaned_chunk.to_csv(
                    output_file,
                    mode="a",
                    header=not output_file.exists(),
                    index=False,
                )
                saved_rows += len(cleaned_chunk)

            print(
                f"  Read {total_rows:,} rows; "
                f"saved {saved_rows:,}"
            )

        for label, count in label_counts.items():
            label_summaries.append({
                "file": source_file.name,
                "label": label,
                "output_rows": count,
            })

        file_summaries.append({
            "file": source_file.name,
            "input_rows": total_rows,
            "output_rows": saved_rows,
            "invalid_label_rows": invalid_label_rows,
            "invalid_feature_rows_with_valid_label":
                invalid_feature_rows,
            "rows_removed_total":
                total_rows - saved_rows,
            "duplicate_removal": 0,
        })

        print(f"Saved: {output_file}")
        print(f"Valid rows retained: {saved_rows:,}")

    report_file = (
        REPORT_FOLDER / "cleaning_report_preserve_duplicates.csv"
    )
    label_report_file = (
        REPORT_FOLDER / "label_counts_preserve_duplicates.csv"
    )

    pd.DataFrame(file_summaries).to_csv(
        report_file, index=False
    )
    pd.DataFrame(label_summaries).to_csv(
        label_report_file, index=False
    )

    print("\nProcessing complete.")
    print(f"File report: {report_file}")
    print(f"Label report: {label_report_file}")
    print(f"Processed data: {OUTPUT_FOLDER}")
    print("Duplicate rows were not removed.")


if __name__ == "__main__":
    main()
