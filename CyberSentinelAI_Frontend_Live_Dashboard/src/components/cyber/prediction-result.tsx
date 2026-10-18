"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck, ShieldAlert, Sparkles, ListChecks, AlertTriangle,
  Cpu, Activity, ArrowUpRight, ArrowDownRight, Minus, Copy, Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Markdown } from "./markdown";
import { ThreatBadge, SeverityDot, threatColor, fmtPct, fmtMs } from "./ui";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/cyber/types";

export function PredictionResult({ result }: { result: AnalysisResult }) {
  const c = threatColor(result.threatLevel);
  const [copied, setCopied] = useState(false);

  const top5 = useMemo(() => result.probabilities.slice(0, 5), [result]);

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      {/* ---- Verdict card ---- */}
      <Card className={cn("relative overflow-hidden border bg-card/70", c.border)}>
        <div className={cn("absolute inset-x-0 top-0 h-1", c.dot)} />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {result.isAttack ? <ShieldAlert className="h-4 w-4 text-rose-400" /> : <ShieldCheck className="h-4 w-4 text-emerald-400" />}
              Prediction Verdict
            </CardTitle>
            <div className="flex items-center gap-2">
              <ThreatBadge sev={result.threatLevel} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={copyJson}>
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "JSON"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy full result as JSON</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className={cn("text-3xl font-semibold tracking-tight", result.isAttack ? c.text : "text-emerald-400")}>
                {result.predictedDisplay}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Original model label: <code className="text-foreground/80">{result.predictedLabel}</code>
                <span className="mx-2">·</span>
                Family: <span className="text-foreground/80">{result.family}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Model score (not probability)</div>
              <div className={cn("text-2xl font-semibold tnum", c.text)}>{fmtPct(result.confidence)}</div>
            </div>
          </div>

          {/* Confidence bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Raw model score</span>
              <span className="tnum">{fmtPct(result.confidence)}</span>
            </div>
            <Progress value={result.confidence * 100} className={cn("h-2", c.raw === "rose" && "[&>div]:bg-rose-500", c.raw === "amber" && "[&>div]:bg-amber-400", c.raw === "emerald" && "[&>div]:bg-emerald-500", c.raw === "orange" && "[&>div]:bg-orange-500", c.raw === "teal" && "[&>div]:bg-teal-400")} />
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Cpu className="h-3.5 w-3.5" /> {result.modelName}</span>
            <span className="inline-flex items-center gap-1"><Activity className="h-3.5 w-3.5" /> {fmtMs(result.processingMs)}</span>
            <span className="inline-flex items-center gap-1"><span className="text-foreground/70">{result.featureCount}</span> features</span>
            <span className="inline-flex items-center gap-1">Request <code className="text-foreground/70">{result.requestId}</code></span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---- Probability distribution ---- */}
        <Card className="border-border bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              Predicted class
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {top5.map((p) => {
              const pc = threatColor(p.isAttack ? "critical" : "benign");
              return (
                <div key={p.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-foreground/85">
                      <SeverityDot sev={p.isAttack ? "critical" : "benign"} />
                      {p.display}
                    </span>
                    <span className="tnum text-muted-foreground">{fmtPct(p.probability, 2)}</span>
                  </div>
                  <Progress value={p.probability * 100} className={cn("h-1.5", p.isAttack ? "[&>div]:bg-rose-500/70" : "[&>div]:bg-emerald-500/70")} />
                </div>
              );
            })}
            <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
              The backend returns the predicted class and a model score, not a calibrated 15-class probability distribution.
            </p>
          </CardContent>
        </Card>

        {/* ---- Top contributing features ---- */}
        <Card className="border-border bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4 text-emerald-400" />
              Feature-importance context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.topContributingFeatures.map((f) => (
              <div key={f.name} className="flex items-center gap-3">
                <div className="flex w-40 shrink-0 items-center gap-1.5 text-xs text-foreground/80">
                  {f.direction === "high" && <ArrowUpRight className="h-3.5 w-3.5 text-rose-400" />}
                  {f.direction === "low" && <ArrowDownRight className="h-3.5 w-3.5 text-amber-300" />}
                  {f.direction === "normal" && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
                  <span className="truncate" title={f.name}>{f.name}</span>
                </div>
                <div className="flex-1">
                  <Progress value={f.influence * 100} className="h-1.5 [&>div]:bg-emerald-500/60" />
                </div>
                <div className="w-28 shrink-0 text-right">
                  <span className="tnum text-xs text-foreground/85">{formatVal(f.value)}</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="w-28 shrink-0 truncate text-[11px] text-muted-foreground text-right" title={f.note}>{f.note}</span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">{f.note}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
            <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
              These are <strong>global feature-importance</strong> hints, not sample-specific or causal explanations for this flow.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ---- AI Explanation ---- */}
      <Card className="border-violet-500/20 bg-card/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-300" />
              AI explanation
            </CardTitle>
            <Badge variant="outline" className="border-violet-500/30 text-violet-300 text-[10px]">
              {result.explanationSource === "llm" ? "Generative model" : "Fallback"}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            The generative model explains an <strong>already-computed</strong> prediction. It does not perform detection and cannot override the classifier.
          </p>
        </CardHeader>
        <CardContent>
          <Markdown>{result.explanation}</Markdown>

          {result.investigation.length > 0 && (
            <>
              <Separator className="my-4 bg-border/60" />
              <div className="flex items-center gap-2 text-xs font-medium text-foreground/85 mb-2">
                <ListChecks className="h-4 w-4 text-emerald-400" /> Recommended safe investigation
              </div>
              <ul className="space-y-1.5">
                {result.investigation.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                    {step}
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      {/* ---- Honesty caveats ---- */}
      <Card className="border-amber-500/20 bg-amber-500/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-200">
            <AlertTriangle className="h-4 w-4" /> Important limitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {result.caveats.map((cv, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-amber-100/80">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-300" />
                {cv}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function formatVal(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  if (Number.isInteger(v)) return v.toString();
  return v.toFixed(2);
}
