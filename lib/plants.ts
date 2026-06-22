// 농장 식물 목록 (사진의 표 열 순서 그대로).
// 식물이 바뀌면 이 배열만 수정하면 앱 전체에 반영됩니다.
export const PLANTS = [
  "콩고기",
  "야~!자타임",
  "폴짝이",
  "시드머니",
  "산호수",
  "C₃H₆N₆",
  "토마테",
  "포인이",
  "츄쨩",
] as const;

export type Plant = (typeof PLANTS)[number];

// 식물별 도트 아이콘(이모지). 대부분 기존 이모지를 유지.
export const PLANT_EMOJI: Record<string, string> = {
  콩고기: "🥩",
  "야~!자타임": "🌴",
  폴짝이: "🌿",
  시드머니: "💰",
  산호수: "🪸",
  "C₃H₆N₆": "🧪",
  토마테: "🍅",
  포인이: "🌺",
  츄쨩: "🥬",
};

// 식물별 전용 픽셀(도트) 이미지. (없으면 위 이모지로 대체)
export const PLANT_IMAGE: Record<string, string> = {
  콩고기: "/plants/spam.svg", // 구워진 스팸
  "야~!자타임": "/plants/palm.svg", // 야자나무
  폴짝이: "/plants/sprout.svg", // 새싹
  시드머니: "/plants/seedmoney.svg", // 씨앗+금화
  산호수: "/plants/coral.svg", // 산호빛 열매 나무
  "C₃H₆N₆": "/plants/flask.svg", // 실험 플라스크
  토마테: "/plants/tomato.svg", // 토마토
  포인이: "/plants/poinsettia.svg", // 포인세티아
  츄쨩: "/plants/lettuce.svg", // 상추
};

// OCR 이 살짝 다르게 읽은 이름을 표준 이름으로 맞춰줍니다.
function normalize(s: string): string {
  return s.replace(/\s+/g, "").replace(/[~!^_]/g, "").toLowerCase();
}

const NORMALIZED = PLANTS.map((p) => ({ plant: p, key: normalize(p) }));

/** 임의의 문자열을 가장 비슷한 표준 식물 이름으로 매칭. 매칭 실패 시 null. */
export function matchPlant(raw: string): Plant | null {
  const key = normalize(raw);
  if (!key) return null;
  // 1) 정확 일치
  const exact = NORMALIZED.find((n) => n.key === key);
  if (exact) return exact.plant as Plant;
  // 2) 부분 포함
  const partial = NORMALIZED.find((n) => n.key.includes(key) || key.includes(n.key));
  if (partial) return partial.plant as Plant;
  return null;
}
