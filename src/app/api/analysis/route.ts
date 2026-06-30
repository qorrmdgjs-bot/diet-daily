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

  // 매번 다른 느낌을 주기 위해, 분석을 풀어내는 "표현 스타일"을 무작위로 고른다.
  const STYLES: { name: string; guide: string }[] = [
    {
      name: '데이터 탐정',
      guide:
        '체중 숫자를 단서 삼아 추리하는 따뜻한 명탐정처럼 써줘. "🔍 첫 단서", "🧩 사건의 흐름", "💡 결정적 힌트", "🎩 탐정의 한마디" 같은 추리풍 소제목으로. 패턴을 단서처럼 짚되 결론은 늘 희망적으로.',
    },
    {
      name: '체중 일기예보',
      guide:
        '오늘의 체중을 날씨예보처럼 전해줘. "☀️ 오늘의 체중 날씨", "🌡️ 기압(추세)", "🌤️ 주간 예보", "🧥 준비물(식단 팁)" 같은 예보풍 소제목으로. 맑음/구름/소나기 비유를 쓰되 따뜻하게.',
    },
    {
      name: '라디오 사연',
      guide:
        '심야 라디오 DJ가 청취자(사용자)의 사연을 읽어주듯 써줘. "📻 오늘의 사연", "🎶 신청곡 같은 한마디", "☕ DJ의 조언", "💌 마무리 멘트" 처럼. 다정하고 잔잔한 라디오 감성으로.',
    },
    {
      name: 'RPG 퀘스트',
      guide:
        '다이어트를 모험 게임처럼 풀어줘. "⚔️ 현재 레벨", "📜 진행 중인 퀘스트", "🎁 획득 아이템(식단 팁)", "🗺️ 다음 목적지" 같은 게임풍 소제목으로. 경험치·레벨업 비유로 성취감을 주되 과하지 않게.',
    },
    {
      name: '손편지',
      guide:
        '사용자에게 보내는 짧고 다정한 손편지로 써줘. 소제목 없이 "너에게," 로 시작해(이름을 지어내지 마) 자연스러운 문단들로 흐르게. 데이터 속 노력을 편지에 녹여 따뜻하게 응원하고, 마지막은 "유니콘이 🦄" 같은 서명으로 마무리.',
    },
    {
      name: '운동경기 중계',
      guide:
        '스포츠 캐스터의 생중계처럼 써줘. "🎙️ 경기 현황", "📊 전반전 기록", "🔥 작전 타임(식단 팁)", "🏁 후반전 응원" 같은 중계풍 소제목으로. 박진감 있게, 그러나 따뜻한 해설로.',
    },
    {
      name: '오늘의 운세',
      guide:
        '재미있는 "체중 운세"처럼 써줘. "🔮 오늘의 흐름", "🍀 행운 포인트", "🥗 개운 식단", "✨ 한 줄 운세" 같은 소제목으로. 점치는 느낌은 가볍게, 근거는 실제 데이터에 두고 희망적으로.',
    },
    {
      name: '단짝 친구 카톡',
      guide:
        '제일 친한 친구가 카톡으로 조잘조잘 말 거는 느낌으로 써줘. 소제목 대신 짧은 메시지 여러 개를 줄바꿈으로 나눠서. "헐 너 이거 봐바ㅋㅋ" 같은 생생한 구어체로, 그래도 핵심(추세·BMI·식단)은 다 담아.',
    },
    {
      name: '요리사의 레시피',
      guide:
        '오늘의 컨디션을 한 그릇 요리 레시피처럼 풀어줘. "🍳 오늘의 메뉴", "🧂 재료(현재 상태)", "👩‍🍳 조리법(식단 팁)", "😋 한 입 평" 같은 소제목으로. 따뜻하고 맛깔나게.',
    },
    {
      name: '식물 일지',
      guide:
        '사용자를 정성껏 키우는 화분처럼 빗대 써줘. "🌱 오늘의 새싹", "💧 물주기(수분·식단)", "☀️ 햇빛(현재 상태)", "🌷 자라는 중" 같은 소제목으로. 천천히 자라는 과정을 다정하게 응원.',
    },
  ];
  const style = STYLES[Math.floor(Math.random() * STYLES.length)];

  const systemPrompt = `너는 Diet Daily 앱의 유니콘 🦄 마스코트야. 친근한 반말로, 항상 밝고 희망찬 톤으로 짧게 응원해줘.

오늘은 이런 "표현 스타일"로 분석을 풀어줘 — [${style.name}]
${style.guide}

이 스타일에 맞춰 자유롭게 구성하되, 아래 내용은 자연스럽게 모두 녹여줘:
- 최근 체중 추이 (정체기여도 "쉬어가는 중"처럼 따뜻하게)
- 현재 상태 (BMI·감량 속도를 격려 위주로)
- 실천하기 쉬운 식단 팁 1~2가지 — 단, 야식·간식 자제 같은 조언은 절대 하지 마(사용자는 이미 야식을 안 먹어). 대신 식사 구성·수분·단백질·야채 비율·식사 속도 같은 방향으로.
- 희망찬 마무리 한마디${moodCount > 0 ? `
- 기분 기록(${moodCount}일치)이 보이면 체중 변화와 자연스럽게 엮어 위로·공감 위주로 따뜻하게 언급 (기분 나쁘다고 다그치지 마)` : ''}

규칙:
- 반드시 위 [${style.name}] 스타일의 말투와 구성으로 써. 매번 다른 스타일이 오니, 틀에 박힌 똑같은 인사·문장·구성을 반복하지 마.
- 100% 한국어. 한자·일본어·영어 섞지 마(꼭 필요한 약어만 괄호 병기).
- 마크다운 굵게/기울임/리스트 기호(*, -, #) 사용 금지 — 순수 텍스트와 이모지만.
- 절대 부정적이거나 다그치지 마. 늘 희망의 시선으로.
- 너무 길지 않게, 핵심만 담아 읽기 좋게.`;

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
      temperature: 1, // 매번 더 다채롭게
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
