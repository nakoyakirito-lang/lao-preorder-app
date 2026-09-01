import { OriginCurrency } from '@/types/database';

/**
 * Format number to Lao Kip currency string (e.g. 1,500,000 ກີບ)
 */
export function formatLAK(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '0 ກີບ';
  }
  const num = Math.round(Number(amount));
  return `${num.toLocaleString('lo-LA')} ກີບ`;
}

/**
 * Format origin foreign currency
 */
export function formatForeignCurrency(amount: number, currency: OriginCurrency): string {
  const num = Number(amount) || 0;
  if (currency === 'CNY') {
    return `¥${num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `฿${num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Calculate Product Cost in Lao Kip from foreign price and rate
 */
export function calculateProductCostLAK(originCost: number, exchangeRate: number): number {
  return Math.round((Number(originCost) || 0) * (Number(exchangeRate) || 0));
}

/**
 * Calculate Final Total Cost in Lao Kip
 */
export function calculateTotalCostLAK(
  productCostLAK: number,
  shippingCostLAK: number,
  serviceFeeLAK: number = 0
): number {
  return (
    Math.round(Number(productCostLAK) || 0) +
    Math.round(Number(shippingCostLAK) || 0) +
    Math.round(Number(serviceFeeLAK) || 0)
  );
}

/**
 * Calculate Balance Due / COD in Lao Kip
 */
export function calculateBalanceDueLAK(totalCostLAK: number, depositLAK: number): number {
  const balance = Math.round(Number(totalCostLAK) || 0) - Math.round(Number(depositLAK) || 0);
  return Math.max(0, balance);
}

/**
 * Generate a unique tracking code with prefix, date, and sequence
 * e.g. LA-CN-260902-123
 */
export function generateTrackingCode(route: 'CHINA_LAOS' | 'THAI_LAOS'): string {
  const prefix = route === 'CHINA_LAOS' ? 'LA-CN' : 'LA-TH';
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 digits
  return `${prefix}-${yy}${mm}${dd}-${randomSuffix}`;
}
