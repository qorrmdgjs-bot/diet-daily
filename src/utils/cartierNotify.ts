// 휴대폰 푸시 알림 (ntfy). 서버 전용.
//
// ntfy 는 헤더 방식 대신 JSON 발행을 쓰면 제목/본문에 한글(UTF-8)을 안전하게 보낼 수 있다.
// 사용법: 휴대폰에 ntfy 앱 설치 → NTFY_TOPIC 과 같은 토픽을 구독.
// Pushover 등으로 바꾸려면 이 파일의 sendPush 한 곳만 교체하면 된다.

interface PushInput {
  title: string;
  message: string;
  clickUrl?: string;
  priority?: 1 | 2 | 3 | 4 | 5; // 5 = 긴급
  tags?: string[];
}

export interface PushResult {
  sent: boolean;
  reason?: string;
}

export async function sendPush(input: PushInput): Promise<PushResult> {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return { sent: false, reason: 'NTFY_TOPIC 미설정' };

  const server = process.env.NTFY_SERVER || 'https://ntfy.sh';

  try {
    const res = await fetch(server, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        title: input.title,
        message: input.message,
        priority: input.priority ?? 3,
        tags: input.tags ?? [],
        click: input.clickUrl,
      }),
    });
    if (!res.ok) {
      return { sent: false, reason: `ntfy ${res.status}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : 'fetch 실패' };
  }
}
