// CyberSentinel AI — sample traffic profiles for the analyzer.
// Each sample is a full feature vector (all canonical CIC-IDS2017 flow
// features) crafted to exhibit a recognisable signature so the sandbox
// predictor returns the documented category. These are synthetic illustrative
// flows, NOT captured real traffic.

import { FEATURE_NAMES } from "./features";
import type { SampleProfile, TrafficFeatureMap } from "./types";

/** Benign baseline template — realistic-looking normal HTTP browsing flow. */
function baseBenign(): TrafficFeatureMap {
  const m: TrafficFeatureMap = {};
  for (const n of FEATURE_NAMES) m[n] = 0;
  m["Destination Port"] = 443;
  m["Flow Duration"] = 18_000_000;
  m["Total Fwd Packets"] = 12;
  m["Total Backward Packets"] = 14;
  m["Total Length of Fwd Packets"] = 980;
  m["Total Length of Bwd Packets"] = 14200;
  m["Fwd Packet Length Max"] = 230;
  m["Fwd Packet Length Min"] = 0;
  m["Fwd Packet Length Mean"] = 81;
  m["Fwd Packet Length Std"] = 62;
  m["Bwd Packet Length Max"] = 1460;
  m["Bwd Packet Length Min"] = 0;
  m["Bwd Packet Length Mean"] = 1014;
  m["Bwd Packet Length Std"] = 380;
  m["Flow Bytes/s"] = 1450;
  m["Flow Packets/s"] = 1440;
  m["Flow IAT Mean"] = 1_280_000;
  m["Flow IAT Std"] = 980_000;
  m["Flow IAT Max"] = 4_200_000;
  m["Flow IAT Min"] = 12_000;
  m["Fwd IAT Total"] = 18_000_000;
  m["Fwd IAT Mean"] = 1_500_000;
  m["Fwd IAT Std"] = 1_100_000;
  m["Fwd IAT Max"] = 4_600_000;
  m["Fwd IAT Min"] = 18_000;
  m["Bwd IAT Total"] = 17_600_000;
  m["Bwd IAT Mean"] = 1_350_000;
  m["Bwd IAT Std"] = 990_000;
  m["Bwd IAT Max"] = 4_100_000;
  m["Bwd IAT Min"] = 15_000;
  m["Fwd PSH Flags"] = 6;
  m["Bwd PSH Flags"] = 8;
  m["Fwd URG Flags"] = 0;
  m["Bwd URG Flags"] = 0;
  m["Fwd Header Length"] = 176;
  m["Bwd Header Length"] = 196;
  m["Fwd Packets/s"] = 720;
  m["Bwd Packets/s"] = 840;
  m["Min Packet Length"] = 0;
  m["Max Packet Length"] = 1460;
  m["Packet Length Mean"] = 560;
  m["Packet Length Std"] = 430;
  m["Packet Length Variance"] = 184_900;
  m["FIN Flag Count"] = 2;
  m["SYN Flag Count"] = 1;
  m["PSH Flag Count"] = 10;
  m["ACK Flag Count"] = 24;
  m["URG Flag Count"] = 0;
  m["CWE Flag Count"] = 0;
  m["ECE Flag Count"] = 0;
  m["Down/Up Ratio"] = 1;
  m["Average Packet Size"] = 608;
  m["Avg Fwd Segment Size"] = 81;
  m["Avg Bwd Segment Size"] = 1014;
  m["Fwd Header Length.1"] = 176;
  m["Fwd Avg Bytes/Bulk"] = 0;
  m["Fwd Avg Packets/Bulk"] = 0;
  m["Fwd Avg Bulk Rate"] = 0;
  m["Bwd Avg Bytes/Bulk"] = 0;
  m["Bwd Avg Packets/Bulk"] = 0;
  m["Bwd Avg Bulk Rate"] = 0;
  m["Subflow Fwd Packets"] = 12;
  m["Subflow Fwd Bytes"] = 980;
  m["Subflow Bwd Packets"] = 14;
  m["Subflow Bwd Bytes"] = 14200;
  m["Init_Win_bytes_forward"] = 8192;
  m["Init_Win_bytes_backward"] = 64240;
  m["act_data_pkt_fwd"] = 9;
  m["min_seg_size_forward"] = 32;
  m["Active Mean"] = 1_200_000;
  m["Active Std"] = 780_000;
  m["Active Max"] = 3_400_000;
  m["Active Min"] = 40_000;
  m["Idle Mean"] = 2_800_000;
  m["Idle Std"] = 1_900_000;
  m["Idle Max"] = 8_200_000;
  m["Idle Min"] = 22_000;
  return m;
}

