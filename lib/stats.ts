import { PLANTS } from "./plants";
import type { PersonStat, PlantStat, WaterRecord } from "./types";

const DAY_MS = 1000 * 60 * 60 * 24;

/** "M/D" + 연도 → ISO "YYYY-MM-DD" */
export function toISO(mdDate: string, year: number): string {
  const m = mdDate.match(/(\d{1,2})\s*[/.]\s*(\d{1,2})/);
  if (!m) return mdDate;
  const month = m[1].padStart(2, "0");
  const day = m[2].padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatKor(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${Number(m[2])}/${Number(m[3])}`;
}

/** 식물별 통계: 마지막 물 준 날짜 + 평균 물 준 주기 */
export function computePlantStats(records: WaterRecord[]): PlantStat[] {
  return PLANTS.map((plant) => {
    const dates = records
      .filter((r) => r.plant === plant && /^\d{4}-\d{2}-\d{2}$/.test(r.date))
      .map((r) => r.date)
      .sort();
    const uniqueDates = Array.from(new Set(dates));

    let avgIntervalDays: number | null = null;
    if (uniqueDates.length >= 2) {
      let total = 0;
      for (let i = 1; i < uniqueDates.length; i++) {
        total += (Date.parse(uniqueDates[i]) - Date.parse(uniqueDates[i - 1])) / DAY_MS;
      }
      avgIntervalDays = Math.round((total / (uniqueDates.length - 1)) * 10) / 10;
    }

    return {
      plant,
      lastWatered: uniqueDates.length ? uniqueDates[uniqueDates.length - 1] : null,
      count: dates.length,
      avgIntervalDays,
    };
  });
}

/** 사람별 집계: 물 자주 준 사람 랭킹 */
export function computePersonStats(records: WaterRecord[]): PersonStat[] {
  const map = new Map<string, { count: number; days: Set<string> }>();
  for (const r of records) {
    if (!r.person) continue;
    const entry = map.get(r.person) ?? { count: 0, days: new Set<string>() };
    entry.count += 1;
    if (r.date) entry.days.add(r.date);
    map.set(r.person, entry);
  }
  return Array.from(map.entries())
    .map(([person, v]) => ({ person, count: v.count, days: v.days.size }))
    .sort((a, b) => b.count - a.count || b.days - a.days);
}
