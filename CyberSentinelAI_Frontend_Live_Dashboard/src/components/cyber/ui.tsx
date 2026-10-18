// CyberSentinel AI — shared small UI helpers.

import { cn } from "@/lib/utils";
import type { ThreatLevel } from "@/lib/cyber/types";

export function threatColor(sev: ThreatLevel): {
  text: string; bg: string; border: string; ring: string; dot: string; raw: string;
} {
  switch (sev) {
    case "benign":
      return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", ring: "ring-emerald-500/40", dot: "bg-emerald-400", raw: "emerald" };
    case "low":
      return { text: "text-teal-300", bg: "bg-teal-500/10", border: "border-teal-500/30", ring: "ring-teal-500/40", dot: "bg-teal-300", raw: "teal" };
    case "medium":
      return { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/30", ring: "ring-amber-500/40", dot: "bg-amber-300", raw: "amber" };
    case "high":
      return { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", ring: "ring-orange-500/40", dot: "bg-orange-400", raw: "orange" };
    case "critical":
      return { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", ring: "ring-rose-500/40", dot: "bg-rose-400", raw: "rose" };
  }
}

export function ThreatBadge({ sev, label, className }: { sev: ThreatLevel; label?: string; className?: string }) {
  const c = threatColor(sev);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium tnum",
        c.text, c.bg, c.border, className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {label ?? sev.toUpperCase()}
    </span>
  );
}

export function SeverityDot({ sev, pulse }: { sev: ThreatLevel; pulse?: boolean }) {
  const c = threatColor(sev);
  return (
    <span className={cn("relative inline-flex h-2.5 w-2.5")}>
      {pulse && <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-60 animate-cyber-pulse", c.dot)} />}
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", c.dot)} />
    </span>
  );
}

export function fmtPct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export function fmtNum(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(2)}k`;
  return n.toLocaleString();
}

export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString();
}

export function fmtMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function SectionTitle({
  icon: Icon, title, desc, right,
}: { icon: React.ElementType; title: string; desc?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-lg border border-border bg-card">
          <Icon className="h-4.5 w-4.5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
          {desc && <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl">{desc}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function KpiCard({
  icon: Icon, label, value, sub, accent = "emerald",
}: {
  icon: React.ElementType; label: string; value: React.ReactNode; sub?: React.ReactNode;
  accent?: "emerald" | "rose" | "amber" | "violet" | "teal";
}) {
  const accentMap: Record<string, string> = {
    emerald: "text-emerald-400 border-emerald-500/20",
    rose: "text-rose-400 border-rose-500/20",
    amber: "text-amber-300 border-amber-500/20",
    violet: "text-violet-300 border-violet-500/20",
    teal: "text-teal-300 border-teal-500/20",
  };
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", accentMap[accent])} />
      </div>
      <div className="mt-2 text-2xl font-semibold tnum text-foreground">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
