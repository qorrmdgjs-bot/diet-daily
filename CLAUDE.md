@AGENTS.md

# Diet Daily

체중 관리 웹앱. 매일 체중을 기록하고 추이를 확인할 수 있다.

## 기술 스택

- **프레임워크**: Next.js 16.2.3 (App Router, Turbopack)
- **언어**: TypeScript
- **UI**: React 19, Tailwind CSS, 감자꽃(Gamja Flower) 손글씨체
- **차트**: Recharts
- **AI**: Claude API (@anthropic-ai/sdk) - 건강 분석 기능
- **백엔드/DB**: Supabase
- **배포**: Vercel (https://diet-daily.vercel.app)
- **저장소**: https://github.com/qorrmdgjs-bot/diet-daily

## 페이지 구조

- `/` - 로딩/리다이렉트 페이지
- `/dashboard` - 달력 기반 대시보드 (주간평균 포함), 메인 네비게이션
- `/input` - 오늘의 체중 입력 (아침/저녁)
- `/past-input` - 과거 데이터 입력
- `/graph` - 체중 추이 그래프 (주간 평균, 3개월/전체 필터)
- `/analysis` - AI 건강 분석 (Claude API로 체중 변화 분석, 식단 추천, 응원)
- `/settings` - 설정 (엑셀 다운로드 등)

## API 라우트

- `POST /api/analysis` - Claude API를 호출하여 체중 데이터 분석. 최근 30일 데이터를 전송하고, 체중 추이/식단 추천/응원 메시지를 반환

## 데이터 구조

- **저장 방식**: localStorage 기본 + Supabase 동기화 (서버 우선 병합)
- **WeightEntry**: `{ date: string, morning: number|null, evening: number|null }`
- **UserSettings**: `{ goalWeight: number, height: number }`
- Supabase 테이블: `weight_entries`, `user_settings`

## 주요 컴포넌트

- `DinosaurMascot` - 마스코트 컴포넌트 (유니콘 🦄 이모지, 상황별 응원 메시지, 친근한 반말 톤)
- `MonthlyCalendar` - 달력 기반 체중 표시

## 디자인

- 라이트모드 전용 (다크모드 제거됨)
- 핑크 테마 (pink-100 ~ pink-700)
- 카드 스타일: `rounded-xl shadow-md border border-pink-100`
- 레이아웃: `max-w-md` 또는 `max-w-lg` 중앙 정렬
- 마스코트 이모지: 🦄 (유니콘)
- 모든 페이지 `'use client'` 컴포넌트

## 환경변수

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 익명 키
- `ANTHROPIC_API_KEY` - Claude API 키 (서버 전용, NEXT_PUBLIC 아님)

## 커밋 & 배포

- 커밋 메시지: 한국어로 작성
- 배포: `npx vercel --prod`
- 푸시 후 배포까지 함께 진행하는 것이 기본 워크플로우