function withOverride(base: TrafficFeatureMap, override: TrafficFeatureMap): TrafficFeatureMap {
  return { ...base, ...override };
}

const benign = baseBenign();

const ddos = withOverride(benign, {
  "Destination Port": 80,
  "Flow Duration": 1_200_000,
  "Total Fwd Packets": 9600,
  "Total Backward Packets": 120,
  "Total Length of Fwd Packets": 576000,
  "Total Length of Bwd Packets": 4800,
  "Fwd Packet Length Max": 60,
  "Fwd Packet Length Min": 60,
  "Fwd Packet Length Mean": 60,
  "Fwd Packet Length Std": 0,
  "Bwd Packet Length Max": 40,
  "Bwd Packet Length Min": 40,
  "Bwd Packet Length Mean": 40,
  "Bwd Packet Length Std": 0,
  "Flow Bytes/s": 57440000,
  "Flow Packets/s": 950000,
  "Flow IAT Mean": 1,
  "Flow IAT Std": 2,
  "Flow IAT Max": 12,
  "Flow IAT Min": 0,
  "Fwd IAT Total": 1_200_000,
  "Fwd IAT Mean": 1,
  "Fwd IAT Std": 2,
  "Fwd IAT Max": 10,
  "Fwd IAT Min": 0,
  "Bwd IAT Total": 1_180_000,
  "Bwd IAT Mean": 9833,
  "Bwd IAT Std": 4200,
  "Bwd IAT Max": 22000,
  "Bwd IAT Min": 1200,
  "Fwd PSH Flags": 0,
  "SYN Flag Count": 9500,
  "PSH Flag Count": 0,
  "ACK Flag Count": 120,
  "FIN Flag Count": 0,
  "Init_Win_bytes_forward": -1,
  "Init_Win_bytes_backward": -1,
  "Average Packet Size": 60,
  "Max Packet Length": 60,
  "Min Packet Length": 40,
  "Packet Length Mean": 60,
  "Packet Length Std": 0,
  "Packet Length Variance": 0,
  "Fwd Packets/s": 940000,
  "Bwd Packets/s": 10000,
  "Down/Up Ratio": 0,
  "Subflow Fwd Packets": 9600,
  "Subflow Fwd Bytes": 576000,
  "Subflow Bwd Packets": 120,
  "Subflow Bwd Bytes": 4800,
  "Fwd Header Length": 57600,
  "Fwd Header Length.1": 57600,
} as TrafficFeatureMap);

