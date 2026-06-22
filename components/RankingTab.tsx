"use client";

import { computePersonStats } from "@/lib/stats";
import type { WaterRecord } from "@/lib/types";

const MEDAL_IMG = ["/ui/medal-gold.svg", "/ui/medal-silver.svg", "/ui/medal-bronze.svg"];

export default function RankingTab({
  records,
  loading,
}: {
  records: WaterRecord[];
  loading: boolean;
}) {
  if (loading) return <p className="text-center text-sm text-leaf-500">불러오는 중… 🌿</p>;

  const stats = computePersonStats(records);
  const max = stats[0]?.count ?? 1;

  if (stats.length === 0) {
    return <p className="text-center text-sm text-leaf-500">아직 기록이 없어요. 사진을 등록해 주세요!</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-leaf-500">물 자주 준 사람 랭킹 (총 물 준 횟수 기준)</p>
      {stats.map((s, i) => (
        <div key={s.person} className="pixel-box p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-base font-bold text-leaf-800">
              {i < 3 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={MEDAL_IMG[i]}
                  alt={`${i + 1}위`}
                  width={26}
                  height={26}
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <span className="w-[26px] text-center text-leaf-500">{i + 1}.</span>
              )}
              {s.person || "(이름 없음)"}
            </span>
            <span className="text-sm text-leaf-600">
              {s.count}회 · {s.days}일
            </span>
          </div>
          {/* 도트 막대 그래프 */}
          <div className="mt-2 h-3 w-full border border-leaf-300 bg-white">
            <div
              className="h-full bg-leaf-400"
              style={{ width: `${Math.max(6, (s.count / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
