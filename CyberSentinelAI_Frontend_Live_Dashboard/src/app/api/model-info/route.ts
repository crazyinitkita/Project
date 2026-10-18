// Compatibility endpoint: returns live service metadata instead of static evaluation/demo metrics.
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NODE_URL = process.env.CYBERSENTINEL_API_URL || "http://127.0.0.1:3000";
const ML_URL = process.env.CYBERSENTINEL_ML_URL || "http://127.0.0.1:8000";

async function getHealth(url: string) {
  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(2500) });
    return { online: response.ok, httpStatus: response.status, details: await response.json().catch(() => ({})) };
  } catch (error) {
    return { online: false, httpStatus: null, details: { error: error instanceof Error ? error.message : "Connection failed" } };
  }
}

export async function GET() {
  const [node, ml] = await Promise.all([getHealth(`${NODE_URL}/health`), getHealth(`${ML_URL}/health`)]);
  return NextResponse.json({ generatedAt: new Date().toISOString(), node, ml, evaluation: null, evaluationMessage: "The live backend does not expose a verified evaluation report." }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
