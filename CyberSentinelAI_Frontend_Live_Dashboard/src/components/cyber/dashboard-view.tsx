"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { LayoutDashboard, ShieldCheck, Cpu, Activity, Sparkles, ArrowRight, Server, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard, SectionTitle, fmtNum } from "./ui";
import { mergeLiveAnalyses, readLiveAnalyses, subscribeLiveAnalyses, type LiveAnalysis } from "@/lib/cyber/live-history";

type Health = { online: boolean; httpStatus: number | null; details: Record<string, unknown> };
type SystemStatus = { checkedAt: string; overall: string; node: Health; ml: Health };

export function DashboardView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [analyses, setAnalyses] = useState<LiveAnalysis[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const refreshStatus = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/system-status", { cache: "no-store" });
      if (!res.ok) throw new Error("Status request failed");
      setStatus(await res.json());
    } catch {
      setStatus(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    const refreshHistory = async () => {
      const local = readLiveAnalyses();
      try {
        const response = await fetch("/api/history", { cache: "no-store" });
        const remote = response.ok ? await response.json() : [];
        if (alive) setAnalyses(mergeLiveAnalyses(local, Array.isArray(remote) ? remote : []));
      } catch {
        if (alive) setAnalyses(local);
      }
    };
    void refreshHistory();
    const unsubscribe = subscribeLiveAnalyses(() => void refreshHistory());
    void refreshStatus();
    const timer = window.setInterval(() => void refreshStatus(), 15000);
    return () => { alive = false; unsubscribe(); window.clearInterval(timer); };
  }, [refreshStatus]);

  const attacks = analyses.filter((a) => a.isAttack).length;
  const benign = analyses.length - attacks;
  const latest = analyses[0];
  const labelCounts = analyses.reduce<Record<string, number>>((acc, item) => {
    acc[item.predictedDisplay] = (acc[item.predictedDisplay] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(labelCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  const features = (latest?.topContributingFeatures || []).slice(0, 8);
  const maxImportance = Math.max(...features.map((f) => f.value || f.influence || 0), 0.0001);

  return (
    <div className="space-y-6">
      <SectionTitle icon={LayoutDashboard} title="Operations dashboard" desc="Live service health and predictions made in this local demo session. Counts are not organization-wide telemetry." right={<Button onClick={() => onNavigate("analyzer")} className="bg-emerald-600 hover:bg-emerald-500 text-emerald-50"><Sparkles className="h-4 w-4 mr-2" /> Analyze traffic <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Server} label="Node.js API" value={status?.node.online ? "Online" : "Offline"} sub={status?.node.online ? "Port 3000 reachable" : "Waiting for /health"} accent={status?.node.online ? "emerald" : "rose"} />
        <KpiCard icon={Cpu} label="ML service" value={status?.ml.online ? "Online" : "Offline"} sub={typeof status?.ml.details?.features_required === "number" ? `${status.ml.details.features_required} features required` : "FastAPI health check"} accent={status?.ml.online ? "emerald" : "rose"} />
        <KpiCard icon={Activity} label="Analyses in this demo session" value={fmtNum(analyses.length)} sub="Most recent 100 saved locally" accent="teal" />
        <KpiCard icon={ShieldCheck} label="Predicted attacks" value={fmtNum(attacks)} sub={`${benign} benign predictions in demo history`} accent="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Card className="border-border bg-card/60">
          <CardHeader className="pb-2"><div className="flex items-center justify-between gap-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-400" /> Prediction distribution</CardTitle><Badge variant="outline" className="text-[10px]">Live demo history</Badge></div><p className="text-[11px] text-muted-foreground">Counts reflect successful analyses in this local demo session. They are not a traffic-volume or network-wide attack statistic.</p></CardHeader>
          <CardContent>
            {chartData.length ? <ResponsiveContainer width="100%" height={260}><BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 25 }}><CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.005 165)" vertical={false} /><XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={55} tick={{ fill: "oklch(0.68 0.01 165)", fontSize: 10 }} stroke="oklch(0.32 0.005 165)" /><YAxis allowDecimals={false} tick={{ fill: "oklch(0.68 0.01 165)", fontSize: 10 }} stroke="oklch(0.32 0.005 165)" /><Tooltip contentStyle={{ background: "oklch(0.19 0.005 165)", border: "1px solid oklch(0.32 0.005 165)", borderRadius: 8, fontSize: 12 }} /><Bar dataKey="count" name="Predictions" radius={[3, 3, 0, 0]}>{chartData.map((item) => <Cell key={item.name} fill={item.name.toUpperCase() === "BENIGN" ? "#10b981" : "#f43f5e"} />)}</Bar></BarChart></ResponsiveContainer> : <div className="flex h-64 flex-col items-center justify-center text-center"><Activity className="mb-3 h-8 w-8 text-muted-foreground" /><p className="text-sm font-medium">No live prediction data yet</p><p className="mt-1 max-w-sm text-xs text-muted-foreground">Run an analysis to populate this chart with real backend predictions.</p><Button variant="outline" className="mt-4" onClick={() => onNavigate("analyzer")}>Open analyzer</Button></div>}
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Server className="h-4 w-4 text-emerald-400" /> Backend connectivity</CardTitle><p className="text-[11px] text-muted-foreground">Automatically checked every 15 seconds.</p></CardHeader>
          <CardContent className="space-y-3">
            <ServiceRow label="Node.js / Express" online={Boolean(status?.node.online)} detail={status?.node.online ? `HTTP ${status.node.httpStatus}` : "Not reachable at configured backend URL"} />
            <ServiceRow label="FastAPI / Random Forest" online={Boolean(status?.ml.online)} detail={status?.ml.online ? `${String(status.ml.details.model || "Model service")} · ${String(status.ml.details.features_required ?? "?")} features` : "Not reachable at configured ML URL"} />
            <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground"><span>{status?.checkedAt ? `Last checked ${new Date(status.checkedAt).toLocaleTimeString()}` : "Status not yet checked"}</span><Button variant="ghost" size="sm" onClick={() => void refreshStatus()} disabled={checking}><RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} /> Refresh</Button></div>
            {status && !status.node.online && <p className="rounded-md border border-amber-500/20 bg-amber-500/[0.04] p-3 text-[11px] text-amber-100/80"><AlertTriangle className="mr-1.5 inline h-3.5 w-3.5" />Start the existing Node.js backend on port 3000 to enable predictions.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card/60"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Latest prediction context</CardTitle><p className="text-[11px] text-muted-foreground">Global feature importance returned by the backend, not a per-sample causal explanation.</p></CardHeader><CardContent>{features.length ? <div className="space-y-3">{features.map((feature) => { const value = feature.value || feature.influence || 0; return <div key={feature.name} className="flex items-center gap-3"><div className="w-44 shrink-0 truncate text-xs" title={feature.name}>{feature.name}</div><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (value / maxImportance) * 100)}%` }} /></div><div className="w-12 text-right text-xs text-muted-foreground">{(value * 100).toFixed(1)}%</div></div>; })}</div> : <EmptyText text="Feature context will appear after the first successful analysis." />}</CardContent></Card>
        <Card className="border-border bg-card/60"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Most recent analysis</CardTitle></CardHeader><CardContent>{latest ? <div className="space-y-3"><div className="flex items-center justify-between gap-3"><span className="text-lg font-semibold">{latest.predictedDisplay}</span><Badge variant="outline" className={latest.isAttack ? "border-rose-500/30 text-rose-300" : "border-emerald-500/30 text-emerald-300"}>{latest.isAttack ? "Potential attack" : "Benign"}</Badge></div><div className="grid grid-cols-2 gap-3 text-xs"><div className="rounded-lg bg-muted/40 p-3"><p className="text-muted-foreground">Model score</p><p className="mt-1 text-base font-semibold">{Number.isFinite(latest.confidence) ? `${(latest.confidence * 100).toFixed(1)}%` : "—"}</p></div><div className="rounded-lg bg-muted/40 p-3"><p className="text-muted-foreground">Features submitted</p><p className="mt-1 text-base font-semibold">{latest.featureCount}</p></div></div><p className="text-[11px] text-muted-foreground">{new Date(latest.createdAt).toLocaleString()} · {latest.requestId}</p><Button variant="outline" size="sm" onClick={() => onNavigate("model")}>View model insights <ArrowRight className="ml-2 h-3.5 w-3.5" /></Button></div> : <EmptyText text="No completed analyses saved yet. Run a sample through the Analyzer first." />}</CardContent></Card>
      </div>
    </div>
  );
}

function ServiceRow({ label, online, detail }: { label: string; online: boolean; detail: string }) {
  return <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"><div><p className="text-xs font-medium">{label}</p><p className="mt-1 text-[11px] text-muted-foreground">{detail}</p></div><Badge variant="outline" className={online ? "border-emerald-500/30 text-emerald-300" : "border-rose-500/30 text-rose-300"}>{online ? "Online" : "Offline"}</Badge></div>;
}
function EmptyText({ text }: { text: string }) { return <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">{text}</div>; }
