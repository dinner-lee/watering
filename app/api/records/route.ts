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

// (날짜, 사람, 식물)으로 한 건의 물주기를 식별 — 같은 키는 같은 기록으로 본다
function dedupKey(r: { date: string; person: string; plant: string }): string {
  return `${r.date.trim()}|${(r.person ?? "").trim()}|${r.plant.trim()}`;
}

export async function POST(req: NextRequest) {
  try {
    const { records } = (await req.json()) as { records: WaterRecord[] };
    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "저장할 기록이 없습니다." }, { status: 400 });
    }

    // 이미 등록된 기록과 비교해 중복(같은 날짜·사람·식물)은 건너뛴다
    const existing = await getRecords();
    const seen = new Set(existing.map(dedupKey));

    const toSave: WaterRecord[] = [];
    for (const r of records) {
      const key = dedupKey(r);
      if (seen.has(key)) continue; // 기존 또는 같은 사진 내 중복
      seen.add(key);
      toSave.push(r);
    }

    const skipped = records.length - toSave.length;
    if (toSave.length === 0) {
      return NextResponse.json({ saved: 0, skipped });
    }

    const createdAt = new Date().toISOString();
    const withMeta = toSave.map((r) => ({ ...r, createdAt: r.createdAt || createdAt }));
    const saved = await appendRecords(withMeta);
    return NextResponse.json({ saved, skipped });
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
