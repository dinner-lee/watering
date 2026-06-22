#!/usr/bin/env bash
# .env.local 의 값을 Vercel 프로젝트 환경변수로 업로드합니다.
# 사전 조건: `vercel login` + `vercel link` 가 끝나 있어야 합니다.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env.local ]; then echo ".env.local 이 없습니다."; exit 1; fi
# .env.local 로드
set -a; . ./.env.local; set +a

VARS=(GEMINI_API_KEY GEMINI_MODEL GOOGLE_SHEETS_ID GOOGLE_SERVICE_ACCOUNT_EMAIL GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)

add() {
  local name="$1"; local val="$2"
  for env in production preview development; do
    vercel env rm "$name" "$env" -y >/dev/null 2>&1 || true
    printf '%s' "$val" | vercel env add "$name" "$env" >/dev/null
    echo "  ✓ $name → $env"
  done
}

echo "환경변수 업로드 시작..."
for v in "${VARS[@]}"; do
  add "$v" "${!v}"
done
echo "✅ 모든 환경변수 업로드 완료"
