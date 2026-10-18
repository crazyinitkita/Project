# CyberSentinel AI — Machine Learning

## Current status

- Dataset cleaning and validation scripts are included.
- The cleaned CIC-IDS2017 dataset contains 2,827,876 rows across eight CSV files.
- Each row has 78 feature columns and one Label column.
- Duplicate rows were preserved during cleaning.
- Eight constant features were identified for review.
- Model training and evaluation have not yet been completed.

## Dataset setup

The dataset is intentionally excluded from Git because of its size.

Place the eight cleaned CSV files in:

`data/processed_preserve_duplicates/`

Keep the dataset private and do not commit CSV files or ZIP archives.

## Python environment

From the repository root, run:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r ml\requirements.txt
```

## Validation

Run this from the repository root:

```powershell
python ml/scripts/verify_final_dataset.py
```

Review the scripts' configured paths before running other scripts. Some may expect data folders or reports in specific locations.

## Important notes

- Do not commit datasets, ZIP archives, model artifacts, or secrets.
- Do not report detection accuracy until a model has been trained and evaluated.
- Rare attack classes have very few examples, so their evaluation metrics may be unreliable.
