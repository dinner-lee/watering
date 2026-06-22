import { PLANTS } from "./plants";
import { PEOPLE } from "./people";
import type { ParseResult } from "./types";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

function buildPrompt(): string {
  return `너는 손글씨 "농장 물주기 표" 사진을 읽어 데이터로 변환하는 도우미야.

표 구조:
- 제목 줄에 기간이 적혀 있어 (예: "5~6월"). 이 기간으로 연도/월 맥락을 잡아.
- 각 데이터 행 = (날짜, 물 준 사람) 한 명.
- 식물 열 순서: ${PLANTS.join(", ")}.
- 각 식물 칸에 체크(✓, v, 점 등) 표시가 있으면 그날 그 식물에 물을 준 것.
- 빈 칸은 물을 주지 않은 것.

날짜 규칙(매우 중요):
- 날짜 칸에 "28", "29" 처럼 일(day)만 적힌 경우, 제목의 시작 월(예 5월)로 본다 → "5/28".
- "6/1" 처럼 월이 바뀌는 표시가 나오면, 그 행부터 아래는 그 월(6월)로 본다 → 이후의 "4","5","12"는 "6/4","6/5","6/12".
- 결과 date 는 항상 "M/D" 형식(예 "5/28", "6/4").
- 날짜 칸이 비어 있으면(연속 행) 바로 위 행과 같은 날짜로 채운다.

사람 이름(매우 중요):
- 물 준 사람은 반드시 다음 명단 중 하나로만 적는다: ${PEOPLE.join(", ")}.
- 손글씨가 살짝 달라도 가장 비슷한 명단 이름으로 맞춘다. (예: "박쏘미/박노미"→"박소미", "김은유/김은쥬"→"김은주", "박한가"→"박한가연", "이정구/이정츠"→"이정찬")

기타:
- title 에는 제목 줄의 밑줄 친 기간만 적는다 (예: "5~6월"). 사진에 연도가 없으면 year 는 비워둔다.
- "영양제 첨가", "첫째", "모두" 같은 추가 메모는 note 에 적는다.
- 식물 이름은 위 목록의 정확한 표기를 사용한다.
- 체크가 하나도 없는 행은 plants 를 빈 배열로 둔다.

반드시 지정된 JSON 스키마로만 응답해.`;
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    year: { type: "integer" },
    rows: {
      type: "array",
      items: {
        type: "object",
        properties: {
          date: { type: "string" },
          person: { type: "string" },
          plants: { type: "array", items: { type: "string" } },
          note: { type: "string" },
        },
        required: ["date", "person", "plants"],
      },
    },
  },
  required: ["title", "year", "rows"],
};

export async function parseImage(
  base64Data: string,
  mimeType: string,
  fallbackYear: number
): Promise<ParseResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const res = await fetch(`${ENDPOINT}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: buildPrompt() },
            { inline_data: { mime_type: mimeType, data: base64Data } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini 요청 실패 (${res.status}): ${text.slice(0, 500)}`);
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Gemini 응답이 비어 있습니다.");

  let parsed: ParseResult;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Gemini 응답을 JSON 으로 해석할 수 없습니다.");
  }
  // 사진에는 연도가 없으므로 모델의 추측을 신뢰하지 않는다.
  // 제목에 4자리 연도가 있으면 사용하고, 없으면 항상 현재 연도(fallback)를 쓴다.
  const titleYear = parsed.title?.match(/(20\d{2})/)?.[1];
  parsed.year = titleYear ? Number(titleYear) : fallbackYear;
  parsed.rows = Array.isArray(parsed.rows) ? parsed.rows : [];
  return parsed;
}