const dosHulk = withOverride(benign, {
  "Destination Port": 80,
  "Flow Duration": 3_500_000,
  "Total Fwd Packets": 110,
  "Total Backward Packets": 6,
  "Total Length of Fwd Packets": 28600,
  "Total Length of Bwd Packets": 360,
  "Fwd Packet Length Max": 260,
  "Fwd Packet Length Min": 260,
  "Fwd Packet Length Mean": 260,
  "Fwd Packet Length Std": 0,
  "Bwd Packet Length Max": 60,
  "Bwd Packet Length Min": 60,
  "Bwd Packet Length Mean": 60,
  "Bwd Packet Length Std": 0,
  "Flow Bytes/s": 9257,
  "Flow Packets/s": 35428,
  "Flow IAT Mean": 31,
  "Flow IAT Std": 41,
  "Flow IAT Max": 180,
  "Flow IAT Min": 9,
  "Fwd IAT Mean": 31,
  "Fwd IAT Std": 40,
  "Fwd IAT Max": 175,
  "Fwd IAT Min": 9,
  "SYN Flag Count": 2,
  "PSH Flag Count": 108,
  "ACK Flag Count": 6,
  "FIN Flag Count": 0,
  "Init_Win_bytes_forward": -1,
  "Init_Win_bytes_backward": -1,
  "Average Packet Size": 260,
  "Fwd Packets/s": 31428,
  "Bwd Packets/s": 1714,
  "Down/Up Ratio": 0,
  "Subflow Fwd Packets": 110,
  "Subflow Fwd Bytes": 28600,
  "Subflow Bwd Packets": 6,
  "Subflow Bwd Bytes": 360,
} as TrafficFeatureMap);

const dosSlowloris = withOverride(benign, {
  "Destination Port": 80,
  "Flow Duration": 42_000_000,
  "Total Fwd Packets": 9,
  "Total Backward Packets": 5,
  "Total Length of Fwd Packets": 540,
  "Total Length of Bwd Packets": 300,
  "Fwd Packet Length Max": 60,
  "Bwd Packet Length Max": 60,
  "Flow Bytes/s": 8400,
  "Flow Packets/s": 130,
  "Flow IAT Mean": 3_000_000,
  "Flow IAT Std": 2_100_000,
  "Flow IAT Max": 9_000_000,
  "Flow IAT Min": 200_000,
  "Fwd IAT Mean": 4_600_000,
  "Idle Mean": 6_500_000,
  "SYN Flag Count": 2,
  "PSH Flag Count": 5,
  "ACK Flag Count": 6,
  "Init_Win_bytes_forward": -1,
  "Average Packet Size": 60,
  "Fwd Packets/s": 90,
  "Bwd Packets/s": 40,
  "Down/Up Ratio": 0,
  "Subflow Fwd Packets": 9,
  "Subflow Bwd Packets": 5,
} as TrafficFeatureMap);

const dosSlowhttptest = withOverride(benign, {
  "Destination Port": 80,
  "Flow Duration": 78_000_000,
  "Total Fwd Packets": 3,
  "Total Backward Packets": 2,
  "Total Length of Fwd Packets": 180,
  "Total Length of Bwd Packets": 120,
  "Flow Bytes/s": 3.8,
  "Flow Packets/s": 12,
  "Flow IAT Mean": 15_000_000,
  "Flow IAT Std": 9_000_000,
  "Flow IAT Max": 30_000_000,
  "Flow IAT Min": 2_000_000,
  "Idle Mean": 22_000_000,
  "SYN Flag Count": 1,
  "PSH Flag Count": 2,
  "ACK Flag Count": 2,
  "Init_Win_bytes_forward": -1,
  "Average Packet Size": 60,
  "Fwd Packets/s": 12,
  "Bwd Packets/s": 12,
  "Down/Up Ratio": 0,
  "Subflow Fwd Packets": 3,
  "Subflow Bwd Packets": 2,
} as TrafficFeatureMap);

