import type { AnalysisResult } from "@/lib/cyber/types";
import type { LiveAnalysis } from "@/lib/cyber/live-history";

type ServerHistoryState = { analyses: LiveAnalysis[] };

// The browser history remains the primary store. This lightweight server-side
// mirror keeps Dashboard and Model Insights consistent when the user changes
// hostnames (localhost vs 127.0.0.1), switches tabs, or browser storage is
// unavailable during a local demo. It is intentionally process-local and is
// not organization-wide telemetry.
const globalState = globalThis as unknown as {
  __cybersentinelServerHistory?: ServerHistoryState;
};

const state: ServerHistoryState = globalState.__cybersentinelServerHistory || {
  analyses: [],
};
globalState.__cybersentinelServerHistory = state;

function toLiveAnalysis(result: AnalysisResult): LiveAnalysis {
  return {
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
    reviewRequired: Boolean(result.reviewRequired),
    modelScore: Number(result.modelScore ?? result.confidence),
    confidenceThreshold: result.confidenceThreshold,
  };
}

export function recordServerAnalysis(result: AnalysisResult): void {
  const item = toLiveAnalysis(result);
  state.analyses = [item, ...state.analyses]
    .filter((entry, index, all) => all.findIndex((candidate) => candidate.requestId === entry.requestId) === index)
    .slice(0, 100);
}

export function readServerAnalyses(): LiveAnalysis[] {
  return [...state.analyses];
}
