// 사진 한 줄에서 추출된 원시 데이터: (날짜, 사람, 체크된 식물들)
export interface ParsedRow {
  date: string; // "MM/DD" (예: "5/28")
  person: string;
  plants: string[]; // 체크된 식물 이름들
  note?: string; // "영양제 첨가" 같은 메모
}

export interface ParseResult {
  title: string; // 제목 줄 (예: "5~6월")
  year: number; // 추론 연도
  rows: ParsedRow[];
}

// 스프레드시트에 저장되는 최종 단위: 한 식물에 한 번 물 준 기록
export interface WaterRecord {
  date: string; // ISO "YYYY-MM-DD"
  person: string;
  plant: string;
  note: string;
  source: string; // 출처 (예: "5~6월")
  createdAt: string; // 기록 시각 ISO
}

// 물주기 탭: 식물별 통계
export interface PlantStat {
  plant: string;
  lastWatered: string | null; // ISO
  count: number;
  avgIntervalDays: number | null; // 평균 물 준 주기(일)
}

// 랭킹 탭: 사람별 집계
export interface PersonStat {
  person: string;
  count: number; // 총 물 준 횟수(식물 단위)
  days: number; // 물 준 날 수(고유 날짜)
}