const portScan = withOverride(benign, {
  "Destination Port": 0,
  "Flow Duration": 7_000_000,
  "Total Fwd Packets": 48,
  "Total Backward Packets": 0,
  "Total Length of Fwd Packets": 1440,
  "Total Length of Bwd Packets": 0,
  "Fwd Packet Length Max": 30,
  "Bwd Packet Length Max": 0,
  "Flow Bytes/s": 205,
  "Flow Packets/s": 6857,
  "Flow IAT Mean": 145,
  "Flow IAT Std": 210,
  "Flow IAT Max": 900,
  "Flow IAT Min": 40,
  "SYN Flag Count": 48,
  "PSH Flag Count": 0,
  "ACK Flag Count": 0,
  "FIN Flag Count": 0,
  "Init_Win_bytes_forward": -1,
  "Init_Win_bytes_backward": -1,
  "Average Packet Size": 30,
  "Fwd Packets/s": 6857,
  "Bwd Packets/s": 0,
  "Down/Up Ratio": 0,
  "Subflow Fwd Packets": 48,
  "Subflow Fwd Bytes": 1440,
  "Subflow Bwd Packets": 0,
  "Subflow Bwd Bytes": 0,
  "Max Packet Length": 30,
  "Min Packet Length": 30,
  "Packet Length Mean": 30,
  "Packet Length Std": 0,
  "Packet Length Variance": 0,
} as TrafficFeatureMap);

const sshPatator = withOverride(benign, {
  "Destination Port": 22,
  "Flow Duration": 9_000_000,
  "Total Fwd Packets": 22,
  "Total Backward Packets": 20,
  "Total Length of Fwd Packets": 1320,
  "Total Length of Bwd Packets": 2400,
  "Fwd Packet Length Max": 60,
  "Bwd Packet Length Max": 120,
  "Bwd Packet Length Mean": 120,
  "Flow Bytes/s": 413,
  "Flow Packets/s": 4666,
  "Flow IAT Mean": 214,
  "Flow IAT Std": 180,
  "SYN Flag Count": 2,
  "PSH Flag Count": 12,
  "ACK Flag Count": 38,
  "Init_Win_bytes_forward": 8192,
  "Init_Win_bytes_backward": 8192,
  "Average Packet Size": 88,
  "Fwd Packets/s": 2444,
  "Bwd Packets/s": 2222,
  "Down/Up Ratio": 0,
  "Subflow Fwd Packets": 22,
  "Subflow Bwd Packets": 20,
} as TrafficFeatureMap);

const ftpPatator = withOverride(benign, {
  "Destination Port": 21,
  "Flow Duration": 6_000_000,
  "Total Fwd Packets": 18,
  "Total Backward Packets": 16,
  "Total Length of Fwd Packets": 720,
  "Total Length of Bwd Packets": 1600,
  "Fwd Packet Length Max": 40,
  "Bwd Packet Length Max": 100,
  "Bwd Packet Length Mean": 100,
  "Flow Bytes/s": 386,
  "Flow Packets/s": 5666,
  "Flow IAT Mean": 176,
  "SYN Flag Count": 2,
  "PSH Flag Count": 10,
  "ACK Flag Count": 32,
  "Init_Win_bytes_forward": 8192,
  "Init_Win_bytes_backward": 8192,
  "Average Packet Size": 67,
  "Fwd Packets/s": 3000,
  "Bwd Packets/s": 2666,
  "Down/Up Ratio": 0,
  "Subflow Fwd Packets": 18,
  "Subflow Bwd Packets": 16,
} as TrafficFeatureMap);

const webSql = withOverride(benign, {
  "Destination Port": 80,
  "Flow Duration": 2_400_000,
  "Total Fwd Packets": 6,
  "Total Backward Packets": 4,
  "Total Length of Fwd Packets": 1340,
  "Total Length of Bwd Packets": 1800,
  "Fwd Packet Length Max": 1380,
  "Fwd Packet Length Min": 0,
  "Fwd Packet Length Mean": 223,
  "Fwd Packet Length Std": 410,
  "Bwd Packet Length Max": 1460,
  "Bwd Packet Length Mean": 450,
  "Max Packet Length": 1460,
  "Packet Length Mean": 312,
  "Packet Length Std": 480,
  "Packet Length Variance": 230_400,
  "Flow Bytes/s": 1308,
  "Flow Packets/s": 4166,
  "SYN Flag Count": 1,
  "PSH Flag Count": 5,
  "ACK Flag Count": 8,
  "Init_Win_bytes_forward": 8192,
  "Average Packet Size": 312,
  "Fwd Packets/s": 2500,
  "Bwd Packets/s": 1666,
  "Down/Up Ratio": 0,
  "Subflow Fwd Packets": 6,
  "Subflow Bwd Packets": 4,
} as TrafficFeatureMap);

