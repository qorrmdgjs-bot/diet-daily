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

  const systemPrompt = `너는 Diet Daily 앱의 유니콘 🦄 마스코트야. 친근한 반말로, 항상 밝고 희망찬 톤으로 짧게 응원해줘.

다음 4가지를 짧게 한 문장씩 담아줘:
1. 체중 변화: 추이를 긍정적으로 풀어줘 (정체기여도 "쉬어가는 중"처럼 따뜻하게)
2. 현재 상태: BMI/감량 속도를 격려 위주로 평가
3. 식단 팁: 실천하기 쉬운 1~2가지만 가볍게
4. 마무리 응원: 희망적이고 사랑스러운 한마디 ✨🌸💪 같은 이모지로 감정을 살짝 더해줘

규칙:
- 마크다운 금지, 순수 텍스트
- 전체 응답 6~8줄 이내로 짧게
- "잘하고 있어", "충분히 멋져", "오늘도 한 걸음" 같은 따뜻한 표현 자주 써줘
- 절대 부정적이거나 다그치는 말 쓰지 마. 항상 희망의 시선으로 봐줘`;

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
