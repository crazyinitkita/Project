// CyberSentinel AI — the 78 trained numeric features (CIC-IDS2017 flow features).
// Names match the trained model's feature_names exactly. Do not rename, reorder
// incorrectly, or silently substitute values. Grouping is for UI ergonomics only
// and does NOT change the contract sent to the model.

export type FeatureCategory =
  | "Flow Identity"
  | "Packet Counts"
  | "Packet Lengths"
  | "Flow Rates"
  | "Inter-Arrival Time"
  | "TCP Flags"
  | "Header Length"
  | "Packet Size Stats"
  | "Bulk Transfer"
  | "Subflow"
  | "Window & Segment"
  | "Active / Idle";

export interface FeatureMeta {
  name: string;
  category: FeatureCategory;
  description: string;
  unit: string;
  /** typical benign range (loosely, for input sanity only) */
  typical: [number, number];
}

export const FEATURE_NAMES = [
  // ---- Flow Identity ----
  "Destination Port",
  "Flow Duration",
  // ---- Packet Counts ----
  "Total Fwd Packets",
  "Total Backward Packets",
  "Total Length of Fwd Packets",
  "Total Length of Bwd Packets",
  // ---- Packet Lengths (Fwd) ----
  "Fwd Packet Length Max",
  "Fwd Packet Length Min",
  "Fwd Packet Length Mean",
  "Fwd Packet Length Std",
  // ---- Packet Lengths (Bwd) ----
  "Bwd Packet Length Max",
  "Bwd Packet Length Min",
  "Bwd Packet Length Mean",
  "Bwd Packet Length Std",
  // ---- Flow Rates ----
  "Flow Bytes/s",
  "Flow Packets/s",
  // ---- Inter-Arrival Time (Flow) ----
  "Flow IAT Mean",
  "Flow IAT Std",
  "Flow IAT Max",
  "Flow IAT Min",
  // ---- IAT (Fwd) ----
  "Fwd IAT Total",
  "Fwd IAT Mean",
  "Fwd IAT Std",
  "Fwd IAT Max",
  "Fwd IAT Min",
  // ---- IAT (Bwd) ----
  "Bwd IAT Total",
  "Bwd IAT Mean",
  "Bwd IAT Std",
  "Bwd IAT Max",
  "Bwd IAT Min",
  // ---- TCP Flags (counts) ----
  "Fwd PSH Flags",
  "Bwd PSH Flags",
  "Fwd URG Flags",
  "Bwd URG Flags",
  // ---- Header Length ----
  "Fwd Header Length",
  "Bwd Header Length",
  // ---- Flow Rates (directional) ----
  "Fwd Packets/s",
  "Bwd Packets/s",
  // ---- Packet Size Stats ----
  "Min Packet Length",
  "Max Packet Length",
  "Packet Length Mean",
  "Packet Length Std",
  "Packet Length Variance",
  // ---- TCP Flag counts ----
  "FIN Flag Count",
"SYN Flag Count",
"RST Flag Count",
"PSH Flag Count",
"ACK Flag Count",
"URG Flag Count",
"CWE Flag Count",
"ECE Flag Count",
  // ---- Ratio / size ----
  "Down/Up Ratio",
  "Average Packet Size",
  "Avg Fwd Segment Size",
  "Avg Bwd Segment Size",
  "Fwd Header Length.1",
  // ---- Bulk Transfer (Fwd) ----
  "Fwd Avg Bytes/Bulk",
  "Fwd Avg Packets/Bulk",
  "Fwd Avg Bulk Rate",
  // ---- Bulk Transfer (Bwd) ----
  "Bwd Avg Bytes/Bulk",
  "Bwd Avg Packets/Bulk",
  "Bwd Avg Bulk Rate",
  // ---- Subflow ----
  "Subflow Fwd Packets",
  "Subflow Fwd Bytes",
  "Subflow Bwd Packets",
  "Subflow Bwd Bytes",
  // ---- Window & Segment ----
  "Init_Win_bytes_forward",
  "Init_Win_bytes_backward",
  "act_data_pkt_fwd",
  "min_seg_size_forward",
  // ---- Active ----
  "Active Mean",
  "Active Std",
  "Active Max",
  "Active Min",
  // ---- Idle ----
  "Idle Mean",
  "Idle Std",
  "Idle Max",
  "Idle Min",
] as const;