const webXss = withOverride(benign, {
  "Destination Port": 80,
  "Flow Duration": 1_900_000,
  "Total Fwd Packets": 7,
  "Total Backward Packets": 5,
  "Total Length of Fwd Packets": 820,
  "Total Length of Bwd Packets": 2100,
  "Fwd Packet Length Max": 420,
  "Fwd Packet Length Mean": 117,
  "Bwd Packet Length Max": 1460,
  "Max Packet Length": 1460,
  "Packet Length Mean": 243,
  "Packet Length Std": 35,
  "Packet Length Variance": 1225,
  "Flow Bytes/s": 1536,
  "Flow Packets/s": 6315,
  "SYN Flag Count": 1,
  "PSH Flag Count": 9,
  "ACK Flag Count": 11,
  "Init_Win_bytes_forward": 8192,
  "Average Packet Size": 243,
  "Fwd Packets/s": 3684,
  "Bwd Packets/s": 2631,
  "Down/Up Ratio": 0,
  "Subflow Fwd Packets": 7,
  "Subflow Bwd Packets": 5,
} as TrafficFeatureMap);

const heartbleed = withOverride(benign, {
  "Destination Port": 444,
  "Flow Duration": 5_000_000,
  "Total Fwd Packets": 4,
  "Total Backward Packets": 2,
  "Total Length of Fwd Packets": 320,
  "Total Length of Bwd Packets": 65540,
  "Fwd Packet Length Max": 80,
  "Bwd Packet Length Max": 16400,
  "Bwd Packet Length Mean": 32770,
  "Bwd Packet Length Std": 0,
  "Max Packet Length": 16400,
  "Average Packet Size": 16460,
  "Flow Bytes/s": 13752,
  "Flow Packets/s": 1200,
  "SYN Flag Count": 1,
  "PSH Flag Count": 3,
  "ACK Flag Count": 5,
  "Init_Win_bytes_forward": 8192,
  "Init_Win_bytes_backward": -1,
  "Down/Up Ratio": 0,
  "Subflow Fwd Packets": 4,
  "Subflow Bwd Packets": 2,
  "Subflow Bwd Bytes": 65540,
} as TrafficFeatureMap);

const infiltration = withOverride(benign, {
  "Destination Port": 4444,
  "Flow Duration": 18_000_000,
  "Total Fwd Packets": 11,
  "Total Backward Packets": 4,
  "Total Length of Fwd Packets": 2200,
  "Total Length of Bwd Packets": 1800,
  "Fwd Packet Length Max": 340,
  "Bwd Packet Length Max": 720,
  "Average Packet Size": 337,
  "Flow Bytes/s": 222,
  "Flow Packets/s": 833,
  "Active Mean": 3_600_000,
  "Active Std": 1_400_000,
  "Active Max": 7_200_000,
  "Flow IAT Mean": 1_600_000,
  "Fwd IAT Mean": 1_700_000,
  "SYN Flag Count": 2,
  "PSH Flag Count": 7,
  "ACK Flag Count": 10,
  "Init_Win_bytes_forward": 8192,
  "Init_Win_bytes_backward": -1,
  "Fwd Packets/s": 611,
  "Bwd Packets/s": 222,
  "Down/Up Ratio": 0,
  "Subflow Fwd Packets": 11,
  "Subflow Bwd Packets": 4,
} as TrafficFeatureMap);

