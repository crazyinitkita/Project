// CyberSentinel AI — the 15 output categories of the trained classifier.
// `label`  = exact value returned by the model (original labels preserved).
// `display`= clean label for the UI (handles CSV encoding artefacts on web
//            attacks without altering the underlying model labels).

import type { ModelClassInfo, ThreatLevel } from "./types";

export interface LabelMeta {
  label: string;
  display: string;
  isAttack: boolean;
  family: string;
  severity: ThreatLevel;
  summary: string;
  trainingCount: number;
}

export const LABELS: LabelMeta[] = [
  {
    label: "BENIGN",
    display: "BENIGN",
    isAttack: false,
    family: "Normal",
    severity: "benign",
    summary: "Normal, non-malicious background traffic.",
    trainingCount: 240724,
  },
  {
    label: "Bot",
    display: "Bot",
    isAttack: true,
    family: "Botnet",
    severity: "high",
    summary: "Traffic consistent with botnet command-and-control or infected-host behaviour.",
    trainingCount: 208,
  },
  {
    label: "DDoS",
    display: "DDoS",
    isAttack: true,
    family: "Denial of Service",
    severity: "critical",
    summary: "Distributed flood intended to exhaust target bandwidth or resources.",
    trainingCount: 13582,
  },
  {
    label: "DoS GoldenEye",
    display: "DoS GoldenEye",
    isAttack: true,
    family: "Denial of Service",
    severity: "high",
    summary: "HTTP-layer DoS tool that keeps connections open to exhaust worker threads.",
    trainingCount: 1092,
  },
  {
    label: "DoS Hulk",
    display: "DoS Hulk",
    isAttack: true,
    family: "Denial of Service",
    severity: "critical",
    summary: "High-volume HTTP POST flood DoS tool.",
    trainingCount: 24413,
  },
  {
    label: "DoS Slowhttptest",
    display: "DoS Slowhttptest",
    isAttack: true,
    family: "Denial of Service",
    severity: "high",
    summary: "Slow HTTP attacks (slow headers / body / read) to drain server pools.",
    trainingCount: 583,
  },
  {
    label: "DoS slowloris",
    display: "DoS slowloris",
    isAttack: true,
    family: "Denial of Service",
    severity: "high",
    summary: "Opens many connections and sends partial HTTP headers to hold sockets.",
    trainingCount: 615,
  },
  {
    label: "FTP-Patator",
    display: "FTP-Patator",
    isAttack: true,
    family: "Brute Force",
    severity: "medium",
    summary: "Password brute-force tool targeting FTP services.",
    trainingCount: 842,
  },
  {
    label: "Heartbleed",
    display: "Heartbleed",
    isAttack: true,
    family: "Exploit",
    severity: "critical",
    summary: "Exploitation of the OpenSSL Heartbleed vulnerability to leak memory.",
    trainingCount: 11,
  },
  {
    label: "Infiltration",
    display: "Infiltration",
    isAttack: true,
    family: "Exploit",
    severity: "critical",
    summary: "Post-exploitation / internal movement behaviour from an infiltration scenario.",
    trainingCount: 36,
  },
  {
    label: "PortScan",
    display: "PortScan",
    isAttack: true,
    family: "Reconnaissance",
    severity: "medium",
    summary: "Network port scanning to discover open services and hosts.",
    trainingCount: 16847,
  },
  {
    label: "SSH-Patator",
    display: "SSH-Patator",
    isAttack: true,
    family: "Brute Force",
    severity: "medium",
    summary: "Password brute-force tool targeting SSH services.",
    trainingCount: 626,
  },
  {
    label: "Web Attack \u2013 Brute Force",
    display: "Web Attack – Brute Force",
    isAttack: true,
    family: "Web Attack",
    severity: "medium",
    summary: "Credential brute-force against web login forms.",
    trainingCount: 200,
  },
  {
    label: "Web Attack \u2013 Sql Injection",
    display: "Web Attack – SQL Injection",
    isAttack: true,
    family: "Web Attack",
    severity: "critical",
    summary: "SQL injection attempt against a web application input.",
    trainingCount: 21,
  },
  {
    label: "Web Attack \u2013 Xss",
    display: "Web Attack – XSS",
    isAttack: true,
    family: "Web Attack",
    severity: "high",
    summary: "Cross-site scripting attempt against a web application input.",
    trainingCount: 200,
  },
];

export const LABEL_COUNT = LABELS.length;

export const LABEL_BY_NAME: Record<string, LabelMeta> = Object.fromEntries(
  LABELS.map((l) => [l.label, l]),
);

export function labelToClassInfo(l: LabelMeta): ModelClassInfo {
  const total = LABELS.reduce((s, x) => s + x.trainingCount, 0);
  return {
    label: l.label,
    display: l.display,
    isAttack: l.isAttack,
    trainingCount: l.trainingCount,
    share: l.trainingCount / total,
    severity: l.severity,
    family: l.family,
    summary: l.summary,
  };
}

export function severityColor(sev: ThreatLevel): string {
  switch (sev) {
    case "benign": return "emerald";
    case "low": return "teal";
    case "medium": return "amber";
    case "high": return "orange";
    case "critical": return "rose";
  }
}
