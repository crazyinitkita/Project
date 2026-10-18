import type { AnalysisResult } from "@/lib/cyber/types";

export type LiveAnalysis = Pick<AnalysisResult,
  "requestId" | "createdAt" | "predictedLabel" | "predictedDisplay" | "isAttack" |
  "threatLevel" | "confidence" | "featureCount" | "processingMs" | "topContributingFeatures" |
  "explanationSource" | "reviewRequired" | "modelScore" | "confidenceThreshold"
>;

const KEY = "cybersentinel:live-analyses:v1";
const UPDATED_EVENT = "cybersentinel:analysis-updated";

function storageCandidates(): Storage[] {
  if (typeof window === "undefined") return [];
  const candidates: Storage[] = [];
  try { candidates.push(window.localStorage); } catch { /* blocked storage */ }
  try {
    if (!candidates.includes(window.sessionStorage)) candidates.push(window.sessionStorage);
  } catch { /* blocked storage */ }
  return candidates;
}

export function readLiveAnalyses(): LiveAnalysis[] {
  if (typeof window === "undefined") return [];
  const merged = new Map<string, LiveAnalysis>();
  for (const storage of storageCandidates()) {
    try {
      const parsed = JSON.parse(storage.getItem(KEY) || "[]");
      if (!Array.isArray(parsed)) continue;
      for (const item of parsed as LiveAnalysis[]) {
        if (item?.requestId && !merged.has(item.requestId)) merged.set(item.requestId, item);
      }
    } catch {
      // Ignore malformed or unavailable browser storage and try the next one.
    }
  }
  return [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100);
}

export function recordLiveAnalysis(result: AnalysisResult): boolean {
  if (typeof window === "undefined") return false;
  const item: LiveAnalysis = {
    requestId: result.requestId,
    createdAt: result.createdAt,
    predictedLabel: result.predictedLabel,
    predictedDisplay: result.predictedDisplay,
    isAttack: result.isAttack,
    threatLevel: result.threatLevel,
    confidence: result.confidence,
    featureCount: result.featureCount,
    processingMs: result.processingMs,
    topContributingFeatures: result.topContributingFeatures,
    explanationSource: result.explanationSource,
    reviewRequired: Boolean((result as AnalysisResult & { reviewRequired?: boolean }).reviewRequired),
    modelScore: Number((result as AnalysisResult & { modelScore?: number }).modelScore ?? result.confidence),
    confidenceThreshold: (result as AnalysisResult & { confidenceThreshold?: number }).confidenceThreshold,
  };
  const next = [item, ...readLiveAnalyses()].filter((entry) => entry.requestId !== item.requestId).slice(0, 100);
  const serialized = JSON.stringify(next);
  let saved = false;
  for (const storage of storageCandidates()) {
    try {
      storage.setItem(KEY, serialized);
      saved = true;
    } catch {
      // Fall back to the next available browser storage.
    }
  }
  if (!saved) return false;
  window.dispatchEvent(new Event(UPDATED_EVENT));
  return true;
}

export function subscribeLiveAnalyses(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const refresh = () => callback();
  window.addEventListener(UPDATED_EVENT, callback);
  window.addEventListener("storage", callback);
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", refresh);
  return () => {
    window.removeEventListener(UPDATED_EVENT, callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener("focus", refresh);
    document.removeEventListener("visibilitychange", refresh);
  };
}

export function mergeLiveAnalyses(...sources: LiveAnalysis[][]): LiveAnalysis[] {
  const merged = new Map<string, LiveAnalysis>();
  for (const source of sources) {
    for (const item of source) {
      if (item?.requestId && !merged.has(item.requestId)) merged.set(item.requestId, item);
    }
  }
  return [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100);
}
