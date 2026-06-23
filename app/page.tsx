"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WaterRecord } from "@/lib/types";
import UploadTab from "@/components/UploadTab";
import WateringTab from "@/components/WateringTab";
import RankingTab from "@/components/RankingTab";

type Tab = "watering" | "ranking";

const TABS: { key: Tab; label: string }[] = [
  { key: "watering", label: "물주기" },
  { key: "ranking", label: "랭킹" },
];

function formatUploadedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("watering");
  const [records, setRecords] = useState<WaterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/records", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "기록을 불러오지 못했습니다.");
      setRecords(data.records ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "기록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // 가장 마지막으로 사진을 등록한(기록을 저장한) 시각
  const lastUploadedAt = useMemo(() => {
    let latest: string | null = null;
    for (const r of records) {
      if (!r.createdAt) continue;
      if (!latest || r.createdAt > latest) latest = r.createdAt;
    }
    return latest;
  }, [records]);

  function onFabClick() {
    // 모달을 거치지 않고 바로 카메라/파일 선택을 연다
    fileInputRef.current?.click();
  }

  function onFilePicked(file: File | undefined) {
    if (!file) return;
    setPendingFile(file);
    setUploadOpen(true);
  }

  return (
    <>
      {/* 상단 네비게이션 바 */}
      <header className="wood-bar sticky top-0 z-30 border-b-2 border-leaf-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-2">
          <div className="flex min-w-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/watering-can.svg"
              alt="물뿌리개"
              width={28}
              height={28}
              className="shrink-0"
              style={{ imageRendering: "pixelated" }}
            />
            <div
              className="min-w-0 text-left leading-tight"
              style={{ textShadow: "0 1px 0 rgba(255,240,220,0.4)" }}
            >
              <h1 className="truncate text-lg font-bold text-leaf-900">농장 물주기 표</h1>
              <p className="truncate text-[11px] font-bold text-leaf-800">
                사진 한 장이면 자동으로 정리돼요
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right leading-tight">
            <p
              className="text-[10px] font-bold text-[#4a3526]"
              style={{ textShadow: "0 1px 0 rgba(255,240,220,0.4)" }}
            >
              마지막 등록
            </p>
            <span className="dot-pill mt-0.5 whitespace-nowrap px-2 py-0.5 text-[11px] font-bold">
              {lastUploadedAt ? formatUploadedAt(lastUploadedAt) : "—"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-28 pt-5">
        {error && (
          <div className="mb-4 border-2 border-red-400 bg-red-50 p-3 text-xs text-red-700">
            ⚠️ {error}
          </div>
        )}

        {tab === "watering" && <WateringTab records={records} loading={loading} />}
        {tab === "ranking" && <RankingTab records={records} loading={loading} />}
      </main>

      {/* 숨겨진 파일 입력 (카메라/파일 선택) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          onFilePicked(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {/* 사진 등록 플로팅 버튼 (우측 하단, 카메라 아이콘) */}
      <button
        onClick={onFabClick}
        aria-label="사진 등록"
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center border-2 border-leaf-800 bg-leaf-500 text-white shadow-pixel transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ui/camera.svg"
          alt=""
          width={28}
          height={28}
          style={{ imageRendering: "pixelated" }}
        />
      </button>

      {/* 촬영 후 결과 확인/저장 화면 */}
      {uploadOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-black/40">
          <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col overflow-y-auto bg-cream px-4 pb-10 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-leaf-700">사진 등록</h2>
              <button
                onClick={() => {
                  setUploadOpen(false);
                  setPendingFile(null);
                }}
                aria-label="닫기"
                className="border-2 border-leaf-800 bg-white px-3 py-1 text-leaf-800 shadow-pixel-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                ✕ 닫기
              </button>
            </div>
            <UploadTab
              initialFile={pendingFile}
              onSaved={() => {
                refresh();
                setUploadOpen(false);
                setPendingFile(null);
              }}
            />
          </div>
        </div>
      )}

      {/* 하단 탭 (모바일 친화) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-leaf-800">
        <div className="mx-auto grid max-w-3xl grid-cols-2 divide-x-2 divide-leaf-900/40">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`wood-tab flex items-center justify-center py-4 text-base font-bold ${
                tab === t.key ? "wood-tab--active" : ""
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
