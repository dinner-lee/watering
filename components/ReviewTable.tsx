"use client";

import { PLANTS, PLANT_EMOJI } from "@/lib/plants";
import type { WaterRecord } from "@/lib/types";

export default function ReviewTable({
  rows,
  onChange,
}: {
  rows: WaterRecord[];
  onChange: (rows: WaterRecord[]) => void;
}) {
  function update(i: number, patch: Partial<WaterRecord>) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function remove(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }
  function add() {
    const last = rows[rows.length - 1];
    onChange([
      ...rows,
      {
        date: last?.date || "",
        person: last?.person || "",
        plant: PLANTS[0],
        note: "",
        source: last?.source || "",
        createdAt: "",
      },
    ]);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="bg-leaf-100 text-leaf-800">
            <th className="border border-leaf-300 p-1">날짜</th>
            <th className="border border-leaf-300 p-1">물 준 사람</th>
            <th className="border border-leaf-300 p-1">식물</th>
            <th className="border border-leaf-300 p-1">비고</th>
            <th className="border border-leaf-300 p-1"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="odd:bg-white even:bg-cream">
              <td className="border border-leaf-300 p-1">
                <input
                  type="date"
                  value={r.date}
                  onChange={(e) => update(i, { date: e.target.value })}
                  className="pixel-input w-[120px] text-[12px]"
                />
              </td>
              <td className="border border-leaf-300 p-1">
                <input
                  value={r.person}
                  onChange={(e) => update(i, { person: e.target.value })}
                  className="pixel-input w-20 text-[12px]"
                />
              </td>
              <td className="border border-leaf-300 p-1">
                <select
                  value={r.plant}
                  onChange={(e) => update(i, { plant: e.target.value })}
                  className="pixel-input text-[12px]"
                >
                  {PLANTS.map((p) => (
                    <option key={p} value={p}>
                      {PLANT_EMOJI[p] ?? "🌿"} {p}
                    </option>
                  ))}
                  {!PLANTS.includes(r.plant as (typeof PLANTS)[number]) && (
                    <option value={r.plant}>❓ {r.plant}</option>
                  )}
                </select>
              </td>
              <td className="border border-leaf-300 p-1">
                <input
                  value={r.note}
                  onChange={(e) => update(i, { note: e.target.value })}
                  className="pixel-input w-24 text-[12px]"
                />
              </td>
              <td className="border border-leaf-300 p-1 text-center">
                <button onClick={() => remove(i)} className="text-red-500" aria-label="삭제">
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={add} className="pixel-btn-ghost mt-2 text-[12px]">
        + 행 추가
      </button>
    </div>
  );
}
