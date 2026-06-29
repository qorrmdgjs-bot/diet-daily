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
  let httpStatus: number | null = null;
  let detect = { status: 'unknown' as const, inStock: false, marker: 'fetch 실패' } as ReturnType<
    typeof detectStock
  >;
  try {
    const res = await fetch(CARTIER_PRODUCT.url, {
      headers: CARTIER_FETCH_HEADERS,
      redirect: 'follow',
      cache: 'no-store',
    });
    httpStatus = res.status;
    if (res.ok) {
      detect = detectStock(await res.text());
    } else {
      detect = {
        status: 'unknown',
        inStock: false,
        marker: `HTTP ${res.status}${res.status === 403 ? ' (봇 차단 의심)' : ''}`,
      };
    }
  } catch (e) {
    detect = {
      status: 'unknown',
      inStock: false,
      marker: e instanceof Error ? `fetch 오류: ${e.message}` : 'fetch 오류',
    };
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
