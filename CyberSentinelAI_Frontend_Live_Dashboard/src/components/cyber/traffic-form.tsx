"use client";

import { useState } from "react";
import {
  Beaker, FileJson, RotateCcw, Play, Search, ChevronRight,
  SlidersHorizontal, Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FEATURE_NAMES, FEATURE_METADATA, featuresByCategory, HIGHLIGHT_FEATURES } from "@/lib/cyber/features";
import type { SampleProfile, TrafficFeatureMap } from "@/lib/cyber/types";

interface TrafficFormProps {
  features: TrafficFeatureMap;
  onFeaturesChange: (f: TrafficFeatureMap) => void;
  onAnalyze: () => void;
  loading: boolean;
  samples: SampleProfile[];
  activeSampleId: string | null;
  onPickSample: (id: string) => void;
}

export function TrafficForm({
  features, onFeaturesChange, onAnalyze, loading, samples, activeSampleId, onPickSample,
}: TrafficFormProps) {
  const [query, setQuery] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const grouped = featuresByCategory();

  const setFeature = (name: string, value: number) => {
    onFeaturesChange({ ...features, [name]: value });
  };

  const reset = () => {
    onPickSample("benign");
    toast.info("Reset to the Benign HTTPS sample.");
  };

  const applyJson = () => {
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonText);
      const src: Record<string, unknown> =
        parsed && typeof parsed === "object" && "features" in parsed
          ? (parsed.features as Record<string, unknown>)
          : (parsed as Record<string, unknown>);
      const next: TrafficFeatureMap = {};
      let known = 0;
      for (const name of FEATURE_NAMES) {
        if (name in src) {
          const v = Number(src[name]);
          next[name] = Number.isFinite(v) ? v : 0;
          known++;
        } else {
          next[name] = features[name] ?? 0;
        }
      }
      if (known < FEATURE_NAMES.length) {
        setJsonError(`Only ${known}/${FEATURE_NAMES.length} known features found. Missing fields kept their current value.`);
      }
      onFeaturesChange(next);
      toast.success(`Loaded ${known} feature values from JSON.`);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON.");
    }
  };

  const exportJson = () => {
    const text = JSON.stringify({ features }, null, 2);
    setJsonText(text);
    navigator.clipboard?.writeText(text).then(
      () => toast.success("Feature JSON copied to clipboard."),
      () => {},
    );
  };

  const filteredCategories = Object.entries(grouped).map(([cat, feats]) => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? feats.filter((f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q))
      : feats;
    return { cat, feats: filtered };
  }).filter((g) => g.feats.length > 0);

  return (
    <Card className="border-border bg-card/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
            Traffic flow input
          </CardTitle>
          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
            {FEATURE_NAMES.length} features
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sample loader */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Load a sample traffic profile</Label>
          <div className="flex gap-2">
            <Select value={activeSampleId ?? ""} onValueChange={onPickSample}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a sample…" />
              </SelectTrigger>
              <SelectContent>
                {samples.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 rounded-full", s.expectedLabel === "BENIGN" ? "bg-emerald-400" : "bg-rose-400")} />
                      {s.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={reset} title="Reset to benign sample">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          {activeSampleId && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {samples.find((s) => s.id === activeSampleId)?.description}
            </p>
          )}
        </div>

        <Tabs defaultValue="quick">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick" className="text-xs"><SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />Quick edit</TabsTrigger>
            <TabsTrigger value="full" className="text-xs"><Beaker className="h-3.5 w-3.5 mr-1.5" />All features</TabsTrigger>
            <TabsTrigger value="json" className="text-xs"><FileJson className="h-3.5 w-3.5 mr-1.5" />JSON</TabsTrigger>
          </TabsList>

          {/* Quick edit — high-signal subset */}
          <TabsContent value="quick" className="mt-3 space-y-2.5">
            {HIGHLIGHT_FEATURES.map((name) => {
              const meta = FEATURE_METADATA[name];
              return (
                <div key={name} className="grid grid-cols-12 items-center gap-2">
                  <div className="col-span-6">
                    <Label className="text-xs text-foreground/85" title={meta?.description}>{name}</Label>
                    <p className="text-[10px] text-muted-foreground truncate">{meta?.unit}</p>
                  </div>
                  <Input
                    type="number"
                    step="any"
                    className="col-span-6 h-8 tnum"
                    value={features[name] ?? 0}
                    onChange={(e) => setFeature(name, Number(e.target.value))}
                  />
                </div>
              );
            })}
            <p className="pt-1 text-[11px] text-muted-foreground">
              The remaining {FEATURE_NAMES.length - HIGHLIGHT_FEATURES.length} features use the loaded sample's values. Switch to “All features” to edit them.
            </p>
          </TabsContent>

          {/* Full feature editor — grouped, searchable */}
          <TabsContent value="full" className="mt-3">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search features…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8 pl-8"
              />
            </div>
            <Accordion type="multiple" defaultValue={["Flow Identity"]} className="max-h-[28rem] overflow-y-auto scroll-thin pr-1">
              {filteredCategories.map(({ cat, feats }) => (
                <AccordionItem key={cat} value={cat}>
                  <AccordionTrigger className="text-xs hover:no-underline py-2.5">
                    <span className="flex items-center gap-2">
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      {cat}
                      <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">{feats.length}</Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pb-2">
                    {feats.map((meta) => (
                      <div key={meta.name} className="grid grid-cols-12 items-center gap-2">
                        <div className="col-span-7">
                          <Label className="text-xs text-foreground/85" title={meta.description}>{meta.name}</Label>
                          <p className="text-[10px] text-muted-foreground truncate">{meta.description}</p>
                        </div>
                        <Input
                          type="number"
                          step="any"
                          className="col-span-5 h-8 tnum"
                          value={features[meta.name] ?? 0}
                          onChange={(e) => setFeature(meta.name, Number(e.target.value))}
                        />
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          {/* JSON mode */}
          <TabsContent value="json" className="mt-3 space-y-2">
            <p className="text-[11px] text-muted-foreground">
              Paste a feature object (or the full request shape from <code>test_request.json</code>). Unknown keys are ignored; missing keys keep their current value.
            </p>
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`{\n  "Destination Port": 80,\n  "Flow Packets/s": 71666,\n  ...\n}`}
              className="font-mono text-xs min-h-[14rem] scroll-thin"
            />
            {jsonError && <p className="text-[11px] text-amber-300">{jsonError}</p>}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={applyJson} className="text-xs">
                <Upload className="h-3.5 w-3.5 mr-1.5" /> Apply JSON
              </Button>
              <Button variant="ghost" size="sm" onClick={exportJson} className="text-xs">
                <FileJson className="h-3.5 w-3.5 mr-1.5" /> Export current
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Analyze */}
        <div className="flex gap-2 pt-1">
          <Button onClick={onAnalyze} disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-emerald-50">
            {loading ? (
              <><span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-50/40 border-t-emerald-50" /> Analyzing…</>
            ) : (
              <><Play className="h-4 w-4 mr-2" /> Analyze traffic</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