export const FEATURE_COUNT = FEATURE_NAMES.length;

export const FEATURE_METADATA: Record<string, FeatureMeta> = {
  "Destination Port": { name: "Destination Port", category: "Flow Identity", description: "TCP/UDP destination port of the flow.", unit: "port", typical: [0, 65535] },
  "Flow Duration": { name: "Flow Duration", category: "Flow Identity", description: "Duration of the flow in microseconds.", unit: "µs", typical: [0, 120000000] },
  "Total Fwd Packets": { name: "Total Fwd Packets", category: "Packet Counts", description: "Total packets in the forward direction.", unit: "pkts", typical: [1, 200] },
  "Total Backward Packets": { name: "Total Backward Packets", category: "Packet Counts", description: "Total packets in the backward direction.", unit: "pkts", typical: [0, 200] },
  "Total Length of Fwd Packets": { name: "Total Length of Fwd Packets", category: "Packet Counts", description: "Total bytes in the forward direction.", unit: "B", typical: [0, 200000] },
  "Total Length of Bwd Packets": { name: "Total Length of Bwd Packets", category: "Packet Counts", description: "Total bytes in the backward direction.", unit: "B", typical: [0, 200000] },
  "Fwd Packet Length Max": { name: "Fwd Packet Length Max", category: "Packet Lengths", description: "Max payload size in forward direction.", unit: "B", typical: [0, 1500] },
  "Fwd Packet Length Min": { name: "Fwd Packet Length Min", category: "Packet Lengths", description: "Min payload size in forward direction.", unit: "B", typical: [0, 1500] },
  "Fwd Packet Length Mean": { name: "Fwd Packet Length Mean", category: "Packet Lengths", description: "Mean payload size in forward direction.", unit: "B", typical: [0, 1500] },
  "Fwd Packet Length Std": { name: "Fwd Packet Length Std", category: "Packet Lengths", description: "Std dev of forward payload size.", unit: "B", typical: [0, 1500] },
  "Bwd Packet Length Max": { name: "Bwd Packet Length Max", category: "Packet Lengths", description: "Max payload size in backward direction.", unit: "B", typical: [0, 1500] },
  "Bwd Packet Length Min": { name: "Bwd Packet Length Min", category: "Packet Lengths", description: "Min payload size in backward direction.", unit: "B", typical: [0, 1500] },
  "Bwd Packet Length Mean": { name: "Bwd Packet Length Mean", category: "Packet Lengths", description: "Mean payload size in backward direction.", unit: "B", typical: [0, 1500] },
  "Bwd Packet Length Std": { name: "Bwd Packet Length Std", category: "Packet Lengths", description: "Std dev of backward payload size.", unit: "B", typical: [0, 1500] },
  "Flow Bytes/s": { name: "Flow Bytes/s", category: "Flow Rates", description: "Bytes transferred per second.", unit: "B/s", typical: [0, 10000000] },
  "Flow Packets/s": { name: "Flow Packets/s", category: "Flow Rates", description: "Packets transferred per second.", unit: "pkt/s", typical: [0, 2000000] },
  "Flow IAT Mean": { name: "Flow IAT Mean", category: "Inter-Arrival Time", description: "Mean inter-arrival time of packets.", unit: "µs", typical: [0, 50000000] },
  "Flow IAT Std": { name: "Flow IAT Std", category: "Inter-Arrival Time", description: "Std dev of flow inter-arrival time.", unit: "µs", typical: [0, 50000000] },
  "Flow IAT Max": { name: "Flow IAT Max", category: "Inter-Arrival Time", description: "Max flow inter-arrival time.", unit: "µs", typical: [0, 120000000] },
  "Flow IAT Min": { name: "Flow IAT Min", category: "Inter-Arrival Time", description: "Min flow inter-arrival time.", unit: "µs", typical: [0, 50000000] },
  "Fwd IAT Total": { name: "Fwd IAT Total", category: "Inter-Arrival Time", description: "Total forward inter-arrival time.", unit: "µs", typical: [0, 120000000] },
  "Fwd IAT Mean": { name: "Fwd IAT Mean", category: "Inter-Arrival Time", description: "Mean forward inter-arrival time.", unit: "µs", typical: [0, 50000000] },
  "Fwd IAT Std": { name: "Fwd IAT Std", category: "Inter-Arrival Time", description: "Std dev of forward inter-arrival time.", unit: "µs", typical: [0, 50000000] },
  "Fwd IAT Max": { name: "Fwd IAT Max", category: "Inter-Arrival Time", description: "Max forward inter-arrival time.", unit: "µs", typical: [0, 120000000] },
  "Fwd IAT Min": { name: "Fwd IAT Min", category: "Inter-Arrival Time", description: "Min forward inter-arrival time.", unit: "µs", typical: [0, 50000000] },
  "Bwd IAT Total": { name: "Bwd IAT Total", category: "Inter-Arrival Time", description: "Total backward inter-arrival time.", unit: "µs", typical: [0, 120000000] },
  "Bwd IAT Mean": { name: "Bwd IAT Mean", category: "Inter-Arrival Time", description: "Mean backward inter-arrival time.", unit: "µs", typical: [0, 50000000] },
  "Bwd IAT Std": { name: "Bwd IAT Std", category: "Inter-Arrival Time", description: "Std dev of backward inter-arrival time.", unit: "µs", typical: [0, 50000000] },
  "Bwd IAT Max": { name: "Bwd IAT Max", category: "Inter-Arrival Time", description: "Max backward inter-arrival time.", unit: "µs", typical: [0, 120000000] },
  "Bwd IAT Min": { name: "Bwd IAT Min", category: "Inter-Arrival Time", description: "Min backward inter-arrival time.", unit: "µs", typical: [0, 50000000] },
  "Fwd PSH Flags": { name: "Fwd PSH Flags", category: "TCP Flags", description: "PSH flags in forward direction.", unit: "count", typical: [0, 200] },
  "Bwd PSH Flags": { name: "Bwd PSH Flags", category: "TCP Flags", description: "PSH flags in backward direction.", unit: "count", typical: [0, 200] },
  "Fwd URG Flags": { name: "Fwd URG Flags", category: "TCP Flags", description: "URG flags in forward direction.", unit: "count", typical: [0, 200] },
  "Bwd URG Flags": { name: "Bwd URG Flags", category: "TCP Flags", description: "URG flags in backward direction.", unit: "count", typical: [0, 200] },
  "Fwd Header Length": { name: "Fwd Header Length", category: "Header Length", description: "Bytes used for headers in forward direction.", unit: "B", typical: [0, 50000] },
  "Bwd Header Length": { name: "Bwd Header Length", category: "Header Length", description: "Bytes used for headers in backward direction.", unit: "B", typical: [0, 50000] },
  "Fwd Packets/s": { name: "Fwd Packets/s", category: "Flow Rates", description: "Forward packets per second.", unit: "pkt/s", typical: [0, 2000000] },
  "Bwd Packets/s": { name: "Bwd Packets/s", category: "Flow Rates", description: "Backward packets per second.", unit: "pkt/s", typical: [0, 2000000] },
  "Min Packet Length": { name: "Min Packet Length", category: "Packet Size Stats", description: "Minimum packet size.", unit: "B", typical: [0, 1500] },
  "Max Packet Length": { name: "Max Packet Length", category: "Packet Size Stats", description: "Maximum packet size.", unit: "B", typical: [0, 1500] },
  "Packet Length Mean": { name: "Packet Length Mean", category: "Packet Size Stats", description: "Mean packet size.", unit: "B", typical: [0, 1500] },
  "Packet Length Std": { name: "Packet Length Std", category: "Packet Size Stats", description: "Std dev of packet size.", unit: "B", typical: [0, 1500] },
  "Packet Length Variance": { name: "Packet Length Variance", category: "Packet Size Stats", description: "Variance of packet size.", unit: "B²", typical: [0, 2250000] },
  "FIN Flag Count": { name: "FIN Flag Count", category: "TCP Flags", description: "Number of FIN flags.", unit: "count", typical: [0, 200] },
  "SYN Flag Count": { name: "SYN Flag Count", category: "TCP Flags", description: "Number of SYN flags.", unit: "count", typical: [0, 200] },
  "PSH Flag Count": { name: "PSH Flag Count", category: "TCP Flags", description: "Number of PSH flags.", unit: "count", typical: [0, 200] },
  "ACK Flag Count": { name: "ACK Flag Count", category: "TCP Flags", description: "Number of ACK flags.", unit: "count", typical: [0, 200] },
  "URG Flag Count": { name: "URG Flag Count", category: "TCP Flags", description: "Number of URG flags.", unit: "count", typical: [0, 200] },
  "CWE Flag Count": { name: "CWE Flag Count", category: "TCP Flags", description: "Number of CWR/ECE flags.", unit: "count", typical: [0, 200] },
  "ECE Flag Count": { name: "ECE Flag Count", category: "TCP Flags", description: "Number of ECE flags.", unit: "count", typical: [0, 200] },
  "Down/Up Ratio": { name: "Down/Up Ratio", category: "Packet Size Stats", description: "Down/up ratio of packets.", unit: "ratio", typical: [0, 1000] },
  "Average Packet Size": { name: "Average Packet Size", category: "Packet Size Stats", description: "Average size of a packet.", unit: "B", typical: [0, 1500] },
  "Avg Fwd Segment Size": { name: "Avg Fwd Segment Size", category: "Window & Segment", description: "Average forward segment size.", unit: "B", typical: [0, 1500] },
  "Avg Bwd Segment Size": { name: "Avg Bwd Segment Size", category: "Window & Segment", description: "Average backward segment size.", unit: "B", typical: [0, 1500] },
  "Fwd Header Length.1": { name: "Fwd Header Length.1", category: "Header Length", description: "Forward header length (duplicate column in source dataset).", unit: "B", typical: [0, 50000] },
  "Fwd Avg Bytes/Bulk": { name: "Fwd Avg Bytes/Bulk", category: "Bulk Transfer", description: "Average bytes per bulk in forward direction.", unit: "B", typical: [0, 1500] },
  "Fwd Avg Packets/Bulk": { name: "Fwd Avg Packets/Bulk", category: "Bulk Transfer", description: "Average packets per bulk forward.", unit: "pkts", typical: [0, 100] },
  "Fwd Avg Bulk Rate": { name: "Fwd Avg Bulk Rate", category: "Bulk Transfer", description: "Forward bulk rate.", unit: "B/s", typical: [0, 1000000] },
  "Bwd Avg Bytes/Bulk": { name: "Bwd Avg Bytes/Bulk", category: "Bulk Transfer", description: "Average bytes per bulk backward.", unit: "B", typical: [0, 1500] },
  "Bwd Avg Packets/Bulk": { name: "Bwd Avg Packets/Bulk", category: "Bulk Transfer", description: "Average packets per bulk backward.", unit: "pkts", typical: [0, 100] },
  "Bwd Avg Bulk Rate": { name: "Bwd Avg Bulk Rate", category: "Bulk Transfer", description: "Backward bulk rate.", unit: "B/s", typical: [0, 1000000] },
  "Subflow Fwd Packets": { name: "Subflow Fwd Packets", category: "Subflow", description: "Forward packets in subflow.", unit: "pkts", typical: [1, 200] },
  "Subflow Fwd Bytes": { name: "Subflow Fwd Bytes", category: "Subflow", description: "Forward bytes in subflow.", unit: "B", typical: [0, 200000] },
  "Subflow Bwd Packets": { name: "Subflow Bwd Packets", category: "Subflow", description: "Backward packets in subflow.", unit: "pkts", typical: [0, 200] },
  "Subflow Bwd Bytes": { name: "Subflow Bwd Bytes", category: "Subflow", description: "Backward bytes in subflow.", unit: "B", typical: [0, 200000] },
  "Init_Win_bytes_forward": { name: "Init_Win_bytes_forward", category: "Window & Segment", description: "Initial window bytes in forward direction.", unit: "B", typical: [-1, 65535] },
  "Init_Win_bytes_backward": { name: "Init_Win_bytes_backward", category: "Window & Segment", description: "Initial window bytes in backward direction.", unit: "B", typical: [-1, 65535] },
  "act_data_pkt_fwd": { name: "act_data_pkt_fwd", category: "Window & Segment", description: "Forward packets with at least 1 byte of payload.", unit: "pkts", typical: [0, 200] },
  "min_seg_size_forward": { name: "min_seg_size_forward", category: "Window & Segment", description: "Minimum segment size forward.", unit: "B", typical: [0, 1500] },
  "Active Mean": { name: "Active Mean", category: "Active / Idle", description: "Mean time a flow was active before becoming idle.", unit: "µs", typical: [0, 10000000] },
  "Active Std": { name: "Active Std", category: "Active / Idle", description: "Std dev of active time.", unit: "µs", typical: [0, 10000000] },
  "Active Max": { name: "Active Max", category: "Active / Idle", description: "Max active time.", unit: "µs", typical: [0, 10000000] },
  "Active Min": { name: "Active Min", category: "Active / Idle", description: "Min active time.", unit: "µs", typical: [0, 10000000] },
  "Idle Mean": { name: "Idle Mean", category: "Active / Idle", description: "Mean idle time.", unit: "µs", typical: [0, 100000000] },
  "Idle Std": { name: "Idle Std", category: "Active / Idle", description: "Std dev of idle time.", unit: "µs", typical: [0, 100000000] },
  "Idle Max": { name: "Idle Max", category: "Active / Idle", description: "Max idle time.", unit: "µs", typical: [0, 100000000] },
  "Idle Min": { name: "Idle Min", category: "Active / Idle", description: "Min idle time.", unit: "µs", typical: [0, 100000000] },
   "RST Flag Count": {
  name: "RST Flag Count",
  category: "TCP Flags",
  description: "Number of TCP reset (RST) flags.",
  unit: "count",
  typical: [0, 200],
}
};

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  "Flow Identity",
  "Packet Counts",
  "Packet Lengths",
  "Flow Rates",
  "Inter-Arrival Time",
  "TCP Flags",
  "Header Length",
  "Packet Size Stats",
  "Bulk Transfer",
  "Subflow",
  "Window & Segment",
  "Active / Idle",
];

export function featuresByCategory(): Record<FeatureCategory, FeatureMeta[]> {
  const grouped = {} as Record<FeatureCategory, FeatureMeta[]>;
  for (const c of FEATURE_CATEGORIES) grouped[c] = [];
  for (const name of FEATURE_NAMES) {
    const meta = FEATURE_METADATA[name];
    if (meta) grouped[meta.category].push(meta);
  }
  return grouped;
}

/** Highlighted features surfaced in the quick-edit panel (high-signal subset). */
export const HIGHLIGHT_FEATURES = [
  "Destination Port",
  "Flow Duration",
  "Total Fwd Packets",
  "Total Backward Packets",
  "Flow Bytes/s",
  "Flow Packets/s",
  "SYN Flag Count",
  "FIN Flag Count",
  "PSH Flag Count",
  "ACK Flag Count",
  "Init_Win_bytes_forward",
  "Init_Win_bytes_backward",
  "Min Packet Length",
  "Max Packet Length",
  "Average Packet Size",
  "Fwd Packet Length Mean",
  "Bwd Packet Length Mean",
  "Down/Up Ratio",
  "Active Mean",
  "Idle Mean",
];
