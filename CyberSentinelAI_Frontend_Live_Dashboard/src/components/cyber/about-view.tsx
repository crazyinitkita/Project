"use client";

import {
  Network, Server, BrainCircuit, SplitSquareHorizontal, ShieldCheck,
  ShieldAlert, CircleSlash, CheckCircle2, Layers, Workflow, Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "./ui";
import { FEATURE_CATEGORIES, featuresByCategory } from "@/lib/cyber/features";
import { cn } from "@/lib/utils";

export function AboutView() {
  const grouped = featuresByCategory();

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={Network}
        title="Architecture & responsibilities"
        desc="CyberSentinel AI combines a Random Forest classifier with a generative-AI explainer. The two responsibilities are deliberately separated so the generative model can never invent or override a detection."
      />

      {/* Pipeline */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Workflow className="h-4 w-4 text-emerald-400" /> Request pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-stretch">
            <PipelineNode
              icon={Network}
              title="React frontend"
              subtitle="This app"
              points={["Collects 78 feature values", "Displays prediction + explanation", "Never calls FastAPI / Gemma directly"]}
              accent="emerald"
            />
            <Arrow />
            <PipelineNode
              icon={Server}
              title="Node.js / Express"
              subtitle="Coordinator (port 3000)"
              points={["Validates request", "Calls FastAPI for prediction", "Calls Gemma for explanation", "Merges and returns result"]}
              accent="teal"
            />
            <Arrow />
            <PipelineNode
              icon={BrainCircuit}
              title="FastAPI + Random Forest"
              subtitle="ML service (port 8000)"
              points={["Loads random_forest.joblib", "Predicts label + probabilities", "Returns 15-class distribution"]}
              accent="violet"
            />
            <Arrow />
            <PipelineNode
              icon={Sparkles}
              title="Gemma (generative)"
              subtitle="Explanation only"
              points={["Explains the prediction", "Suggests safe investigation", "NEVER performs detection", "NEVER overrides the label"]}
              accent="amber"
            />
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            The Analyzer API route forwards requests to the existing Node.js backend. Keep the Node.js service on port 3000 and run this Next.js frontend on port 3001. Model Insights and sample-profile metadata are still frontend-side reference content and should be checked against the deployed model before presenting them as live backend metrics.
          </p>
        </CardContent>
      </Card>

      {/* Responsibility separation */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-300">
              <ShieldCheck className="h-4 w-4" /> Classifier (Random Forest)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <Resp ok label="Produces the predicted traffic category" />
              <Resp ok label="Produces per-class probabilities" />
              <Resp ok label="Trained on CIC-IDS2017 prepared sample" />
              <Resp ok={false} label="Does NOT explain its prediction" />
              <Resp ok={false} label="Does NOT generate natural language" />
            </ul>
          </CardContent>
        </Card>
        <Card className="border-violet-500/20 bg-violet-500/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-violet-300">
              <Sparkles className="h-4 w-4" /> Explainer (Gemma)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <Resp ok label="Explains an already-computed prediction" />
              <Resp ok label="Suggests safe, defensive investigation steps" />
              <Resp ok={false} label="Does NOT detect or classify traffic" />
              <Resp ok={false} label="Does NOT invent or override the label" />
              <Resp ok={false} label="Does NOT claim the system detects every attack" />
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Tech stack */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" /> Technology stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <StackGroup title="Frontend" items={["Next.js 16 + React 19", "TypeScript 5", "Tailwind CSS 4", "shadcn/ui + Lucide", "Recharts", "Fetch API"]} />
            <StackGroup title="Backend (production)" items={["Node.js + Express", "dotenv", "@google/genai (Gemma)", "Coordinates prediction + explanation"]} />
            <StackGroup title="ML service (production)" items={["Python + FastAPI + Uvicorn", "pandas / NumPy / scikit-learn", "joblib", "RandomForestClassifier", "CIC-IDS2017 dataset"]} />
          </div>
        </CardContent>
      </Card>

      {/* Honest scope */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <SplitSquareHorizontal className="h-4 w-4 text-emerald-400" /> Honest scope — what v1 is and is not
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-emerald-300 mb-2 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Implemented</div>
              <ul className="space-y-1.5">
                <ScopeItem ok text="Analyzes supplied network-traffic samples" />
                <ScopeItem ok text="Predicts benign vs. 14 attack categories" />
                <ScopeItem ok text="Generates plain-language explanations" />
                <ScopeItem ok text="Recommends safe investigation steps" />
                <ScopeItem ok text="Surfaces model evaluation & limitations" />
              </ul>
            </div>
            <div>
              <div className="text-xs font-medium text-rose-300 mb-2 flex items-center gap-1.5"><CircleSlash className="h-3.5 w-3.5" /> Not implemented (do not present as existing)</div>
              <ul className="space-y-1.5">
                <ScopeItem ok={false} text="Continuous live packet capture" />
                <ScopeItem ok={false} text="Automatic blocking / response actions" />
                <ScopeItem ok={false} text="Predictive forecasting of future attacks" />
                <ScopeItem ok={false} text="Persistent security monitoring pipeline" />
                <ScopeItem ok={false} text="Separate-capture holdout evaluation (planned)" />
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature taxonomy */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" /> Feature taxonomy (canonical CIC-IDS2017 flow features)
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">The model requires the exact trained feature names. The production model uses 78 features as defined in <code>random_forest.joblib</code>; this sandbox predictor uses the {FEATURE_CATEGORIES.reduce((s, c) => s + grouped[c].length, 0)} canonical flow features below.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_CATEGORIES.map((cat) => (
              <div key={cat} className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-foreground/90">{cat}</span>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">{grouped[cat].length}</Badge>
                </div>
                <ul className="space-y-0.5">
                  {grouped[cat].map((f) => (
                    <li key={f.name} className="text-[10.5px] text-muted-foreground truncate font-mono" title={f.description}>{f.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PipelineNode({ icon: Icon, title, subtitle, points, accent }: {
  icon: React.ElementType; title: string; subtitle: string; points: string[];
  accent: "emerald" | "teal" | "violet" | "amber";
}) {
  const accentMap: Record<string, string> = {
    emerald: "border-emerald-500/30 bg-emerald-500/[0.05] text-emerald-300",
    teal: "border-teal-500/30 bg-teal-500/[0.05] text-teal-300",
    violet: "border-violet-500/30 bg-violet-500/[0.05] text-violet-300",
    amber: "border-amber-500/30 bg-amber-500/[0.05] text-amber-300",
  };
  return (
    <div className={cn("rounded-xl border p-3.5 flex flex-col", accentMap[accent])}>
      <div className="flex items-center gap-2 mb-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-background/50 border border-border">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="text-[10px] text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      <ul className="space-y-1 mt-1">
        {points.map((p, i) => (
          <li key={i} className="text-[11px] text-foreground/75 flex items-start gap-1.5">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden lg:flex items-center justify-center text-muted-foreground">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}

function Resp({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-start gap-2 text-xs">
      {ok
        ? <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-400 shrink-0" />
        : <ShieldAlert className="h-3.5 w-3.5 mt-0.5 text-rose-400 shrink-0" />}
      <span className={ok ? "text-foreground/85" : "text-muted-foreground line-through"}>{label}</span>
    </li>
  );
}

function StackGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-medium text-foreground/90 mb-2">{title}</div>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400/70" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScopeItem({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className="flex items-start gap-2 text-xs">
      {ok
        ? <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-400 shrink-0" />
        : <CircleSlash className="h-3.5 w-3.5 mt-0.5 text-rose-400/80 shrink-0" />}
      <span className={ok ? "text-foreground/85" : "text-muted-foreground"}>{text}</span>
    </li>
  );
}
