
from pathlib import Path
import pandas as pd

PROJECT = Path(__file__).resolve().parent.parent
DATA_FOLDER = PROJECT / "data" / "processed_preserve_duplicates"
REPORT_FILE = PROJECT / "reports" / "cleaning_report_preserve_duplicates.csv"

report = pd.read_csv(REPORT_FILE)

print("Cleaning report totals")
print("Input rows: ", f"{report['input_rows'].sum():,}")
print("Saved rows: ", f"{report['output_rows'].sum():,}")

print("\nRecounting actual output files")
actual_total = 0

for file in sorted(DATA_FOLDER.glob("*.csv")):
    count = 0

    for chunk in pd.read_csv(
        file,
        usecols=["Label"],
        chunksize=50_000,
        encoding="utf-8",
        encoding_errors="replace",
    ):
        count += len(chunk)

    actual_total += count
    print(f"{file.name}: {count:,}")

print(f"\nActual total: {actual_total:,}")
print(
    "Report minus actual:",
    f"{int(report['output_rows'].sum()) - actual_total:,}",
)
