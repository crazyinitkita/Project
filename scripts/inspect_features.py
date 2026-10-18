
from pathlib import Path
from collections import Counter

import pandas as pd
import numpy as np


# --------------------------------------------------
# Configuration
# --------------------------------------------------

PROJECT_FOLDER = Path(__file__).resolve().parent.parent

DATA_FOLDER = (
    PROJECT_FOLDER / "data" / "processed_preserve_duplicates"
)

REPORT_FOLDER = PROJECT_FOLDER / "reports"

REPORT_FOLDER.mkdir(parents=True, exist_ok=True)

CHUNK_SIZE = 50_000
LABEL_COLUMN = "Label"


# --------------------------------------------------
# Find input files
# --------------------------------------------------

files = sorted(DATA_FOLDER.glob("*.csv"))

if not files:
    raise FileNotFoundError(
        f"No processed CSV files found in: {DATA_FOLDER}"
    )


# --------------------------------------------------
# Initialize counters
# --------------------------------------------------

feature_columns = None
constant_values = {}
non_numeric_counts = {}
infinite_counts = {}
missing_counts = {}

total_rows = 0
label_counts = Counter()


# --------------------------------------------------
# Inspect CSV files in chunks
# --------------------------------------------------

for file in files:
    print(f"\nInspecting: {file.name}")

    for chunk in pd.read_csv(
        file,
        chunksize=CHUNK_SIZE,
        encoding="utf-8",
        encoding_errors="replace",
        low_memory=False,
    ):
        # Normalize column-name whitespace.
        chunk.columns = [str(c).strip() for c in chunk.columns]

        if LABEL_COLUMN not in chunk.columns:
            raise ValueError(
                f"Label column missing in {file.name}"
            )

        columns = list(chunk.columns)

        current_features = [
            col for col in columns
            if col != LABEL_COLUMN
        ]

        if feature_columns is None:
            feature_columns = current_features

            constant_values = {
                col: None for col in feature_columns
            }

            non_numeric_counts = {
                col: 0 for col in feature_columns
            }

            infinite_counts = {
                col: 0 for col in feature_columns
            }

            missing_counts = {
                col: 0 for col in feature_columns
            }

        # Verify consistent feature columns across files.
        expected_columns = set(feature_columns + [LABEL_COLUMN])

        if set(columns) != expected_columns:
            raise ValueError(
                f"Column mismatch found in {file.name}.\n"
                f"Expected columns: {len(expected_columns)}\n"
                f"Found columns: {len(columns)}"
            )

        total_rows += len(chunk)

        # Count attack labels correctly.
        labels = (
            chunk[LABEL_COLUMN]
            .astype("string")
            .str.strip()
        )

        label_counts.update(labels.dropna().tolist())

        # Inspect each feature.
        for col in feature_columns:
            original = chunk[col]

            numeric = pd.to_numeric(
                original,
                errors="coerce",
            )

            non_numeric_counts[col] += int(
                (original.notna() & numeric.isna()).sum()
            )

            missing_counts[col] += int(
                numeric.isna().sum()
            )

            values = numeric.to_numpy(dtype="float64")

            infinite_counts[col] += int(
                np.isinf(values).sum()
            )

            # Check whether the feature is constant across
            # all finite values encountered so far.
            finite = numeric[np.isfinite(values)]

            if finite.empty:
                continue

            unique_values = pd.unique(finite)

            if constant_values[col] is None:
                if len(unique_values) > 1:
                    constant_values[col] = "__NOT_CONSTANT__"
                else:
                    constant_values[col] = unique_values[0]

            elif constant_values[col] != "__NOT_CONSTANT__":
                if not (finite == constant_values[col]).all():
                    constant_values[col] = "__NOT_CONSTANT__"


# --------------------------------------------------
# Create feature inspection report
# --------------------------------------------------

report_rows = []

for col in feature_columns:
    value = constant_values[col]

    is_constant = (
        value is not None
        and value != "__NOT_CONSTANT__"
    )

    report_rows.append({
        "column": col,
        "constant_across_finite_values": is_constant,
        "constant_value": (
            str(value) if is_constant else ""
        ),
        "missing_values": missing_counts[col],
        "non_numeric_values": non_numeric_counts[col],
        "infinite_values": infinite_counts[col],
    })

report = pd.DataFrame(report_rows)


# --------------------------------------------------
# Flag possible identifiers for manual review
# --------------------------------------------------

identifier_keywords = (
    "flow id",
    "source ip",
    "destination ip",
    "src ip",
    "dst ip",
    "timestamp",
    "source port",
    "destination port",
    "src port",
    "dst port",
)

report["possible_identifier_name"] = (
    report["column"]
    .str.lower()
    .apply(
        lambda name: any(
            keyword in name
            for keyword in identifier_keywords
        )
    )
)


# --------------------------------------------------
# Save and display results
# --------------------------------------------------

report_file = REPORT_FOLDER / "feature_inspection.csv"

report.to_csv(report_file, index=False)

print("\n" + "=" * 60)
print("FEATURE INSPECTION SUMMARY")
print("=" * 60)

print(f"Total rows inspected: {total_rows:,}")
print(f"Number of feature columns: {len(feature_columns)}")
print(f"Number of label categories: {len(label_counts)}")

print("\nLabel counts:")

for label, count in sorted(label_counts.items()):
    print(f"  {label}: {count:,}")

print("\nConstant features:")

constants = report[
    report["constant_across_finite_values"]
]

if constants.empty:
    print("  None found.")
else:
    print(
        constants[
            ["column", "constant_value"]
        ].to_string(index=False)
    )

print("\nPotential identifier columns to review:")

identifiers = report[
    report["possible_identifier_name"]
]

if identifiers.empty:
    print("  None flagged by name.")
else:
    print(
        identifiers["column"].to_string(index=False)
    )

print("\nFeature inspection report saved to:")
print(report_file)

print("\nInspection complete. No input files were modified.")
