// CyberSentinel AI — sandbox predictor.
//
// IMPORTANT — read me:
// The production system uses a trained RandomForestClassifier
// (ml-service/models/random_forest.joblib) served by FastAPI. That backend is
// not reachable from this sandbox, so this module reproduces the SAME response
// contract (predicted label + per-class probabilities + top contributing
// features) using a transparent, deterministic, signature-based scorer.
//
// It is NOT the trained model and must not be presented as such. The UI labels
// it explicitly as the "sandbox predictor". The detection/explanation split is
// preserved: this module only produces a prediction; explanation text is
// generated separately by the LLM (explainer.ts) and must never invent a label.

import { FEATURE_NAMES, FEATURE_COUNT } from "./features";
import { LABELS, LABEL_BY_NAME } from "./labels";
import type {
  AnalysisResult,
  ClassProbability,
  FeatureContribution,
  ThreatLevel,
  TrafficFeatureMap,
} from "./types";
import { explainPrediction, fallbackExplanation } from "./explainer";

const SAFE = 1e-9;

function num(f: TrafficFeatureMap, name: string): number {
  const v = f[name];
  if (typeof v !== "number" || !Number.isFinite(v)) return 0;
  return v;
}

/** Per-class signature scoring. Higher = more consistent with that class. */
function classScores(f: TrafficFeatureMap): Record<string, number> {
  const port = num(f, "Destination Port");
  const flowDuration = num(f, "Flow Duration");
  const totalFwd = num(f, "Total Fwd Packets");
  const totalBwd = num(f, "Total Backward Packets");
  const fwdLen = num(f, "Total Length of Fwd Packets");
  const bwdLen = num(f, "Total Length of Bwd Packets");
  const flowBytesPerS = num(f, "Flow Bytes/s");
  const flowPktsPerS = num(f, "Flow Packets/s");
  const fwdPktsPerS = num(f, "Fwd Packets/s");
  const bwdPktsPerS = num(f, "Bwd Packets/s");
  const iatMean = num(f, "Flow IAT Mean");
  const iatMin = num(f, "Flow IAT Min");
  const fwdIATMean = num(f, "Fwd IAT Mean");
  const syn = num(f, "SYN Flag Count");
  const fin = num(f, "FIN Flag Count");
  const psh = num(f, "PSH Flag Count");
  const ack = num(f, "ACK Flag Count");
  const winFwd = num(f, "Init_Win_bytes_forward");
  const winBwd = num(f, "Init_Win_bytes_backward");
  const avgPktSize = num(f, "Average Packet Size");
  const maxPktLen = num(f, "Max Packet Length");
  const bwdPktLenMax = num(f, "Bwd Packet Length Max");
  const bwdPktLenMean = num(f, "Bwd Packet Length Mean");
  const downUp = num(f, "Down/Up Ratio");
  const activeMean = num(f, "Active Mean");
  const idleMean = num(f, "Idle Mean");
  const pktLenVar = num(f, "Packet Length Variance");
  const fwdHeader = num(f, "Fwd Header Length");

  const totalPkts = totalFwd + totalBwd + SAFE;
  const fwdRatio = totalFwd / totalPkts;
  const synRatio = syn / (totalPkts + SAFE);

  const s: Record<string, number> = {};
  for (const l of LABELS) s[l.label] = 0;

  // ---- BENIGN: balanced bidirectional, moderate rates, present ACK ----
  s["BENIGN"] +=
    (totalBwd > 0 && totalFwd > 0 ? 1.6 - Math.abs(fwdRatio - 0.5) * 2 : 0) +
    (ack > 0 ? 0.6 : 0) +
    (flowPktsPerS > 0 && flowPktsPerS < 5000 ? 0.8 : 0) +
    (avgPktSize > 200 && avgPktSize < 1400 ? 0.6 : 0) +
    (winFwd > 0 && winBwd > 0 ? 0.7 : 0) +
    (synRatio < 0.3 ? 0.6 : 0);

  // ---- DDoS: extreme packet rate flood, SYN-heavy, short IAT, mostly forward ----
  s["DDoS"] +=
    Math.min(flowPktsPerS / 50000, 3.6) +
    Math.min(syn / 100, 2.8) +
    (synRatio > 0.5 ? 1.6 : 0) +
    (fwdRatio > 0.7 ? 1.0 : 0) +
    (iatMean < 1000 && iatMean > 0 ? 1.4 : 0) +
    (winFwd === -1 ? 0.8 : 0) +
    (flowDuration > 0 && flowDuration < 5_000_000 ? 0.6 : 0);

  // ---- DoS Hulk: very high forward rate, PSH-heavy, port 80, many fwd pkts ----
  s["DoS Hulk"] +=
    Math.min(fwdPktsPerS / 100000, 3) +
    Math.min(psh / 40, 2.2) +
    (port === 80 ? 1.2 : 0) +
    (totalFwd > 20 ? 1.2 : 0) +
    (fwdRatio > 0.85 ? 1.0 : 0) +
    (winFwd === -1 ? 0.8 : 0) +
    (bwdPktLenMean < 100 && totalBwd > 0 ? 0.6 : 0);

  // ---- DoS GoldenEye: high forward rate, moderate, port 80, lower than Hulk ----
  s["DoS GoldenEye"] +=
    Math.min(fwdPktsPerS / 50000, 2.4) +
    (port === 80 ? 1.0 : 0) +
    (psh > 5 ? 0.9 : 0) +
    (totalFwd > 5 && totalFwd < 60 ? 1.0 : 0) +
    (winFwd === -1 ? 0.8 : 0) +
    (syn > 3 ? 0.6 : 0) +
    (fwdRatio > 0.7 ? 0.7 : 0);

  // ---- DoS slowloris: long duration, low packet rate, few packets ----
  s["DoS slowloris"] +=
    (flowDuration > 10_000_000 ? 2.2 : 0) +
    (flowPktsPerS > 0 && flowPktsPerS < 200 ? 1.6 : 0) +
    (totalFwd > 0 && totalFwd < 10 ? 1.2 : 0) +
    (port === 80 ? 0.8 : 0) +
    (winFwd === -1 ? 0.7 : 0) +
    (idleMean > 1_000_000 ? 0.6 : 0);

  // ---- DoS Slowhttptest: very long duration, extremely low rate ----
  s["DoS Slowhttptest"] +=
    (flowDuration > 30_000_000 ? 2.6 : 0) +
    (flowPktsPerS > 0 && flowPktsPerS < 50 ? 1.8 : 0) +
    (totalFwd <= 6 ? 1.2 : 0) +
    (port === 80 ? 0.8 : 0) +
    (winFwd === -1 ? 0.7 : 0) +
    (idleMean > 5_000_000 ? 0.7 : 0);

  // ---- PortScan: high fwd packets, SYN-heavy, win=-1, forward-only, MODERATE rate ----
  s["PortScan"] +=
    Math.min(totalFwd / 20, 2.6) +
    (synRatio > 0.6 ? 1.6 : 0) +
    (winFwd === -1 ? 1.2 : 0) +
    (totalBwd === 0 ? 0.8 : 0) +
    (downUp === 0 ? 0.6 : 0) +
    (fwdRatio > 0.9 ? 0.9 : 0) +
    (avgPktSize < 100 ? 0.5 : 0) +
    (flowPktsPerS > 0 && flowPktsPerS < 20000 ? 1.4 : 0);

  // ---- FTP-Patator: port 21, repetitive small packets, high ACK ----
  s["FTP-Patator"] +=
    (port === 21 ? 2.6 : 0) +
    Math.min(ack / 30, 1.6) +
    (totalFwd > 5 && totalFwd < 80 ? 0.9 : 0) +
    (bwdPktLenMean > 40 && bwdPktLenMean < 300 ? 0.7 : 0) +
    (flowDuration > 1_000_000 ? 0.5 : 0);

  // ---- SSH-Patator: port 22, repetitive, high ACK ----
  s["SSH-Patator"] +=
    (port === 22 ? 2.6 : 0) +
    Math.min(ack / 30, 1.6) +
    (totalFwd > 5 && totalFwd < 80 ? 0.9 : 0) +
    (bwdPktLenMean > 40 && bwdPktLenMean < 300 ? 0.7 : 0) +
    (flowDuration > 1_000_000 ? 0.5 : 0);

  // ---- Web Attack – Brute Force: port 80, POST-like, repetitive, short flow ----
  s["Web Attack \u2013 Brute Force"] =
    port === 80 && flowDuration < 10_000_000 && totalFwd > 3 && totalFwd <= 40
      ? 2.0 + Math.min(psh / 20, 1.8) + (fwdLen > 200 && fwdLen < 2000 ? 0.9 : 0) + (winFwd > 0 ? 0.4 : 0)
      : 0;

  // ---- Web Attack – SQL Injection: port 80, short flow, few fwd pkts, high payload variance ----
  s["Web Attack \u2013 Sql Injection"] =
    port === 80 && flowDuration < 8_000_000 && totalFwd >= 3 && totalFwd <= 15
      ? 2.0 +
        (pktLenVar > 50000 ? 1.7 : pktLenVar > 5000 ? 1.1 : 0) +
        (maxPktLen > 500 && maxPktLen <= 1460 ? 0.8 : 0) +
        (fwdLen > 300 ? 0.8 : 0) +
        (psh > 2 ? 0.5 : 0)
      : 0;

  // ---- Web Attack – XSS: port 80, short flow, few fwd pkts, PSH-heavy ----
  s["Web Attack \u2013 Xss"] =
    port === 80 && flowDuration < 8_000_000 && totalFwd >= 3 && totalFwd <= 15
      ? 2.0 + Math.min(psh / 8, 1.9) + (fwdLen > 200 ? 0.9 : 0) + (maxPktLen > 400 ? 0.7 : 0)
      : 0;

  // ---- Bot: C2-like, IRC/HTTP ports, long-ish duration, moderate size ----
  s["Bot"] +=
    (port === 6667 ? 2.6 : port === 80 || port === 443 ? 1.2 : 0) +
    (flowDuration > 5_000_000 && flowDuration < 60_000_000 ? 1.0 : 0) +
    (avgPktSize > 100 && avgPktSize < 600 ? 0.7 : 0) +
    (totalFwd > 2 && totalFwd < 30 ? 0.7 : 0) +
    (fwdIATMean > 100_000 ? 0.7 : 0) +
    (winBwd === -1 ? 0.5 : 0);

  // ---- Infiltration: exotic port, long active, asymmetric window ----
  s["Infiltration"] +=
    (port === 4444 || port === 8080 ? 2.6 : port === 443 ? 1.0 : 0) +
    (activeMean > 2_000_000 ? 1.4 : 0) +
    (flowDuration > 10_000_000 ? 1.0 : 0) +
    (avgPktSize > 200 && avgPktSize < 800 ? 0.7 : 0) +
    (totalFwd >= 5 && totalFwd < 25 ? 0.7 : 0) +
    (winFwd > 0 && winBwd === -1 ? 0.9 : 0);

  // ---- Heartbleed: port 444/443, huge backward payload (memory leak) ----
  s["Heartbleed"] +=
    (port === 444 || port === 443 ? 2.2 : 0) +
    (bwdPktLenMax > 1400 ? 1.8 : 0) +
    (bwdLen > 30000 ? 1.4 : 0) +
    (totalBwd <= 2 ? 0.8 : 0) +
    (fwdRatio > 0.8 ? 0.6 : 0);

  return s;
}

