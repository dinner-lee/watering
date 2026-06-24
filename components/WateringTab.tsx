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
              className={`pixel-box relative flex flex-col items-center p-2 text-center${
                thirsty ? " !bg-sky-100" : ""
              }`}
            >
              {thirsty && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/ui/drop.svg"
                  alt="목말라요"
                  title="목말라요"
                  width={16}
                  height={16}
                  className="absolute right-1 top-1"
                  style={{ imageRendering: "pixelated" }}
                />
              )}
              <PlantIcon plant={s.plant} size={40} />
              <div className="mt-1 flex items-center gap-1">
                <span className="text-sm font-bold leading-tight text-leaf-800">{s.plant}</span>
              </div>
              <div className="mt-1 grid w-full grid-cols-[auto_1fr] gap-x-2 gap-y-1 border-t-2 border-leaf-100 pt-1.5 text-[12px] leading-none text-leaf-600">
                <span className="text-left text-leaf-500">마지막</span>
                <span className="text-right">
                  <b className="text-leaf-800">
                    {s.lastWatered ? formatKor(s.lastWatered) : "—"}
                  </b>
                  {ago != null && <span className="text-leaf-400"> ({ago}일전)</span>}
                </span>

                <span className="text-left text-leaf-500">평균주기</span>
                <span className="text-right">
                  <b className="text-leaf-800">
                    {s.avgIntervalDays != null ? `${s.avgIntervalDays}일` : "—"}
                  </b>
                </span>

                <span className="text-left text-leaf-500">총</span>
                <span className="text-right">
                  <b className="text-leaf-800">{s.count}회</b>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
