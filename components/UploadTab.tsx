"use client";

import { useRef, useState } from "react";
import { PLANTS } from "@/lib/plants";
import { matchPlant } from "@/lib/plants";
import { matchPerson } from "@/lib/people";
import { toISO } from "@/lib/stats";
import type { ParseResult, WaterRecord } from "@/lib/types";
import ReviewTable from "@/components/ReviewTable";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UploadTab({ onSaved }: { onSaved: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<WaterRecord[]>([]);
  const [source, setSource] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(file: File | undefined) {
    if (!file) return;
    setError(null);
    setMessage(null);
    setDraft([]);
    setImage(await fileToDataUrl(file));
  }

  async function analyze() {
    if (!image) return;
    setParsing(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data: ParseResult & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "분석에 실패했습니다.");

      setSource(data.title || "");
      // 행(날짜/사람/식물목록) → 식물 단위 기록으로 펼치기
      const expanded: WaterRecord[] = [];
      for (const row of data.rows) {
        const iso = toISO(row.date, data.year);
        for (const p of row.plants) {
          expanded.push({
            date: iso,
            person: matchPerson(row.person || ""),
            plant: matchPlant(p) || p,
            note: row.note || "",
            source: data.title || "",
            createdAt: "",
          });
        }
      }
      if (expanded.length === 0) {
        setMessage("체크된 항목을 찾지 못했어요. 아래에서 직접 추가할 수 있어요.");
      }
      setDraft(expanded);
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석에 실패했습니다.");
    } finally {
      setParsing(false);
    }
  }

  async function save() {
    const valid = draft.filter((r) => r.date && r.plant);
    if (valid.length === 0) {
      setError("저장할 기록이 없어요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: valid.map((r) => ({ ...r, source: r.source || source })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "저장에 실패했습니다.");
      setMessage(`✅ ${data.saved}건 저장 완료! '물주기' · '랭킹' 탭에 반영됐어요.`);
      setDraft([]);
      setImage(null);
      if (inputRef.current) inputRef.current.value = "";
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="pixel-box p-4">
        <h2 className="mb-2 text-sm font-bold text-leaf-700">1. 물주기 표 사진 찍기</h2>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => onPick(e.target.files?.[0])}
          className="block w-full text-xs file:mr-2 file:border-2 file:border-leaf-800 file:bg-leaf-400 file:px-3 file:py-1 file:text-white"
        />
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="미리보기" className="mt-3 max-h-72 w-full border-2 border-leaf-300 object-contain" />
        )}
        {image && (
          <button onClick={analyze} disabled={parsing} className="pixel-btn mt-3 w-full">
            {parsing ? "분석 중… 🔍" : "사진 분석하기"}
          </button>
        )}
      </section>

      {message && (
        <div className="border-2 border-leaf-400 bg-leaf-50 p-3 text-xs text-leaf-700">{message}</div>
      )}
      {error && (
        <div className="border-2 border-red-400 bg-red-50 p-3 text-xs text-red-700">⚠️ {error}</div>
      )}

      {draft.length > 0 && (
        <section className="pixel-box p-4">
          <h2 className="mb-1 text-sm font-bold text-leaf-700">2. 결과 확인 & 수정</h2>
          <p className="mb-3 text-[13px] text-leaf-500">
            손글씨는 잘못 읽힐 수 있어요. 저장 전에 날짜·사람·식물을 확인하세요. (식물 목록:{" "}
            {PLANTS.join(", ")})
          </p>
          <ReviewTable rows={draft} onChange={setDraft} />
          <div className="mt-3 flex items-center gap-2">
            <label className="text-[13px] text-leaf-600">출처</label>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="예: 5~6월"
              className="pixel-input w-28 text-xs"
            />
            <button onClick={save} disabled={saving} className="pixel-btn ml-auto">
              {saving ? "저장 중…" : `💾 ${draft.filter((r) => r.date && r.plant).length}건 누적 저장`}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
