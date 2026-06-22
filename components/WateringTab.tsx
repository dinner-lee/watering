"use client";

import { computePlantStats, formatKor } from "@/lib/stats";
import type { WaterRecord } from "@/lib/types";
import PlantIcon from "@/components/PlantIcon";

export default function WateringTab({
  records,
  loading,
}: {
  records: WaterRecord[];
  loading: boolean;
}) {
  if (loading) return <p className="text-center text-sm text-leaf-500">불러오는 중… 🌿</p>;

  const stats = computePlantStats(records);
  const today = new Date();

  function daysAgo(iso: string | null): number | null {
    if (!iso) return null;
    const diff = (today.getTime() - Date.parse(iso)) / (1000 * 60 * 60 * 24);
    return Math.floor(diff);
  }

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-leaf-500">
        총 {records.length}건 기록 · 식물별 마지막 물 준 날짜와 평균 주기예요.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => {
          const ago = daysAgo(s.lastWatered);
          const thirsty = s.avgIntervalDays != null && ago != null && ago > s.avgIntervalDays;
          return (
            <div
              key={s.plant}
              className="pixel-box flex flex-col items-center p-2 text-center"
            >
              <PlantIcon plant={s.plant} size={40} />
              <div className="mt-1 flex items-center gap-1">
                <span className="text-sm font-bold leading-tight text-leaf-800">{s.plant}</span>
              </div>
              {thirsty && (
                <span className="mt-0.5 border border-red-300 bg-red-50 px-1 text-[11px] text-red-600">
                  목말라요 💦
                </span>
              )}
              <div className="mt-1 w-full border-t border-leaf-100 pt-1 text-[12px] leading-snug text-leaf-600">
                <div>
                  마지막
                  <br />
                  <b className="text-leaf-800">
                    {s.lastWatered ? formatKor(s.lastWatered) : "—"}
                  </b>
                  {ago != null && <span className="text-leaf-400"> ({ago}일전)</span>}
                </div>
                <div className="mt-0.5">
                  평균주기 <b className="text-leaf-800">{s.avgIntervalDays != null ? `${s.avgIntervalDays}일` : "—"}</b>
                </div>
                <div className="mt-0.5 text-leaf-400">총 {s.count}회</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
