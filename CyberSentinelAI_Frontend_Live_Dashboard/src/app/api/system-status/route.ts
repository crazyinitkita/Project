import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NODE_URL = process.env.CYBERSENTINEL_API_URL || "http://127.0.0.1:3000";
const ML_URL = process.env.CYBERSENTINEL_ML_URL || "http://127.0.0.1:8000";

async function check(url: string) {
  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(2500) });
    const body = await response.json().catch(() => ({}));
    return { online: response.ok, httpStatus: response.status, details: body };
  } catch (error) {
    return { online: false, httpStatus: null, details: { error: error instanceof Error ? error.message : "Connection failed" } };
  }
}

export async function GET() {
  const [node, ml] = await Promise.all([check(`${NODE_URL}/health`), check(`${ML_URL}/health`)]);
  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    node,
    ml,
    overall: node.online && ml.online ? "online" : "degraded",
  }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
