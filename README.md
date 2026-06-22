# 🌱 농장 물주기 표

손글씨 "물주기 표" 사진을 찍으면 Gemini 가 자동으로 날짜·물 준 사람·물 준 식물을 읽어
Google 스프레드시트에 **누적 저장**하는 도트(픽셀) 콘셉트 웹앱입니다. (Next.js · Vercel)

## 탭 구성
- **사진 등록**: 카메라/사진 업로드 → AI 분석 → 표 확인·수정 → 누적 저장
- **물주기**: 식물별 마지막 물 준 날짜 + 평균 물 준 주기 (+ 목마름 경고)
- **랭킹**: 물 자주 준 사람 순위

---

## 1) 로컬 실행

```bash
cd /Users/jungchan/watering
npm install
npm run dev   # http://localhost:3000
```

## 2) 환경변수 설정 (`.env.local`)

`.env.local.example` 을 참고하세요. 항목:

### Gemini (사진 분석)
- `GEMINI_API_KEY` — https://aistudio.google.com 의 *Get API key* 에서 발급 (보통 `AIza...`)
- `GEMINI_MODEL` — 기본 `gemini-2.0-flash` (그대로 두면 됨)

### Google Sheets (데이터 저장)
1. https://console.cloud.google.com 에서 프로젝트 생성 → **Google Sheets API** 사용 설정
2. **서비스 계정** 생성 → 키(JSON) 발급
3. JSON 에서 값 복사:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (줄바꿈을 `\n` 으로, 큰따옴표로 감싸기)
4. 저장용 구글 스프레드시트를 하나 만들고, **그 서비스 계정 이메일을 편집자로 공유**
5. 스프레드시트 URL 의 `/d/` 와 `/edit` 사이 ID → `GOOGLE_SHEETS_ID`
6. 시트 첫 탭 이름은 `기록` 으로 두세요(없으면 자동으로 헤더가 생성됩니다).

> 데이터는 `기록` 시트에 `날짜 | 물 준 사람 | 식물 | 비고 | 출처 | 기록시각` 으로 한 줄씩 누적됩니다.

## 3) Vercel 배포

```bash
npm i -g vercel   # 최초 1회
vercel            # 프로젝트 연결
vercel --prod     # 배포
```

배포 후 **Vercel 대시보드 → Settings → Environment Variables** 에 위 환경변수를 모두 등록하세요.
모바일에서 접속 후 "홈 화면에 추가" 하면 앱처럼 카메라로 쓸 수 있습니다(PWA).

---

## 식물 목록 / 디자인 수정
- 식물 이름·아이콘: `lib/plants.ts` 의 `PLANTS`, `PLANT_EMOJI`
- 색/폰트(도트): `tailwind.config.ts`, `app/globals.css`

## 보안 메모
- Gemini 키는 서버(API 라우트)에서만 사용되어 브라우저에 노출되지 않습니다.
- `.env.local` 은 git 에 커밋되지 않습니다(`.gitignore` 포함).
