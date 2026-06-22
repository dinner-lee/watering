// 농장에 물 주는 사람 명단. OCR 결과를 이 명단 중 하나로 정규화합니다.
export const PEOPLE = ["박소미", "김은주", "박한가연", "이정찬", "장민서"] as const;

export type Person = (typeof PEOPLE)[number];

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

/** 임의의 손글씨 이름을 명단(PEOPLE) 중 가장 가까운 이름으로 정규화. */
export function matchPerson(raw: string): string {
  const name = (raw || "").replace(/\s+/g, "").trim();
  if (!name) return "";
  // 정확 일치
  if ((PEOPLE as readonly string[]).includes(name)) return name;
  // 최소 편집거리
  let best = name;
  let bestDist = Infinity;
  for (const p of PEOPLE) {
    const d = levenshtein(name, p);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  // 이름 길이의 절반 이내로 비슷하면 정규화, 아니면 원본 유지
  return bestDist <= Math.ceil(Math.max(name.length, 3) / 2) ? best : name;
}
