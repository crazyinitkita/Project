"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck, LayoutDashboard, Radar, Microscope, Network,
  Github, Activity, Lock, AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DashboardView } from "@/components/cyber/dashboard-view";
import { AnalyzerView } from "@/components/cyber/analyzer-view";
import { ModelInsightsView } from "@/components/cyber/model-insights-view";
import { AboutView } from "@/components/cyber/about-view";

type TabId = "dashboard" | "analyzer" | "model" | "about";

const TABS: { id: TabId; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Operations overview" },
  { id: "analyzer", label: "Analyzer", icon: Radar, desc: "Analyze traffic" },
  { id: "model", label: "Model Insights", icon: Microscope, desc: "Evaluation & limits" },
  { id: "about", label: "Architecture", icon: Network, desc: "How it works" },
];

export default function Home() {
  const [tab, setTab] = useState<TabId>("dashboard");
  const [apiStatus, setApiStatus] = useState<{ node: boolean; ml: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const response = await fetch("/api/system-status", { cache: "no-store" });
        const data = await response.json();
        if (active) setApiStatus({ node: Boolean(data.node?.online), ml: Boolean(data.ml?.online) });
      } catch {
        if (active) setApiStatus({ node: false, ml: false });
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  return (
    <div className="cyber-bg min-h-screen flex flex-col">
      {/* ---- Header ---- */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background animate-cyber-pulse" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                  CyberSentinel <span className="text-emerald-400">AI</span>
                </h1>
                <Badge variant="outline" className={`hidden sm:inline-flex text-[10px] ${apiStatus?.node && apiStatus?.ml ? "border-emerald-500/30 text-emerald-300" : "border-amber-500/30 text-amber-300"}`}>
                  <span className={`mr-1 h-1.5 w-1.5 rounded-full ${apiStatus?.node && apiStatus?.ml ? "bg-emerald-400" : "bg-amber-400"}`} /> {apiStatus === null ? "Checking APIs" : apiStatus.node && apiStatus.ml ? "Backend connected" : "Backend unavailable"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">Explainable Network Intrusion Detection</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Activity className={`h-3.5 w-3.5 ${apiStatus?.ml ? "text-emerald-400" : "text-amber-300"}`} />
              Classifier <span className="text-foreground/70">{apiStatus === null ? "checking" : apiStatus.ml ? "online" : "offline"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-violet-300" />
              API <span className="text-foreground/70">{apiStatus === null ? "checking" : apiStatus.node ? "online" : "offline"}</span>
            </span>
          </div>
        </div>

        {/* ---- Tab nav ---- */}
        <nav className="mx-auto max-w-7xl px-2 sm:px-4">
          <div className="flex gap-1 overflow-x-auto scroll-thin">
            {TABS.map((t) => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "group relative flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition-colors sm:text-sm",
                    active
                      ? "border-emerald-400 text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground/80",
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-emerald-400" : "text-muted-foreground group-hover:text-foreground/80")} />
                  <span>{t.label}</span>
                  <span className="hidden lg:inline text-[10px] text-muted-foreground/70">· {t.desc}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* ---- Main ---- */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {tab === "dashboard" && <DashboardView onNavigate={(t) => setTab(t as TabId)} />}
        {tab === "analyzer" && <AnalyzerView />}
        {tab === "model" && <ModelInsightsView />}
        {tab === "about" && <AboutView />}
      </main>

      {/* ---- Footer (sticky to bottom) ---- */}
      <footer className="mt-auto border-t border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>CyberSentinel AI · Explainable NIDS</span>
              <span className="hidden sm:inline mx-1">·</span>
              <span className="hidden sm:inline">Random Forest + Gemma explainer</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Github className="h-3.5 w-3.5" /> CIC-IDS2017 dataset
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="flex items-center gap-1.5 text-amber-300/80">
                <AlertTriangle className="h-3.5 w-3.5" /> Offline estimate, not live monitoring
              </span>
            </div>
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground/80">
            The classifier predicts a traffic category; the generative model only explains that prediction and never performs detection. v1 analyses supplied traffic samples — no live packet capture, auto-blocking, or forecasting yet. Do not represent unimplemented capabilities as existing features.
          </p>
        </div>
      </footer>
    </div>
  );
}
