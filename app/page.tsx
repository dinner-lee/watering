"use client";

import { useCallback, useEffect, useState } from "react";
import type { WaterRecord } from "@/lib/types";
import UploadTab from "@/components/UploadTab";
import WateringTab from "@/components/WateringTab";
import RankingTab from "@/components/RankingTab";

type Tab = "upload" | "watering" | "ranking";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "upload", label: "사진 등록", icon: "/ui/camera.svg" },
  { key: "watering", label: "물주기", icon: "/ui/drop.svg" },
  { key: "ranking", label: "랭킹", icon: "/ui/trophy.svg" },
];

export default function Page() {
  const [tab, setTab] = useState<Tab>("upload");
  const [records, setRecords] = useState<WaterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-24 pt-6">
      <header className="mb-4 text-center">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-leaf-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/watering-can.svg"
            alt="물뿌리개"
            width={32}
            height={32}
            style={{ imageRendering: "pixelated" }}
          />
          농장 물주기 표
        </h1>
        <p className="mt-1 text-xs text-leaf-500">
          사진 한 장이면 자동으로 정리돼요 · 학습과학연구소
        </p>
      </header>

      {/* 탭 */}
      <nav className="mb-5 grid grid-cols-3 gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center justify-center gap-2 border-2 border-leaf-800 px-2 py-2 text-base shadow-pixel-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              tab === t.key ? "bg-leaf-500 text-white" : "bg-white text-leaf-800"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.icon}
              alt=""
              width={22}
              height={22}
              style={{ imageRendering: "pixelated" }}
            />
            {t.label}
          </button>
        ))}
      </nav>

      {error && (
        <div className="mb-4 border-2 border-red-400 bg-red-50 p-3 text-xs text-red-700">
          ⚠️ {error}
        </div>
      )}

      {tab === "upload" && <UploadTab onSaved={refresh} />}
      {tab === "watering" && <WateringTab records={records} loading={loading} />}
      {tab === "ranking" && <RankingTab records={records} loading={loading} />}
    </main>
  );
}
