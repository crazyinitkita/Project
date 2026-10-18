"use client";

import { useCallback, useEffect, useState } from "react";
import { Radar, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { TrafficForm } from "./traffic-form";
import { PredictionResult } from "./prediction-result";
import { SectionTitle } from "./ui";
import { FEATURE_NAMES } from "@/lib/cyber/features";
import type { AnalysisResult, SampleProfile, TrafficFeatureMap } from "@/lib/cyber/types";
import { recordLiveAnalysis } from "@/lib/cyber/live-history";

function emptyFeatures(): TrafficFeatureMap {
  const m: TrafficFeatureMap = {};
  for (const n of FEATURE_NAMES) m[n] = 0;
  return m;
}

export function AnalyzerView() {
  const [samples, setSamples] = useState<SampleProfile[]>([]);
  const [samplesLoading, setSamplesLoading] = useState(true);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [features, setFeatures] = useState<TrafficFeatureMap>(emptyFeatures);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sample profiles once.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/samples");
        if (!res.ok) throw new Error("Failed to load samples");
        const data: SampleProfile[] = await res.json();
        if (!alive) return;
        setSamples(data);
        if (data.length > 0) {
          setActiveSampleId(data[0].id);
          setFeatures({ ...data[0].features });
        }
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Could not load samples.");
      } finally {
        if (alive) setSamplesLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const pickSample = useCallback((id: string) => {
    const s = samples.find((x) => x.id === id);
    if (!s) return;
    setActiveSampleId(id);
    setFeatures({ ...s.features });
    setResult(null);
    setError(null);
  }, [samples]);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features, explain: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Analysis failed (${res.status})`);
      const analysis = data as AnalysisResult;
      setResult(analysis);
      recordLiveAnalysis(analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }, [features]);

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={Radar}
        title="Traffic analyzer"
        desc="Submit a network-flow feature vector. The classifier predicts a traffic category; the generative model then explains the prediction and suggests safe investigation steps."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Form column */}
        <div className="space-y-3">
          {samplesLoading ? (
            <Skeleton className="h-[28rem] w-full rounded-xl" />
          ) : (
            <TrafficForm
              features={features}
              onFeaturesChange={setFeatures}
              onAnalyze={analyze}
              loading={loading}
              samples={samples}
              activeSampleId={activeSampleId}
              onPickSample={pickSample}
            />
          )}
          <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
            <CardContent className="py-3 flex items-start gap-2.5">
              <Info className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />
              <p className="text-[11px] leading-relaxed text-foreground/75">
                Predictions are sent to your running Node.js API, which calls the trained Random Forest service and then requests a separate AI explanation. The model score is not a calibrated probability. Global feature importance is context only, not proof of why an individual flow was classified.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Result column */}
        <div className="space-y-3">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Analysis error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && !result && (
            <div className="space-y-4">
              <Skeleton className="h-44 w-full rounded-xl" />
              <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-56 rounded-xl" />
                <Skeleton className="h-56 rounded-xl" />
              </div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          )}

          {!loading && !result && !error && (
            <Card className="border-dashed border-border bg-card/40">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-3">
                  <Radar className="h-6 w-6 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-foreground">No analysis yet</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  Pick a sample profile (or edit features) and run <span className="text-foreground/80">Analyze traffic</span>. The backend prediction and AI explanation will appear here.
                </p>
              </CardContent>
            </Card>
          )}

          {result && <PredictionResult result={result} />}
        </div>
      </div>
    </div>
  );
}