function softmax(scores: Record<string, number>, temp = 0.85): Record<string, number> {
  const entries = Object.entries(scores);
  const max = Math.max(...entries.map(([, v]) => v));
  const exps = entries.map(([k, v]) => [k, Math.exp((v - max) / temp)] as const);
  const sum = exps.reduce((s, [, v]) => s + v, 0) + SAFE;
  const out: Record<string, number> = {};
  for (const [k, v] of exps) out[k] = v / sum;
  return out;
}

function threatLevelFor(label: string): ThreatLevel {
  const meta = LABEL_BY_NAME[label];
  return meta?.severity ?? "medium";
}

/** Build the local, sample-level feature contribution list (NOT global importance). */
function topContributions(
  f: TrafficFeatureMap,
  predicted: string,
): FeatureContribution[] {
  const port = num(f, "Destination Port");
  const flowPktsPerS = num(f, "Flow Packets/s");
  const fwdPktsPerS = num(f, "Fwd Packets/s");
  const syn = num(f, "SYN Flag Count");
  const psh = num(f, "PSH Flag Count");
  const ack = num(f, "ACK Flag Count");
  const totalFwd = num(f, "Total Fwd Packets");
  const totalBwd = num(f, "Total Backward Packets");
  const flowDuration = num(f, "Flow Duration");
  const winFwd = num(f, "Init_Win_bytes_forward");
  const avgPktSize = num(f, "Average Packet Size");
  const bwdPktLenMax = num(f, "Bwd Packet Length Max");
  const fwdRatio = totalFwd / (totalFwd + totalBwd + SAFE);

  const all: FeatureContribution[] = [
    { name: "Destination Port", value: port, influence: 0, direction: "normal", note: `Port ${port}` },
    { name: "Flow Packets/s", value: flowPktsPerS, influence: 0, direction: flowPktsPerS > 50000 ? "high" : flowPktsPerS < 100 ? "low" : "normal", note: "Overall packet rate" },
    { name: "Fwd Packets/s", value: fwdPktsPerS, influence: 0, direction: fwdPktsPerS > 50000 ? "high" : "normal", note: "Forward-direction rate" },
    { name: "SYN Flag Count", value: syn, influence: 0, direction: syn > 10 ? "high" : "normal", note: "Connection-setup attempts" },
    { name: "PSH Flag Count", value: psh, influence: 0, direction: psh > 10 ? "high" : "normal", note: "Pushed data segments" },
    { name: "ACK Flag Count", value: ack, influence: 0, direction: ack > 10 ? "high" : "normal", note: "Acknowledgements" },
    { name: "Total Fwd Packets", value: totalFwd, influence: 0, direction: totalFwd > 50 ? "high" : "normal", note: "Forward packet volume" },
    { name: "Flow Duration", value: flowDuration, influence: 0, direction: flowDuration > 10_000_000 ? "high" : "normal", note: "Flow lifetime (µs)" },
    { name: "Init_Win_bytes_forward", value: winFwd, influence: 0, direction: winFwd === -1 ? "low" : "normal", note: winFwd === -1 ? "Unset window (often attack signature)" : "Initial window size" },
    { name: "Average Packet Size", value: avgPktSize, influence: 0, direction: avgPktSize < 100 ? "low" : "normal", note: "Mean payload size" },
    { name: "Bwd Packet Length Max", value: bwdPktLenMax, influence: 0, direction: bwdPktLenMax > 1400 ? "high" : "normal", note: "Largest backward payload" },
    { name: "Forward/Backward ratio", value: Number(fwdRatio.toFixed(3)), influence: 0, direction: fwdRatio > 0.8 ? "high" : fwdRatio < 0.3 ? "low" : "normal", note: "Directional asymmetry" },
  ];

  // Assign influence weights based on the predicted class signature.
  const weights: Record<string, Partial<Record<string, number>>> = {
    "DDoS": { "Flow Packets/s": 0.95, "SYN Flag Count": 0.9, "Forward/Backward ratio": 0.7, "Init_Win_bytes_forward": 0.6, "Flow Duration": 0.4 },
    "DoS Hulk": { "Fwd Packets/s": 0.95, "PSH Flag Count": 0.8, "Total Fwd Packets": 0.75, "Destination Port": 0.6, "Init_Win_bytes_forward": 0.55 },
    "DoS GoldenEye": { "Fwd Packets/s": 0.85, "PSH Flag Count": 0.7, "Destination Port": 0.65, "Total Fwd Packets": 0.55 },
    "DoS slowloris": { "Flow Duration": 0.92, "Flow Packets/s": 0.85, "Total Fwd Packets": 0.6, "Destination Port": 0.5 },
    "DoS Slowhttptest": { "Flow Duration": 0.95, "Flow Packets/s": 0.9, "Total Fwd Packets": 0.55, "Destination Port": 0.5 },
    "PortScan": { "Total Fwd Packets": 0.9, "SYN Flag Count": 0.85, "Init_Win_bytes_forward": 0.8, "Forward/Backward ratio": 0.6, "Average Packet Size": 0.4 },
    "FTP-Patator": { "Destination Port": 0.95, "ACK Flag Count": 0.7, "Total Fwd Packets": 0.5 },
    "SSH-Patator": { "Destination Port": 0.95, "ACK Flag Count": 0.7, "Total Fwd Packets": 0.5 },
    "Web Attack \u2013 Brute Force": { "Destination Port": 0.85, "PSH Flag Count": 0.7, "Total Fwd Packets": 0.55 },
    "Web Attack \u2013 Sql Injection": { "Destination Port": 0.8, "Average Packet Size": 0.6, "Total Fwd Packets": 0.5 },
    "Web Attack \u2013 Xss": { "Destination Port": 0.8, "PSH Flag Count": 0.6, "Total Fwd Packets": 0.5 },
    "Bot": { "Destination Port": 0.75, "Flow Duration": 0.6, "Average Packet Size": 0.5 },
    "Infiltration": { "Destination Port": 0.7, "Flow Duration": 0.6, "Average Packet Size": 0.5 },
    "Heartbleed": { "Destination Port": 0.8, "Bwd Packet Length Max": 0.9, "Total Fwd Packets": 0.5 },
    "BENIGN": { "ACK Flag Count": 0.6, "Average Packet Size": 0.5, "Forward/Backward ratio": 0.55 },
  };
  const w = weights[predicted] ?? {};
  for (const c of all) c.influence = w[c.name] ?? 0.25;
  return all
    .filter((c) => c.influence >= 0.4)
    .sort((a, b) => b.influence - a.influence)
    .slice(0, 6)
    .map((c) => ({ ...c, influence: Number(c.influence.toFixed(2)) }));
}

