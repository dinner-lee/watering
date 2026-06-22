import { NextRequest, NextResponse } from "next/server";
import { appendRecords, getRecords } from "@/lib/sheets";
import type { WaterRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const records = await getRecords();
    return NextResponse.json({ records });
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json({ error: message, records: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { records } = (await req.json()) as { records: WaterRecord[] };
    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "저장할 기록이 없습니다." }, { status: 400 });
    }
    const createdAt = new Date().toISOString();
    const withMeta = records.map((r) => ({ ...r, createdAt: r.createdAt || createdAt }));
    const saved = await appendRecords(withMeta);
    return NextResponse.json({ saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
