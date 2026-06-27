@AGENTS.md

# Diet Daily + Well-Sleep

하나의 코드베이스에 **두 개의 트래킹 앱**이 들어 있다. 첫 화면(`/`)에서 둘 중 하나를 고른다.
- **Diet Daily** (🦄 핑크): 매일 아침·저녁 체중을 기록하고 추이·예측·AI 분석으로 다이어트를 응원.
- **Well-Sleep** (🌙 인디고): 매일 총 수면시간을 기록하고 달력 주간 평균·그래프·AI 분석으로 수면을 관리.

두 앱은 동일한 패턴(localStorage + Supabase 동기화, 주간 평균 달력, Claude 분석)을 공유하되 데이터·라우트·테이블이 완전히 분리되어 있다.

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
 ├─ localStorage  'diet-daily-data' / 'well-sleep-data'   ← 1차 저장, 오프라인 캐시
 ├─ Supabase JS (anon key, 직접 호출)                      ← 영구 DB
 │     · 체중: weight_entries, user_settings
 │     · 수면: sleep_entries, sleep_settings
 └─ POST /api/analysis, /api/sleep-analysis (Next.js 서버) ← 서버 코드, Claude API 호출
                                                             (ANTHROPIC_API_KEY는 서버에만)
```

- **데이터 저장 위치**: 영구 저장소는 **Supabase**, 브라우저 localStorage는 즉시 반영·오프라인용 캐시. 두 앱은 localStorage 키·Supabase 테이블이 분리됨.
- **백엔드 동작 위치**: (1) Supabase에 클라이언트가 직접 붙어 DB CRUD, (2) AI 분석만 Next.js API 라우트(로컬은 localhost, 배포 시 Vercel 서버리스 함수)에서 실행.
- **배포 위치**: Vercel 프로젝트 `diet-daily`. `npx vercel --prod` 수동 배포가 기본(GitHub 자동 배포는 미연동). 운영 Supabase 프로젝트 `ogkbnglqehpqxrzsqrev`.

## 데이터 저장 & 동기화

저장 로직은 [src/utils/storage.ts](src/utils/storage.ts), Supabase 클라이언트는 [src/lib/supabase.ts](src/lib/supabase.ts).

- **저장(쓰기)**: `addWeightEntry` / `updateSettings`가 먼저 localStorage에 저장한 뒤, `weight_entries`(날짜 `onConflict` upsert) · `user_settings`(`id=1` update)로 동기화. 네트워크 오류 시 조용히 실패하고 로컬만 유지.
- **불러오기(읽기)**: `loadWeightData()`는 localStorage에서 즉시 로드. `syncFromSupabase()`는 **서버 우선 병합** — 서버 데이터를 기준으로, 로컬에만 있는 날짜는 서버에 올리고 병합 결과를 localStorage에 다시 저장.
- **Supabase 테이블** (모두 RLS on, anon 전체 접근 정책):
  - `weight_entries`: `date`(PK·고유), `morning`, `evening`, `mood`, `note`, `updated_at`
  - `user_settings`: `id`(=1 단일 행), `goal_weight`, `height`, `updated_at`
  - `sleep_entries`: `date`(PK·고유), `hours`, `note`, `updated_at`
  - `sleep_settings`: `id`(=1 단일 행), `goal_hours`, `updated_at`
- **수면 저장 로직**은 [src/utils/sleepStorage.ts](src/utils/sleepStorage.ts)에 위 패턴을 그대로 복제(`loadSleepData / addSleepEntry / updateSleepSettings / syncFromSupabase`, localStorage 키 `'well-sleep-data'`).

## 데이터 구조 (src/types/index.ts)

- **`MoodKey`**: `'great' | 'good' | 'soso' | 'tired' | 'sad'`
- **`WeightEntry`**: `{ date: string(YYYY-MM-DD), morning: number|null, evening: number|null, mood?: MoodKey|null, note?: string|null }`
- **`UserSettings`**: `{ goalWeight: number, height: number(cm) }`
- **`Prediction`**: `{ daysToGoal: number|null, weeklyLossRate: number }`
- **`DashboardStats`**: 오늘 아침/저녁, 전일 대비 변화, 주간 감량, 남은 kg, streak, BMI, 일중 변동 등
- **`SleepEntry`**: `{ date: string(YYYY-MM-DD), hours: number|null, note?: string|null }`
- **`SleepSettings`**: `{ goalHours: number }` (기본 8) · **`SleepData`**: `{ entries, settings }`

## 페이지 구조 (모두 `'use client'`)

- `/` — **앱 선택 화면** (🦄 Diet Daily → `/dashboard`, 🌙 Well-Sleep → `/sleep`)

**Diet Daily**
- `/dashboard` — 달력 기반 메인 대시보드 (주간 평균, 예측 카드, 마스코트, 통계). 상단에 `/`(앱 선택) 링크.
- `/input` — 오늘의 체중 입력 (아침/저녁 + 기분 태그 + 메모)
- `/past-input` — 과거 데이터 입력
- `/graph` — 체중 추이 그래프 (주간 평균, 3개월/전체 필터)
- `/analysis` — AI 건강 분석 (Claude로 체중 변화 분석·식단 추천·응원)
- `/badges` — 획득한 마일스톤 뱃지 모아보기
- `/settings` — 설정 (목표 체중·키, CSV/엑셀 다운로드 등)

**Well-Sleep** (다이어트와 동일 구조의 평행 라우트)
- `/sleep` — 수면 달력 대시보드 (셀에 `Xh`, 맨 오른쪽 "평균" 열에 주간 평균). 상단에 `/`(앱 선택) 링크.
- `/sleep/input` — 수면시간 입력 (날짜 + 총 수면시간 + 목표 수면시간; 날짜 필드로 과거 입력 겸용)
- `/sleep/graph` — 수면시간 추이 그래프 (목표 수면시간 기준선 포함)
- `/sleep/analysis` — AI 수면 분석 (Claude로 수면 패턴 분석·꿀잠 팁·응원)

## API 라우트

- `POST /api/analysis` ([src/app/api/analysis/route.ts](src/app/api/analysis/route.ts)) — 최근 30일 체중 데이터(`entries`, `settings`)를 받아 Claude(`claude-haiku-4-5-20251001`, max_tokens 1024) 호출. 4개 섹션 머릿글로 구분된 분석 텍스트. 데이터 3건 미만 400, API 키 없으면 500. 기분 태그 반영.
- `POST /api/sleep-analysis` ([src/app/api/sleep-analysis/route.ts](src/app/api/sleep-analysis/route.ts)) — 최근 30일 수면 데이터를 받아 같은 모델 호출. 🌙 수면 마스코트 톤, 4섹션(수면 패턴/현재 상태/꿀잠 팁/마무리 응원). 데이터 3건 미만 400.

## 주요 컴포넌트 (src/components)

- `Dashboard` — 대시보드 본체
- `MonthlyCalendar` — 달력 기반 체중 표시
- `WeightInputForm` / `PastDataInput` — 체중 입력 폼
- `WeightChart` — Recharts 추이 그래프
- `PredictionCard` — 목표 도달 예측 카드
- `DinosaurMascot` — 마스코트 (유니콘 🦄, 상황별 응원, 친근한 반말 톤)
- `BabyDinoIcon` — streak에 따라 진화하는 마스코트 아이콘
- `BadgeCelebration` — 뱃지 획득 축하 연출
- `MonthlySleepCalendar` — 수면용 달력 (단일 값 `Xh` + 주간 평균, 인디고 테마)
- `SleepChart` — 수면시간 추이 그래프 (목표 기준선)

## 유틸 (src/utils, src/constants)

- `storage.ts` — 체중 localStorage + Supabase 저장/동기화
- `sleepStorage.ts` — 수면 localStorage + Supabase 저장/동기화 (storage.ts와 동일 패턴)
- `dashboard.ts` — `calculateDashboardStats()`
- `prediction.ts` — `calculatePrediction()` 목표 도달 예측
- `badges.ts` — 뱃지 정의 + streak 계산. 뱃지: 🌱첫 걸음 / ⭐한 주 챔피언(7일) / 🌟한 달 챔피언(30일) / 💎100일 전설 / 👑1주년(365일) / 🎯목표 달성 / 🍀첫 -1kg / 🌸첫 -5kg / ✨꼼꼼이(7일 연속 아침·저녁 모두)
- `bmi.ts` — `calculateBMI()`, `getBMICategory()`
- `exportCSV.ts` — `exportToCSV()` 다운로드
- `dates.ts` — 날짜 헬퍼
- `constants/mood.ts` — 기분 옵션·이모지·라벨

## 디자인

- 라이트모드 전용 (다크모드 제거됨)
- **Diet Daily**: 핑크 테마 (pink-100 ~ pink-700), 마스코트 🦄
- **Well-Sleep**: 인디고 테마 (indigo-100 ~ indigo-700), 마스코트 🌙
- 카드 스타일: `rounded-xl shadow-md border border-{pink|indigo}-100`
- 레이아웃: `max-w-md` 또는 `max-w-lg` 중앙 정렬

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
- 배포: **`npx vercel --prod` 수동 배포** (GitHub 자동 배포 미연동 — 토큰 만료 시 `npx vercel login` 먼저)
- 푸시 후 배포까지 함께 진행하는 것이 기본 워크플로우
- Supabase 스키마 변경은 코드 배포와 별개로 운영 DB에 먼저 적용해야 함
