"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Microscope, Server, ShieldAlert, RefreshCw, Clock3, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionTitle, KpiCard, fmtNum } from "./ui";
import { mergeLiveAnalyses, readLiveAnalyses, subscribeLiveAnalyses, type LiveAnalysis } from "@/lib/cyber/live-history";

type Service = { online: boolean; httpStatus: number | null; details: Record<string, unknown> };
type Status = { checkedAt: string; overall: string; node: Service; ml: Service };

export function ModelInsightsView() {
  const [analyses, setAnalyses] = useState<LiveAnalysis[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/system-status", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to read live service status");
      setStatus(await response.json());
    } catch { setStatus(null); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let alive = true;
    const update = async () => {
      const local = readLiveAnalyses();
      try {
        const response = await fetch("/api/history", { cache: "no-store" });
        const remote = response.ok ? await response.json() : [];
        if (alive) setAnalyses(mergeLiveAnalyses(local, Array.isArray(remote) ? remote : []));
      } catch {
        if (alive) setAnalyses(local);
      }
    };
    void update();
    const unsubscribe = subscribeLiveAnalyses(() => void update());
    void refresh();
    return () => { alive = false; unsubscribe(); };
  }, [refresh]);

  const latest = analyses[0];
  const attacks = analyses.filter((item) => item.isAttack).length;
  const benign = analyses.length - attacks;
  const averageMs = analyses.length ? analyses.reduce((sum, item) => sum + (item.processingMs || 0), 0) / analyses.length : 0;
  const topFeatures = latest?.topContributingFeatures || [];

  return <div className="space-y-6">
    <SectionTitle icon={Microscope} title="Live model insights" desc="Service details and results returned by the connected backend. Offline evaluation metrics are deliberately not fabricated here; the current API does not expose a fresh evaluation report." right={<Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh status</Button>} />

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard icon={Server} label="Node.js API" value={status?.node.online ? "Online" : "Offline / unknown"} sub="Express prediction coordinator" accent={status?.node.online ? "emerald" : "rose"} />
      <KpiCard icon={Cpu} label="ML classifier" value={status?.ml.online ? String(status.ml.details.model || "Online") : "Offline / unknown"} sub={status?.ml.online ? `${String(status.ml.details.features_required ?? "—")} required features` : "FastAPI health endpoint"} accent={status?.ml.online ? "teal" : "rose"} />
      <KpiCard icon={Activity} label="Recorded predictions" value={fmtNum(analyses.length)} sub="Successful analyses in this demo session" accent="violet" />
      <KpiCard icon={Clock3} label="Avg. frontend request time" value={analyses.length ? `${Math.round(averageMs)} ms` : "—"} sub="Measured by frontend proxy; includes backend response time" accent="amber" />
    </div>

    <Card className="border-border bg-card/60"><CardHeader className="pb-2"><CardTitle className="text-sm">Connected model service</CardTitle></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2"><ServiceCard title="Node.js / Express" service={status?.node} /> <ServiceCard title="FastAPI / Random Forest" service={status?.ml} /></div><p className="mt-3 text-[11px] text-muted-foreground">Last status check: {status?.checkedAt ? new Date(status.checkedAt).toLocaleString() : "not available"}. Status comes from the actual /health endpoints, not hard-coded UI labels.</p></CardContent></Card>

    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-border bg-card/60"><CardHeader className="pb-2"><CardTitle className="text-sm">Observed prediction results</CardTitle><p className="text-[11px] text-muted-foreground">Results returned by the real backend and kept for this local demo session. These are not test-set evaluation metrics.</p></CardHeader><CardContent>{analyses.length ? <div className="space-y-3"><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border border-rose-500/20 bg-rose-500/[0.04] p-3"><p className="text-xs text-muted-foreground">Predicted attacks</p><p className="mt-1 text-2xl font-semibold text-rose-300">{attacks}</p></div><div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3"><p className="text-xs text-muted-foreground">Predicted benign</p><p className="mt-1 text-2xl font-semibold text-emerald-300">{benign}</p></div></div><div className="max-h-72 space-y-2 overflow-y-auto">{analyses.slice(0, 20).map((item) => <div key={item.requestId} className="flex items-center justify-between gap-3 rounded-md border border-border p-3"><div className="min-w-0"><p className="truncate text-xs font-medium">{item.predictedDisplay}</p><p className="mt-1 text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleString()} · {item.requestId}</p></div><Badge variant="outline" className={item.isAttack ? "border-rose-500/30 text-rose-300" : "border-emerald-500/30 text-emerald-300"}>{item.isAttack ? "Attack" : "Benign"}</Badge></div>)}</div></div> : <Empty text="No prediction history yet. Analyze a traffic sample to see live model output here." />}</CardContent></Card>

      <Card className="border-border bg-card/60"><CardHeader className="pb-2"><CardTitle className="text-sm">Latest returned feature context</CardTitle><p className="text-[11px] text-muted-foreground">Feature importance from the backend response. It is global context, not a sample-specific causal explanation.</p></CardHeader><CardContent>{topFeatures.length ? <div className="space-y-3">{topFeatures.map((feature) => <div key={feature.name} className="rounded-md border border-border p-3"><div className="flex items-center justify-between gap-3"><span className="truncate text-xs font-medium" title={feature.name}>{feature.name}</span><span className="text-xs tabular-nums text-emerald-300">{((feature.value || feature.influence || 0) * 100).toFixed(2)}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (feature.value || feature.influence || 0) * 100)}%` }} /></div></div>)}</div> : <Empty text="Feature importance context appears after the first successful prediction." />}</CardContent></Card>
    </div>

    <Card className="border-amber-500/25 bg-amber-500/[0.03]"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm text-amber-200"><ShieldAlert className="h-4 w-4" /> Evaluation data boundary</CardTitle></CardHeader><CardContent className="space-y-2 text-xs leading-relaxed text-foreground/80"><p>This view no longer displays hard-coded training rows, class counts, feature importances, or accuracy as if they were live.</p><p>The current health endpoints report service availability, model label, and required feature count. They do not report training-set metadata or test metrics. To display accuracy, F1, per-class support, and training distribution here, the ML service must expose a verified evaluation-report endpoint generated from the exact saved model and its evaluation artifacts.</p><p>Model scores returned during prediction are not calibrated probabilities and do not establish real-world detection accuracy. No live packet capture or automatic blocking is implemented.</p></CardContent></Card>
  </div>;
}

function ServiceCard({ title, service }: { title: string; service?: Service }) {
  const online = Boolean(service?.online);
  return <div className="rounded-lg border border-border p-4"><div className="flex items-center justify-between gap-2"><p className="text-sm font-medium">{title}</p><Badge variant="outline" className={online ? "border-emerald-500/30 text-emerald-300" : "border-rose-500/30 text-rose-300"}>{online ? "Online" : "Offline / unknown"}</Badge></div><p className="mt-2 text-xs text-muted-foreground">{service ? online ? `Health endpoint responded with HTTP ${service.httpStatus}.` : String(service.details?.error || "Health endpoint did not respond.") : "No live status received."}</p>{online && title.includes("FastAPI") && <p className="mt-1 text-xs text-muted-foreground">Model: {String(service?.details.model || "—")} · Input features: {String(service?.details.features_required ?? "—")}</p>}</div>;
}
function Empty({ text }: { text: string }) { return <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">{text}</div>; }
