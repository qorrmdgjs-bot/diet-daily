import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface WeightEntry {
  date: string;
  morning: number | null;
  evening: number | null;
}

interface UserSettings {
  goalWeight: number;
  height: number;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  let entries: WeightEntry[];
  let settings: UserSettings;

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

  const currentWeight = (() => {
    const last = recentEntries[recentEntries.length - 1];
    return last.evening ?? last.morning;
  })();

  const bmi = currentWeight
    ? (currentWeight / ((settings.height / 100) ** 2)).toFixed(1)
    : null;

  const dataText = recentEntries
    .map(e => {
      const parts = [e.date];
      if (e.morning != null) parts.push(`아침:${e.morning}kg`);
      if (e.evening != null) parts.push(`저녁:${e.evening}kg`);
      return parts.join(' ');
    })
    .join('\n');

  const systemPrompt = `너는 Diet Daily 앱의 AI 건강 분석가야. 유니콘 🦄 마스코트처럼 친근한 반말로 대화해.

분석 시 다음 내용을 포함해줘:
1. **체중 변화 분석**: 전체적인 추이 (감소/증가/정체), 주간 변화량
2. **현재 상태 평가**: BMI 기반 평가, 감량 속도가 건강한 범위인지 (주 0.5~1kg 권장)
3. **식단 추천**: 현재 체중과 목표에 맞는 구체적인 식단 조언 2-3가지
4. **응원 메시지**: 잘하고 있으면 구체적으로 칭찬, 정체기면 격려

응답은 마크다운 형식 없이 순수 텍스트로 작성해. 섹션 구분은 줄바꿈으로 해줘.
너무 길지 않게 핵심만 전달해줘.`;

  const userMessage = `사용자 정보:
- 키: ${settings.height}cm
- 목표 체중: ${settings.goalWeight}kg
- 현재 체중: ${currentWeight ?? '알 수 없음'}kg
- BMI: ${bmi ?? '알 수 없음'}
- 총 기록 일수: ${entries.length}일

최근 체중 기록:
${dataText}`;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
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
