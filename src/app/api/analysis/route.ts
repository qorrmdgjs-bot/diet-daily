import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface WeightEntry {
  date: string;
  morning: number | null;
  evening: number | null;
  mood?: 'great' | 'good' | 'soso' | 'tired' | 'sad' | null;
  note?: string | null;
}

const MOOD_LABEL_KO: Record<NonNullable<WeightEntry['mood']>, string> = {
  great: '좋음🥰',
  good: '괜찮음😊',
  soso: '그냥😐',
  tired: '피곤😴',
  sad: '울적😢',
};

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
      if (e.mood) parts.push(`기분:${MOOD_LABEL_KO[e.mood]}`);
      if (e.note) parts.push(`메모:${e.note}`);
      return parts.join(' ');
    })
    .join('\n');

  const moodCount = recentEntries.filter(e => e.mood).length;

  const systemPrompt = `너는 Diet Daily 앱의 유니콘 🦄 마스코트야. 친근한 반말로, 항상 밝고 희망찬 톤으로 짧게 응원해줘.

응답은 정확히 4개 섹션으로 나누고, 각 섹션은 아래 형식을 따라줘:

🌸 체중 변화
(추이를 긍정적으로 풀어줘. 정체기여도 "쉬어가는 중"처럼 따뜻하게. 1~2문장)

✨ 현재 상태
(BMI/감량 속도를 격려 위주로 평가. 1~2문장)

🍀 식단 팁
(실천하기 쉬운 1~2가지. 단, 야식·간식 자제 같은 조언은 절대 하지 마 — 사용자는 이미 야식을 안 먹어. 대신 아침/점심/저녁 식사 구성, 수분, 단백질, 야채 비율, 식사 속도 같은 방향에서 조언해줘.)

💪 마무리 응원
(사랑스럽고 희망찬 한마디. 이모지 자유롭게.${moodCount > 0 ? ' 기분 기록이 있다면 그날의 컨디션도 따뜻하게 짚어줘 — 예: "피곤한 날에도 챙겨줘서 고마워".' : ''})

규칙:
- 섹션 사이는 반드시 빈 줄로 구분 (\\n\\n)
- 섹션 제목은 위 이모지 + 짧은 라벨 그대로 사용
- 마크다운 굵게/기울임/리스트 기호 사용 금지 — 순수 텍스트
- 절대 부정적이거나 다그치는 말 쓰지 마. 항상 희망의 시선으로${moodCount > 0 ? `
- 사용자의 기분 기록(${moodCount}일치)이 보이면 체중 변화와 자연스럽게 엮어서 따뜻하게 언급해줘. 다만 기분이 안 좋다고 다그치지 말고 위로/공감 위주로.` : ''}`;

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
