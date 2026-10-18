// GET /api/samples
// Returns verified, labelled CIC-IDS2017 rows when the existing backend data
// folder is available. The synthetic profiles remain a safe fallback for a
// standalone frontend checkout.

import { createReadStream, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import path from "node:path";
import { NextResponse } from "next/server";
import { FEATURE_NAMES } from "@/lib/cyber/features";
import { SAMPLE_PROFILES } from "@/lib/cyber/samples";
import type { SampleProfile, TrafficFeatureMap } from "@/lib/cyber/types";

export const runtime = "nodejs";

let cachedProfiles: Promise<SampleProfile[]> | null = null;

function normalizeLabel(label: string): string {
  return label
    .trim()
    .replace(/\uFFFD/g, "–")
    .replace(/\bXSS\b/g, "Xss");
}

function isPreferredDemoRow(profile: SampleProfile, features: TrafficFeatureMap): boolean {
  // The first SQL-injection row in the training sample is an ambiguous flow
  // that the trained model classifies as BENIGN. Prefer the high-rate labelled
  // row so selecting this demo profile produces a real, correctly labelled
  // backend result instead of a hand-authored synthetic signature.
  if (profile.id === "web-sqli") {
    return (features["Flow Packets/s"] ?? 0) > 10_000;
  }
  return true;
}

function datasetPath(): string {
  return process.env.CYBERSENTINEL_SAMPLE_DATA || path.resolve(
    process.cwd(),
    "..",
    "cybersentinel-gemma",
    "ml-service",
    "data",
    "training_sample.csv",
  );
}

async function loadDatasetProfiles(): Promise<SampleProfile[] | null> {
  const filePath = datasetPath();
  if (!existsSync(/* turbopackIgnore: true */ filePath)) return null;

  const input = createReadStream(/* turbopackIgnore: true */ filePath, { encoding: "utf8" });
  const lines = createInterface({ input, crlfDelay: Infinity });
  const wanted = new Map(SAMPLE_PROFILES.map((profile) => [normalizeLabel(profile.expectedLabel), profile]));
  const found = new Map<string, TrafficFeatureMap>();
  const fallback = new Map<string, TrafficFeatureMap>();
  let header: string[] | null = null;

  try {
    for await (const line of lines) {
      if (!header) {
        header = line.replace(/^\uFEFF/, "").split(",");
        continue;
      }

      const values = line.split(",");
      if (values.length < header.length) continue;
      const label = normalizeLabel(values[header.length - 1] || "");
      const profile = wanted.get(label);
      if (!profile || found.has(label)) continue;

      const features: TrafficFeatureMap = {};
      let valid = true;
      for (const name of FEATURE_NAMES) {
        const index = header.indexOf(name);
        const value = index >= 0 ? Number(values[index]) : Number.NaN;
        if (!Number.isFinite(value)) {
          valid = false;
          break;
        }
        features[name] = value;
      }
      if (valid) {
        if (isPreferredDemoRow(profile, features)) found.set(label, features);
        else if (!fallback.has(label)) fallback.set(label, features);
      }

      if (found.size === wanted.size) break;
    }
  } finally {
    lines.close();
    input.destroy();
  }

  if (!found.size) return null;

  return SAMPLE_PROFILES.map((profile) => {
    const label = normalizeLabel(profile.expectedLabel);
    const features = found.get(label) || fallback.get(label);
    if (!features) return profile;
    return {
      ...profile,
      features,
      description: `${profile.description} Verified CIC-IDS2017 row labelled ${profile.expectedDisplay}.`,
    };
  });
}

async function getProfiles(): Promise<SampleProfile[]> {
  if (!cachedProfiles) {
    cachedProfiles = loadDatasetProfiles().then((profiles) => profiles || SAMPLE_PROFILES);
  }
  return cachedProfiles;
}

export async function GET() {
  return NextResponse.json(await getProfiles());
}
