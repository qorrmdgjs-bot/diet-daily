import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CARTIER_PRODUCT } from '@/constants/cartier';
import { detectStock, CARTIER_FETCH_HEADERS } from '@/utils/cartierDetect';
import { sendPush } from '@/utils/cartierNotify';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// 직전 점검이 이 시간(ms) 이내면 재요청 없이 최신 결과를 돌려준다 (수동 연타/남용 방지).
const THROTTLE_MS = 15_000;

interface CheckRow {
  id: number;
  checked_at: string;
  status: string;
  in_stock: boolean;
  http_status: number | null;
  marker: string | null;
}

async function latestCheck(): Promise<CheckRow | null> {
  const { data } = await supabase
    .from('cartier_checks')
    .select('*')
    .order('checked_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as CheckRow) ?? null;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // 테스트 알림: 점검 없이 푸시만 발송 (대시보드 "테스트 알림" 버튼)
  if (params.get('test') === '1') {
    const push = await sendPush({
      title: '까르띠에 재고 알림 테스트',
      message: '알림이 정상 동작합니다. 재고가 생기면 이렇게 알려드릴게요. ✅',
      clickUrl: CARTIER_PRODUCT.url,
      priority: 3,
      tags: ['white_check_mark'],
    });
    await supabase.from('cartier_notifications').insert({
      kind: 'test',
      message: push.sent ? '테스트 알림 발송' : `테스트 실패: ${push.reason}`,
    });
    return NextResponse.json({ ok: push.sent, kind: 'test', reason: push.reason });
  }

  // 재입고 알림 미리보기: 실제 재입고 시 받게 될 푸시를 그대로 발송 (점검 이력은 건드리지 않음)
  if (params.get('simulate') === 'in_stock') {
    const push = await sendPush({
      title: '🛍️ 까르띠에 재고 입고! (미리보기)',
      message: `${CARTIER_PRODUCT.name}\n지금 "쇼핑백에 추가"가 가능합니다. 바로 확인하세요!`,
      clickUrl: CARTIER_PRODUCT.url,
      priority: 5,
      tags: ['shopping_bags', 'rotating_light'],
    });
    await supabase.from('cartier_notifications').insert({
      kind: 'test',
      message: push.sent ? '재입고 알림 미리보기 발송' : `미리보기 실패: ${push.reason}`,
    });
    return NextResponse.json({ ok: push.sent, kind: 'simulate_in_stock', reason: push.reason });
  }

  const prev = await latestCheck();
  const force = params.get('force') === '1';

  // 스로틀: 너무 잦은 호출이면 직전 결과 재사용
  if (!force && prev) {
    const age = Date.now() - new Date(prev.checked_at).getTime();
    if (age < THROTTLE_MS) {
      return NextResponse.json({
        ...toPayload(prev),
        throttled: true,
      });
    }
  }

  // 까르띠에 페이지 fetch + 재고 판정
  // 까르띠에는 데이터센터 IP(Vercel)를 Akamai 봇 차단(403)으로 막으므로,
  // 무료 Jina Reader 프록시(r.jina.ai)를 경유해 원본 HTML을 받아온다.
  const { html, httpStatus, fetchError } = await fetchCartierHtml();
  let detect = { status: 'unknown' as const, inStock: false, marker: 'fetch 실패' } as ReturnType<
    typeof detectStock
  >;
  if (html) {
    detect = detectStock(html);
  } else if (httpStatus && httpStatus !== 200) {
    detect = {
      status: 'unknown',
      inStock: false,
      marker: `HTTP ${httpStatus}${httpStatus === 403 ? ' (봇 차단 의심)' : ''}`,
    };
  } else {
    detect = { status: 'unknown', inStock: false, marker: fetchError ?? 'fetch 오류' };
  }

  // 점검 결과 저장
  const { data: inserted } = await supabase
    .from('cartier_checks')
    .insert({
      status: detect.status,
      in_stock: detect.inStock,
      http_status: httpStatus,
      marker: detect.marker,
    })
    .select('*')
    .single();

  // 알림 판정 (전환 시에만)
  let notified: string | null = null;

  // 1) 품절 → 재고: 재입고 알림 (긴급)
  if (detect.inStock && (!prev || !prev.in_stock)) {
    const push = await sendPush({
      title: '🛍️ 까르띠에 재고 입고!',
      message: `${CARTIER_PRODUCT.name}\n지금 "쇼핑백에 추가"가 가능합니다. 바로 확인하세요!`,
      clickUrl: CARTIER_PRODUCT.url,
      priority: 5,
      tags: ['shopping_bags', 'rotating_light'],
    });
    await supabase.from('cartier_notifications').insert({
      kind: 'restock',
      message: push.sent ? '재입고 알림 발송' : `재입고 알림 실패: ${push.reason}`,
    });
    notified = push.sent ? 'restock' : `restock_failed:${push.reason}`;
  }

  // 2) 알려진 상태 → unknown: 감시가 깨졌을 수 있음을 1회 경고
  else if (detect.status === 'unknown' && prev && prev.status !== 'unknown') {
    const push = await sendPush({
      title: '⚠️ 까르띠에 재고 확인 실패',
      message: `재고 상태를 읽지 못했습니다 (${detect.marker}). 감시 설정 점검이 필요할 수 있어요.`,
      clickUrl: CARTIER_PRODUCT.url,
      priority: 3,
      tags: ['warning'],
    });
    await supabase.from('cartier_notifications').insert({
      kind: 'error',
      message: `unknown 전환: ${detect.marker}`,
    });
    notified = push.sent ? 'unknown_warning' : `warning_failed:${push.reason}`;
  }

  return NextResponse.json({
    ...toPayload((inserted as CheckRow) ?? null),
    previousStatus: prev?.status ?? null,
    notified,
  });
}

function toPayload(row: CheckRow | null) {
  if (!row) return { status: 'unknown', inStock: false, checkedAt: null, marker: null, httpStatus: null };
  return {
    status: row.status,
    inStock: row.in_stock,
    checkedAt: row.checked_at,
    marker: row.marker,
    httpStatus: row.http_status,
  };
}

// 원본 HTML을 가져온다.
// 1차: Jina Reader 프록시(r.jina.ai) — 데이터센터 IP 차단을 우회 (무료, JINA_API_KEY 있으면 사용)
// 2차: 직접 fetch — 가정용 IP(로컬/잔여 환경)에서 동작. Vercel에선 보통 403.
async function fetchCartierHtml(): Promise<{
  html: string | null;
  httpStatus: number | null;
  fetchError: string | null;
}> {
  // 1차: Jina Reader
  try {
    const jinaHeaders: Record<string, string> = {
      'X-Return-Format': 'html',
      'X-No-Cache': 'true', // 항상 최신 상태 (재입고 즉시 감지)
    };
    if (process.env.JINA_API_KEY) {
      jinaHeaders['Authorization'] = `Bearer ${process.env.JINA_API_KEY}`;
    }
    const res = await fetch(`https://r.jina.ai/${CARTIER_PRODUCT.url}`, {
      headers: jinaHeaders,
      cache: 'no-store',
      signal: AbortSignal.timeout(25_000),
    });
    if (res.ok) {
      const html = await res.text();
      if (html && html.length > 2000) return { html, httpStatus: 200, fetchError: null };
    }
  } catch {
    // 2차 시도로 진행
  }

  // 2차: 직접 fetch (가정용 IP에서만 통과)
  try {
    const res = await fetch(CARTIER_PRODUCT.url, {
      headers: CARTIER_FETCH_HEADERS,
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    if (res.ok) return { html: await res.text(), httpStatus: 200, fetchError: null };
    return { html: null, httpStatus: res.status, fetchError: null };
  } catch (e) {
    return { html: null, httpStatus: null, fetchError: e instanceof Error ? `fetch 오류: ${e.message}` : 'fetch 오류' };
  }
}
