@AGENTS.md

# Diet Daily

체중 관리 웹앱. 매일 아침·저녁 체중을 기록하고, 추이·예측·AI 분석으로 다이어트를 응원한다.

## 기술 스택

- **프레임워크**: Next.js 16.2.3 (App Router, Turbopack)
- **언어**: TypeScript
- **UI**: React 19, Tailwind CSS v4, 감자꽃(Gamja Flower) 손글씨체
- **차트**: Recharts
- **AI**: Claude API (@anthropic-ai/sdk) — 모델 `claude-haiku-4-5-20251001`, 건강 분석 기능
- **백엔드/DB**: Supabase (`@supabase/supabase-js`)
- **배포**: Vercel (https://diet-daily.vercel.app)
- **저장소**: https://github.com/qorrmdgjs-bot/diet-daily

## 아키텍처 한눈에 보기

```
브라우저(클라이언트)
 ├─ localStorage ('diet-daily-data')      ← 1차 저장, 오프라인 캐시
 ├─ Supabase JS (anon key, 직접 호출)      ← 영구 DB (weight_entries, user_settings)
 └─ POST /api/analysis (Next.js 서버)      ← 유일한 서버 코드, Claude API 호출
                                              (ANTHROPIC_API_KEY는 서버에만)
```

- **데이터 저장 위치**: 영구 저장소는 **Supabase**, 브라우저 localStorage는 즉시 반영·오프라인용 캐시.
- **백엔드 동작 위치**: (1) Supabase에 클라이언트가 직접 붙어 DB CRUD, (2) AI 분석만 Next.js API 라우트(로컬은 localhost, 배포 시 Vercel 서버리스 함수)에서 실행.
- **배포 위치**: Vercel 프로젝트 `diet-daily`. GitHub `main` push → Vercel 자동 빌드/배포, 또는 `npx vercel --prod` 수동 배포.

## 데이터 저장 & 동기화

저장 로직은 [src/utils/storage.ts](src/utils/storage.ts), Supabase 클라이언트는 [src/lib/supabase.ts](src/lib/supabase.ts).

- **저장(쓰기)**: `addWeightEntry` / `updateSettings`가 먼저 localStorage에 저장한 뒤, `weight_entries`(날짜 `onConflict` upsert) · `user_settings`(`id=1` update)로 동기화. 네트워크 오류 시 조용히 실패하고 로컬만 유지.
- **불러오기(읽기)**: `loadWeightData()`는 localStorage에서 즉시 로드. `syncFromSupabase()`는 **서버 우선 병합** — 서버 데이터를 기준으로, 로컬에만 있는 날짜는 서버에 올리고 병합 결과를 localStorage에 다시 저장.
- **Supabase 테이블**:
  - `weight_entries`: `date`(PK·고유), `morning`, `evening`, `mood`, `note`, `updated_at`
  - `user_settings`: `id`(=1 단일 행), `goal_weight`, `height`, `updated_at`

## 데이터 구조 (src/types/index.ts)

- **`MoodKey`**: `'great' | 'good' | 'soso' | 'tired' | 'sad'`
- **`WeightEntry`**: `{ date: string(YYYY-MM-DD), morning: number|null, evening: number|null, mood?: MoodKey|null, note?: string|null }`
- **`UserSettings`**: `{ goalWeight: number, height: number(cm) }`
- **`Prediction`**: `{ daysToGoal: number|null, weeklyLossRate: number }`
- **`DashboardStats`**: 오늘 아침/저녁, 전일 대비 변화, 주간 감량, 남은 kg, streak, BMI, 일중 변동 등

## 페이지 구조 (모두 `'use client'`)

- `/` — 로딩/리다이렉트 페이지
- `/dashboard` — 달력 기반 메인 대시보드 (주간 평균, 예측 카드, 마스코트, 통계)
- `/input` — 오늘의 체중 입력 (아침/저녁 + 기분 태그 + 메모)
- `/past-input` — 과거 데이터 입력
- `/graph` — 체중 추이 그래프 (주간 평균, 3개월/전체 필터)
- `/analysis` — AI 건강 분석 (Claude로 체중 변화 분석·식단 추천·응원)
- `/badges` — 획득한 마일스톤 뱃지 모아보기
- `/settings` — 설정 (목표 체중·키, CSV/엑셀 다운로드 등)

## API 라우트

- `POST /api/analysis` ([src/app/api/analysis/route.ts](src/app/api/analysis/route.ts)) — 최근 30일 데이터(`entries`, `settings`)를 받아 Claude(`claude-haiku-4-5-20251001`, max_tokens 1024) 호출. 응답은 4개 섹션 머릿글로 구분된 분석 텍스트. 데이터 3건 미만이면 400, API 키 없으면 500. 기분 태그를 분석에 반영.

## 주요 컴포넌트 (src/components)

- `Dashboard` — 대시보드 본체
- `MonthlyCalendar` — 달력 기반 체중 표시
- `WeightInputForm` / `PastDataInput` — 체중 입력 폼
- `WeightChart` — Recharts 추이 그래프
- `PredictionCard` — 목표 도달 예측 카드
- `DinosaurMascot` — 마스코트 (유니콘 🦄, 상황별 응원, 친근한 반말 톤)
- `BabyDinoIcon` — streak에 따라 진화하는 마스코트 아이콘
- `BadgeCelebration` — 뱃지 획득 축하 연출

## 유틸 (src/utils, src/constants)

- `storage.ts` — localStorage + Supabase 저장/동기화
- `dashboard.ts` — `calculateDashboardStats()`
- `prediction.ts` — `calculatePrediction()` 목표 도달 예측
- `badges.ts` — 뱃지 정의 + streak 계산. 뱃지: 🌱첫 걸음 / ⭐한 주 챔피언(7일) / 🌟한 달 챔피언(30일) / 💎100일 전설 / 👑1주년(365일) / 🎯목표 달성 / 🍀첫 -1kg / 🌸첫 -5kg / ✨꼼꼼이(7일 연속 아침·저녁 모두)
- `bmi.ts` — `calculateBMI()`, `getBMICategory()`
- `exportCSV.ts` — `exportToCSV()` 다운로드
- `dates.ts` — 날짜 헬퍼
- `constants/mood.ts` — 기분 옵션·이모지·라벨

## 디자인

- 라이트모드 전용 (다크모드 제거됨)
- 핑크 테마 (pink-100 ~ pink-700)
- 카드 스타일: `rounded-xl shadow-md border border-pink-100`
- 레이아웃: `max-w-md` 또는 `max-w-lg` 중앙 정렬
- 마스코트 이모지: 🦄 (유니콘)

## 환경변수

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase URL (클라이언트 노출)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase 익명 키 (클라이언트 노출)
- `ANTHROPIC_API_KEY` — Claude API 키 (**서버 전용**, `NEXT_PUBLIC` 아님)

## 로컬 실행

- `npm run dev` — 개발 서버 (http://localhost:3000, Turbopack)
- `npm run build` / `npm run start` — 프로덕션 빌드/실행
- `npm run lint` — ESLint

## 커밋 & 배포

- 커밋 메시지: 한국어로 작성
- 배포: GitHub `main` push → Vercel 자동 배포 (기본), 수동은 `npx vercel --prod`
- 푸시 후 배포까지 함께 진행하는 것이 기본 워크플로우