export interface PredictOptions {
  /** When true, call the LLM for a real generative explanation. */
  explain?: boolean;
}

export async function predict(
  features: TrafficFeatureMap,
  opts: PredictOptions = {},
): Promise<AnalysisResult> {
  const start = Date.now();

  // ---- Validate feature set ----
  const provided = Object.keys(features).filter((k) => FEATURE_NAMES.includes(k as never));
  if (provided.length < FEATURE_COUNT) {
    const missing = FEATURE_NAMES.filter((n) => !(n in features));
    throw new Error(
      `Incomplete feature vector. Provided ${provided.length}/${FEATURE_COUNT} features. Missing: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "…" : ""}`,
    );
  }

  // ---- Score + softmax ----
  const raw = classScores(features);
  const probs = softmax(raw, 0.82);

  const ranked = LABELS.map((l) => ({
    label: l.label,
    probability: probs[l.label] ?? 0,
  })).sort((a, b) => b.probability - a.probability);

  const top = ranked[0];
  const meta = LABEL_BY_NAME[top.label];
  const confidence = top.probability;

  const probabilities: ClassProbability[] = ranked.map((r) => {
    const m = LABEL_BY_NAME[r.label];
    return {
      label: r.label,
      display: m.display,
      probability: r.probability,
      isAttack: m.isAttack,
    };
  });

  const contributions = topContributions(features, top.label);

  // ---- Explanation (Gemma role — never invents a detection) ----
  const wantLLM = opts.explain !== false;
  let explanation: string;
  let explanationSource: "llm" | "fallback" = "fallback";
  let investigation: string[];

  if (wantLLM) {
    try {
      const exp = await explainPrediction({
        predictedLabel: top.label,
        predictedDisplay: meta.display,
        isAttack: meta.isAttack,
        threatLevel: meta.severity,
        confidence,
        family: meta.family,
        probabilities: probabilities.slice(0, 5),
        contributions,
        features,
      });
      explanation = exp.explanation;
      investigation = exp.investigation;
      explanationSource = "llm";
    } catch {
      const fb = fallbackExplanation(meta.display, meta.isAttack, meta.severity, confidence, contributions);
      explanation = fb.explanation;
      investigation = fb.investigation;
    }
  } else {
    const fb = fallbackExplanation(meta.display, meta.isAttack, meta.severity, confidence, contributions);
    explanation = fb.explanation;
    investigation = fb.investigation;
  }

  const caveats = [
    "This prediction comes from the sandbox signature-based predictor, not the production Random Forest model.",
    "Model evaluation accuracy (~99.7%) reflects offline test-set performance, not guaranteed live-detection accuracy.",
    "Per-sample feature contributions are local heuristics, not global feature-importance proof of why this flow was classified.",
    "The AI explanation describes an already-computed prediction; it does not perform detection.",
  ];

  return {
    requestId: `cs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    predictedLabel: top.label,
    predictedDisplay: meta.display,
    isAttack: meta.isAttack,
    threatLevel: meta.severity,
    family: meta.family,
    confidence: Number(confidence.toFixed(4)),
    probabilities,
    topContributingFeatures: contributions,
    explanation,
    explanationSource,
    investigation,
    modelName: "RandomForest (sandbox signature predictor)",
    modelVersion: "sandbox-1.0",
    dataset: "CIC-IDS2017 (prepared sample, 300,000 rows)",
    caveats,
    featureCount: FEATURE_COUNT,
    processingMs: Date.now() - start,
  };
}
