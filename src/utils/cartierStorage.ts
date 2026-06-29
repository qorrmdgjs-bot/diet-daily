// 까르띠에 재고 점검/알림 이력 조회 (클라이언트, anon 키).
import { supabase } from '@/lib/supabase';
import type { StockStatus } from '@/constants/cartier';

export interface CartierCheck {
  id: number;
  checkedAt: string;
  status: StockStatus;
  inStock: boolean;
  httpStatus: number | null;
  marker: string | null;
}

export interface CartierNotification {
  id: number;
  sentAt: string;
  kind: string;
  message: string | null;
}

export async function loadCartierChecks(limit = 30): Promise<CartierCheck[]> {
  const { data, error } = await supabase
    .from('cartier_checks')
    .select('*')
    .order('checked_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as number,
    checkedAt: r.checked_at as string,
    status: r.status as StockStatus,
    inStock: Boolean(r.in_stock),
    httpStatus: (r.http_status as number | null) ?? null,
    marker: (r.marker as string | null) ?? null,
  }));
}

export async function loadCartierNotifications(limit = 10): Promise<CartierNotification[]> {
  const { data, error } = await supabase
    .from('cartier_notifications')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as number,
    sentAt: r.sent_at as string,
    kind: r.kind as string,
    message: (r.message as string | null) ?? null,
  }));
}
