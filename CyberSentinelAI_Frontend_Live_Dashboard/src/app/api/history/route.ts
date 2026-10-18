import { NextResponse } from "next/server";
import { readServerAnalyses } from "@/lib/cyber/server-history";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(readServerAnalyses());
}
