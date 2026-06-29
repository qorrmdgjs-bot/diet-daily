// 까르띠에 상품 페이지 HTML에서 재고 상태를 판정한다 (서버 전용).
//
// 핵심 신호 (실제 페이지 DOM 분석 결과):
//  - 구매 가능: data-product-component="add-button" (쇼핑백에 추가하기) 버튼이 보임(hidden 없음)
//  - 품절:     data-product-component="availability-status" (상담원 연결, contact-customer-care)
//              앵커가 보이고, add-button 에는 hidden 클래스가 붙음
//  - 둘 다 식별 불가: unknown (셀렉터 변경 / 봇 차단 의심)

import type { StockStatus } from '@/constants/cartier';

export interface DetectResult {
  status: StockStatus;
  inStock: boolean;
  marker: string;
}

// Vercel 서버리스(데이터센터 IP)에서도 봇 차단을 통과하기 위한 완전한 Chrome 헤더.
export const CARTIER_FETCH_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
  'sec-ch-ua': '"Chromium";v="126", "Google Chrome";v="126", "Not/A)Brand";v="8"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1',
};

function matchTag(html: string, attr: string): string | null {
  const i = html.indexOf(attr);
  if (i < 0) return null;
  const start = html.lastIndexOf('<', i);
  const end = html.indexOf('>', i);
  if (start < 0 || end < 0) return null;
  return html.slice(start, end + 1);
}

function getClass(tag: string): string {
  const m = tag.match(/class="([^"]*)"/);
  return m ? m[1] : '';
}

export function detectStock(html: string): DetectResult {
  if (!html || html.length < 2000) {
    return { status: 'unknown', inStock: false, marker: 'empty/short body' };
  }
  if (/Access Denied|Pardon Our Interruption|<title>\s*Access/i.test(html)) {
    return { status: 'unknown', inStock: false, marker: 'blocked (Access Denied)' };
  }

  // 1차 신호: 실제 구매 버튼(add-button)의 표시 여부
  const addTag = matchTag(html, 'data-product-component="add-button"');
  if (addTag && !/\bhidden\b/.test(getClass(addTag))) {
    return { status: 'in_stock', inStock: true, marker: 'add-button visible (쇼핑백에 추가)' };
  }

  // 2차 신호: 품절 전용 CTA(상담원 연결)가 활성인지
  const availTag = matchTag(html, 'data-product-component="availability-status"');
  if (availTag && !/\bhidden\b/.test(getClass(availTag)) && /contact-customer-care/.test(availTag)) {
    return { status: 'out_of_stock', inStock: false, marker: '상담원 연결 CTA visible' };
  }
  if (addTag && /\bhidden\b/.test(getClass(addTag))) {
    return { status: 'out_of_stock', inStock: false, marker: 'add-button hidden' };
  }

  return { status: 'unknown', inStock: false, marker: 'no known CTA found' };
}
