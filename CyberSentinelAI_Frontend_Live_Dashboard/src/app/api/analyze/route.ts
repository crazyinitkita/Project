// POST /api/analyze — proxy to the real CyberSentinel Node.js backend.
// Next.js frontend runs on port 3001; the existing Express backend stays on 3000.
import { NextRequest, NextResponse } from "next/server";
import { recordServerAnalysis } from "@/lib/cyber/server-history";
import type { AnalysisResult } from "@/lib/cyber/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const BACKEND_URL = process.env.CYBERSENTINEL_API_URL || "http://127.0.0.1:3000";

function displayLabel(label: string): string {
  return label.replace(/\uFFFD/g, "–").replace(/\bXSS\b/g, "XSS");
}

export async function POST(req: NextRequest) {
  let body: { features?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  if (!body?.features || typeof body.features !== "object" || Array.isArray(body.features)) {
    return NextResponse.json({ error: "Missing features object." }, { status: 400 });
  }

  const started = Date.now();
  try {
    const upstream = await fetch(`${BACKEND_URL}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features: body.features }),
      cache: "no-store",
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      return NextResponse.json(
        { error: data?.error || data?.details || "Backend prediction failed." },
        { status: upstream.status },
      );
    }

    const label = String(data.prediction || "Unknown");
    const display = displayLabel(label);
    const isAttack = label.toUpperCase() !== "BENIGN";
    const review = Boolean(data.review_required);
    const score = Number(data.model_score);
    const features = Array.isArray(data.top_feature_context) ? data.top_feature_context : [];
    const caveats = [
      "Model score is not a calibrated probability and does not guarantee correctness.",
      "Feature context is global feature importance, not a causal or per-flow explanation.",
      "The model was evaluated using a random split from CIC-IDS2017 captures; performance on other datasets is not established.",
    ];
    if (review) caveats.unshift("The backend marked this result for manual review because it is below the configured confidence threshold.");

    const result: AnalysisResult = {
      requestId: `CS-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      predictedLabel: label,
      predictedDisplay: display,
      isAttack,
      threatLevel: review ? "medium" : (isAttack ? "high" : "benign"),
      family: label.toUpperCase() === "BENIGN" ? "Normal" : "Potential attack",
      confidence: Number.isFinite(score) ? Math.max(0, Math.min(1, score)) : 0,
       probabilities: [{ label, display, probability: Number.isFinite(score) ? Math.max(0, Math.min(1, score)) : 0, isAttack }],
      topContributingFeatures: features.slice(0, 6).map((item: any) => ({
        name: String(item.name || item.feature || "Feature"),
        value: Number(item.importance ?? item.value ?? 0),
        influence: Number.isFinite(Number(item.importance ?? item.value)) ? Math.max(0, Math.min(1, Number(item.importance ?? item.value))) : 0,
        direction: "normal",
        note: "Global importance; not sample-specific",
      })),
      explanation: String(data.explanation || "No explanation was returned by the backend."),
      explanationSource: data.explanation_status === "available" ? "llm" : "fallback",
      investigation: [],
      modelName: "Known-attack Random Forest + Gemma explainer",
      modelVersion: "Existing backend model",
      dataset: "CIC-IDS2017 sampled training data",
      caveats,
      featureCount: Object.keys(body.features as Record<string, unknown>).length,
      processingMs: Date.now() - started,
      reviewRequired: review,
      modelScore: score,
      confidenceThreshold: data.confidence_threshold,
      scoreNote: data.score_note,
      explanationNote: data.explanation_note,
      reviewRequired: review,
      modelScore: Number.isFinite(score) ? score : null,
      confidenceThreshold: data.confidence_threshold,
    };
    recordServerAnalysis(result);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not reach the CyberSentinel backend.";
    return NextResponse.json(
      { error: `Could not reach Node.js backend at ${BACKEND_URL}. Start the existing backend first. Details: ${message}` },
      { status: 502 },
    );
  }
}
