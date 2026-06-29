'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CARTIER_PRODUCT, STATUS_LABEL, type StockStatus } from '@/constants/cartier';
import {
  loadCartierChecks,
  loadCartierNotifications,
  type CartierCheck,
  type CartierNotification,
} from '@/utils/cartierStorage';

const STATUS_STYLE: Record<StockStatus, { dot: string; box: string; text: string; emoji: string }> = {
  in_stock: { dot: 'bg-emerald-500', box: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', emoji: '🟢' },
  out_of_stock: { dot: 'bg-rose-500', box: 'bg-rose-50 border-rose-200', text: 'text-rose-700', emoji: '🔴' },
  unknown: { dot: 'bg-amber-400', box: 'bg-amber-50 border-amber-200', text: 'text-amber-700', emoji: '🟡' },
};

function fmt(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function CartierPage() {
  const [checks, setChecks] = useState<CartierCheck[]>([]);
  const [notis, setNotis] = useState<CartierNotification[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [c, n] = await Promise.all([loadCartierChecks(30), loadCartierNotifications(10)]);
    setChecks(c);
    setNotis(n);
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30_000); // 30초마다 자동 새로고침
    return () => clearInterval(t);
  }, [refresh]);

  const latest = checks[0] ?? null;
  const status: StockStatus = latest?.status ?? 'unknown';
  const style = STATUS_STYLE[status];

  const runCheck = async () => {
    setBusy(true);
    setToast(null);
    try {
      const res = await fetch('/api/cartier-check?force=1', { cache: 'no-store' });
      const data = await res.json();
      await refresh();
      setToast(
        data.status === 'in_stock'
          ? '재고가 있습니다! 🛍️'
          : data.status === 'out_of_stock'
          ? '아직 품절입니다.'
          : `상태 확인 실패 (${data.marker ?? '-'})`
      );
    } catch {
      setToast('점검 요청에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    setBusy(true);
    setToast(null);
    try {
      const res = await fetch('/api/cartier-check?test=1', { cache: 'no-store' });
      const data = await res.json();
      await refresh();
      setToast(data.ok ? '테스트 알림을 보냈어요. 휴대폰을 확인하세요. 📲' : `알림 실패: ${data.reason ?? '-'}`);
    } catch {
      setToast('테스트 알림 요청에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-4 px-2 sm:py-6 sm:px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-block mb-3 text-red-400 hover:text-red-600 text-sm px-2">
          ← 앱 선택
        </Link>

        <div className="flex items-center gap-2 mb-4 px-2">
          <span className="text-2xl">💎</span>
          <h1 className="text-xl font-bold text-red-900">까르띠에 재고 알림</h1>
        </div>

        {/* 상태 카드 */}
        <div className={`rounded-2xl p-5 shadow-md border ${style.box} mb-4`}>
          <div className="flex items-center gap-3">
            <span className={`inline-block w-3 h-3 rounded-full ${style.dot} animate-pulse`} />
            <span className={`text-2xl font-bold ${style.text}`}>
              {style.emoji} {STATUS_LABEL[status]}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            마지막 점검: {fmt(latest?.checkedAt ?? null)}
            {latest?.marker ? ` · ${latest.marker}` : ''}
          </p>
        </div>

        {/* 상품 정보 */}
        <a
          href={CARTIER_PRODUCT.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-4 items-center rounded-2xl p-4 shadow-md border border-red-100 mb-4 hover:bg-red-50"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CARTIER_PRODUCT.image}
            alt={CARTIER_PRODUCT.name}
            className="w-20 h-20 object-cover rounded-lg bg-gray-50 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-snug">{CARTIER_PRODUCT.name}</p>
            <p className="text-base font-bold text-red-900 mt-1">{CARTIER_PRODUCT.price}</p>
            <p className="text-xs text-red-400 mt-1">상품 페이지 열기 →</p>
          </div>
        </a>

        {/* 액션 버튼 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={runCheck}
            disabled={busy}
            className="px-4 py-3 bg-red-700 text-white rounded-xl hover:bg-red-800 font-medium text-sm disabled:opacity-50"
          >
            {busy ? '확인 중…' : '지금 확인'}
          </button>
          <button
            onClick={sendTest}
            disabled={busy}
            className="px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 font-medium text-sm disabled:opacity-50"
          >
            테스트 알림
          </button>
        </div>

        {toast && <p className="text-center text-sm text-red-600 mb-4">{toast}</p>}

        {/* 알림 이력 */}
        {notis.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-500 mb-2 px-1">알림 이력</h2>
            <ul className="space-y-1">
              {notis.map((n) => (
                <li key={n.id} className="text-xs text-gray-600 flex justify-between gap-2 px-1">
                  <span>
                    {n.kind === 'restock' ? '🛍️' : n.kind === 'test' ? '📲' : '⚠️'} {n.message}
                  </span>
                  <span className="text-gray-300 shrink-0">{fmt(n.sentAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 점검 이력 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2 px-1">점검 이력 (최근 30회)</h2>
          {checks.length === 0 ? (
            <p className="text-xs text-gray-400 px-1">아직 점검 기록이 없어요. &quot;지금 확인&quot;을 눌러보세요.</p>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
              {checks.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                  <span className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${STATUS_STYLE[c.status].dot}`} />
                    <span className={STATUS_STYLE[c.status].text}>{STATUS_LABEL[c.status]}</span>
                  </span>
                  <span className="text-gray-400">{fmt(c.checkedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-[11px] text-gray-300 mt-6 px-1 leading-relaxed">
          3분마다 자동으로 재고를 확인하며, 품절에서 구매 가능으로 바뀌는 순간 휴대폰으로 푸시 알림을 보냅니다.
          알림을 받으려면 휴대폰에 ntfy 앱을 설치하고 설정된 토픽을 구독하세요.
        </p>
      </div>
    </div>
  );
}
