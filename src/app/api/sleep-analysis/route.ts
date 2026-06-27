import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface SleepEntry {
  date: string;
  hours: number | null;
  note?: string | null;
}

interface SleepSettings {
  goalHours: number;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  let entries: SleepEntry[];
  let settings: SleepSettings;

  try {
    const body = await request.json();
    entries = body.entries;
    settings = body.settings;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!entries || entries.length < 3) {
    return NextResponse.json({ error: 'Not enough data' }, { status: 400 });
  }

  // 최근 30일 데이터만 사용 (토큰 절약)
  const recentEntries = entries.slice(-30);

  const hoursList = recentEntries
    .map(e => e.hours)
    .filter((v): v is number => v != null);
  const avgHours = hoursList.length > 0
    ? (hoursList.reduce((a, b) => a + b, 0) / hoursList.length).toFixed(1)
    : null;

  const dataText = recentEntries
    .map(e => {
      const parts = [e.date];
      if (e.hours != null) parts.push(`수면:${e.hours}시간`);
      if (e.note) parts.push(`메모:${e.note}`);
      return parts.join(' ');
    })
    .join('\n');

  const systemPrompt = `너는 Well-Sleep 앱의 달님 🌙 마스코트야. 친근한 반말로, 항상 밝고 포근한 톤으로 짧게 응원해줘.

응답은 정확히 4개 섹션으로 나누고, 각 섹션은 아래 형식을 따라줘:

🌙 수면 패턴
(수면시간 추이를 따뜻하게 풀어줘. 들쭉날쭉해도 "그럴 수 있어"처럼 포근하게. 1~2문장)

✨ 현재 상태
(평균 수면시간이 목표 대비 어떤지 격려 위주로 평가. 1~2문장)

💤 꿀잠 팁
(실천하기 쉬운 1~2가지. 취침/기상 시간 규칙성, 자기 전 습관, 빛/카페인/낮잠 같은 방향에서 부드럽게 조언해줘.)

💪 마무리 응원
(포근하고 희망찬 한마디. 이모지 자유롭게.)

규칙:
- 섹션 사이는 반드시 빈 줄로 구분 (\\n\\n)
- 섹션 제목은 위 이모지 + 짧은 라벨 그대로 사용
- 마크다운 굵게/기울임/리스트 기호 사용 금지 — 순수 텍스트
- 절대 부정적이거나 다그치는 말 쓰지 마. 항상 포근한 시선으로`;

  const userMessage = `사용자 정보:
- 목표 수면시간: ${settings.goalHours}시간
- 최근 평균 수면시간: ${avgHours ?? '알 수 없음'}시간
- 총 기록 일수: ${entries.length}일

최근 수면 기록:
${dataText}`;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    return NextResponse.json({ analysis: text });
  } catch {
    return NextResponse.json({ error: 'AI 분석에 실패했어요. 잠시 후 다시 시도해주세요.' }, { status: 502 });
  }
}
