// CyberSentinel AI — production model evaluation data.
// These values are reproduced FAITHFULLY from the project brief (the documented
// characteristics of the trained Random Forest on the prepared CIC-IDS2017
// sample). They describe the PRODUCTION model. The sandbox predictor used by
// the live analyzer is a separate signature-based scorer (see predictor.ts).

import { LABELS } from "./labels";
import { labelToClassInfo } from "./labels";
import type { ModelEvaluation } from "./types";

export const MODEL_EVALUATION: ModelEvaluation = {
  modelName: "Random Forest Classifier",
  modelType: "sklearn.ensemble.RandomForestClassifier",
  hyperparameters: {
    n_estimators: 100,
    max_depth: 20,
    min_samples_leaf: 2,
    max_features: "sqrt",
    class_weight: "balanced_subsample",
    n_jobs: -1,
    random_state: 42,
  },
  featureCount: 78, // production: prepared sample has 78 numeric features + 1 label
  classCount: 15,
  trainingRows: 300000,
  dataset: "CIC-IDS2017 (prepared training_sample.csv: 300,000 rows × 78 numeric features + 1 label, 15 categories)",
  splits: [
    {
      name: "Stratified random split",
      description: "Standard stratified train/test split with no grouping.",
      accuracy: 0.997,
      balancedAccuracy: 0.8637,
      macroF1: 0.8576,
      weightedF1: 0.9972,
      sharedGroups: 2267,
      note: "Allowed identical feature-vector groups to appear in both train and test. High accuracy may be inflated by leakage.",
    },
    {
      name: "Grouped split (leakage-aware)",
      description: "Split that keeps identical feature-vector groups together, preventing the same vector crossing the boundary.",
      accuracy: 0.9975,
      balancedAccuracy: 0.8572,
      macroF1: 0.8708,
      weightedF1: 0.9976,
      sharedGroups: 0,
      note: "Zero shared groups. Overall accuracy did not drop, but this does not rule out other leakage or poor generalisation to genuinely unfamiliar traffic.",
    },
  ],
  classDistribution: LABELS.map(labelToClassInfo),
  duplicateAudit: {
    exactDuplicateRows: 14826,
    rowsInRepeatedGroups: 20038,
    repeatedGroups: 5193,
    conflictingGroups: 19,
    benignVsDosHulkConflicts: 7,
    benignVsPortScanConflicts: 12,
    note: "19 groups where identical 78-feature vectors had conflicting labels. No automatic deletion of duplicates or conflicting labels has been performed; under investigation.",
  },
  globalFeatureImportance: [
    { name: "Init_Win_bytes_backward", importance: 0.182 },
    { name: "Init_Win_bytes_forward", importance: 0.151 },
    { name: "Flow Bytes/s", importance: 0.094 },
    { name: "Flow Packets/s", importance: 0.081 },
    { name: "Destination Port", importance: 0.072 },
    { name: "Bwd Packet Length Max", importance: 0.063 },
    { name: "Max Packet Length", importance: 0.055 },
    { name: "Total Length of Fwd Packets", importance: 0.047 },
    { name: "Flow IAT Mean", importance: 0.041 },
    { name: "Average Packet Size", importance: 0.036 },
    { name: "Fwd Packet Length Max", importance: 0.032 },
    { name: "Down/Up Ratio", importance: 0.028 },
  ],
  plannedWork: [
    "Separate-capture / separate-session holdout evaluation (not yet completed).",
    "Investigation of duplicate rows and 19 conflicting-label feature-vector groups.",
    "Reliable per-class metrics for rare classes (Bot, Web Attack – Brute Force, Web Attack – XSS, SQL Injection).",
    "Consideration of additional leakage checks beyond identical-vector grouping.",
  ],
};

export const PRODUCTION_CAVEATS: string[] = [
  "Do not present 99.70% accuracy as guaranteed real-world detection accuracy.",
  "Distinguish offline model evaluation from live traffic monitoring.",
  "The model score is an estimate, not a guarantee.",
  "Global feature importance does not prove why an individual sample was classified.",
  "The system does not detect every attack; rare-class performance is unreliable.",
  "First version analyses supplied traffic samples — no live packet capture, auto-blocking, forecasting, or persistent monitoring pipeline yet.",
];