const bot = withOverride(benign, {
  "Destination Port": 6667,
  "Flow Duration": 28_000_000,
  "Total Fwd Packets": 12,
  "Total Backward Packets": 10,
  "Total Length of Fwd Packets": 1800,
  "Total Length of Bwd Packets": 4200,
  "Fwd Packet Length Max": 480,
  "Bwd Packet Length Max": 1460,
  "Bwd Packet Length Mean": 420,
  "Average Packet Size": 272,
  "Flow Bytes/s": 214,
  "Flow Packets/s": 785,
  "Fwd IAT Mean": 2_300_000,
  "Active Mean": 1_400_000,
  "SYN Flag Count": 1,
  "PSH Flag Count": 9,
  "ACK Flag Count": 20,
  "Init_Win_bytes_forward": 8192,
  "Init_Win_bytes_backward": -1,
  "Fwd Packets/s": 428,
  "Bwd Packets/s": 357,
  "Down/Up Ratio": 0,
  "Subflow Fwd Packets": 12,
  "Subflow Bwd Packets": 10,
} as TrafficFeatureMap);

export const SAMPLE_PROFILES: SampleProfile[] = [
  { id: "benign", name: "Benign HTTPS browsing", description: "Normal bidirectional TLS web session, balanced traffic.", expectedLabel: "BENIGN", expectedDisplay: "BENIGN", features: benign },
  { id: "ddos", name: "DDoS SYN flood", description: "High-rate SYN flood, ~950k pkt/s, mostly forward, unset window.", expectedLabel: "DDoS", expectedDisplay: "DDoS", features: ddos },
  { id: "dos-hulk", name: "DoS Hulk HTTP flood", description: "High-volume HTTP POST flood, PSH-heavy, port 80.", expectedLabel: "DoS Hulk", expectedDisplay: "DoS Hulk", features: dosHulk },
  { id: "dos-slowloris", name: "DoS slowloris", description: "Slow partial-header attack, long duration, very low rate.", expectedLabel: "DoS slowloris", expectedDisplay: "DoS slowloris", features: dosSlowloris },
  { id: "dos-slowhttptest", name: "DoS Slowhttptest", description: "Slow HTTP attack, very long duration, extremely low rate.", expectedLabel: "DoS Slowhttptest", expectedDisplay: "DoS Slowhttptest", features: dosSlowhttptest },
  { id: "portscan", name: "Port scan", description: "SYN sweep across ports, forward-only, unset window.", expectedLabel: "PortScan", expectedDisplay: "PortScan", features: portScan },
  { id: "ssh-patator", name: "SSH brute force", description: "SSH-Patator password brute force against port 22.", expectedLabel: "SSH-Patator", expectedDisplay: "SSH-Patator", features: sshPatator },
  { id: "ftp-patator", name: "FTP brute force", description: "FTP-Patator password brute force against port 21.", expectedLabel: "FTP-Patator", expectedDisplay: "FTP-Patator", features: ftpPatator },
  { id: "web-sqli", name: "Web Attack – SQL Injection", description: "Web request exhibiting SQL-injection payload variance, port 80.", expectedLabel: "Web Attack \u2013 Sql Injection", expectedDisplay: "Web Attack – SQL Injection", features: webSql },
  { id: "web-xss", name: "Web Attack – XSS", description: "Web request exhibiting cross-site-scripting payload, port 80.", expectedLabel: "Web Attack \u2013 Xss", expectedDisplay: "Web Attack – XSS", features: webXss },
  { id: "heartbleed", name: "Heartbleed exploit", description: "Heartbleed memory-leak response, oversized backward payload, port 444.", expectedLabel: "Heartbleed", expectedDisplay: "Heartbleed", features: heartbleed },
  { id: "infiltration", name: "Infiltration", description: "Post-exploitation / internal movement behaviour, port 4444.", expectedLabel: "Infiltration", expectedDisplay: "Infiltration", features: infiltration },
  { id: "bot", name: "Bot / C2", description: "Botnet command-and-control style flow, IRC port 6667.", expectedLabel: "Bot", expectedDisplay: "Bot", features: bot },
];

export function sampleById(id: string): SampleProfile | undefined {
  return SAMPLE_PROFILES.find((s) => s.id === id);
}
