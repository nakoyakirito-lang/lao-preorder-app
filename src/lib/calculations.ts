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
 * Calculate Net Profit in Lao Kip for an order
 * Supports both BUY_FOR_YOU (spread + shipping markup) and PREORDER (selling - actual cost)
 */
export function calculateOrderProfitLAK(order: {
  service_type?: 'BUY_FOR_YOU' | 'PREORDER';
  origin_cost?: number;
  exchange_rate?: number;
  real_exchange_rate?: number;
  product_cost_lak?: number;
  selling_price_lak?: number;
  shipping_cost_lak?: number;
  actual_shipping_cost_lak?: number;
  service_fee_lak?: number;
}): number {
  const serviceType = order.service_type || 'BUY_FOR_YOU';
  const shippingCharged = Number(order.shipping_cost_lak) || 0;
  const actualShipping = Number(order.actual_shipping_cost_lak) || 0;
  const serviceFee = Number(order.service_fee_lak) || 0;

  // Shipping profit markup: (e.g. charged 80k - actual 50k = +30k)
  const shippingProfit = actualShipping > 0 ? Math.max(0, shippingCharged - actualShipping) : 0;

  if (serviceType === 'BUY_FOR_YOU') {
    // Exchange rate spread profit (if real cost rate is known)
    let rateSpreadProfit = 0;
    if (order.origin_cost && order.exchange_rate && order.real_exchange_rate) {
      const chargedProduct = order.origin_cost * order.exchange_rate;
      const actualProduct = order.origin_cost * order.real_exchange_rate;
      rateSpreadProfit = Math.max(0, chargedProduct - actualProduct);
    }
    return Math.round(rateSpreadProfit + shippingProfit + serviceFee);
  } else {
    // PREORDER Retail: selling_price - actual_product_cost - actual_shipping
    const selling = Number(order.selling_price_lak) || Number(order.product_cost_lak) || 0;
    const actualProduct = Number(order.product_cost_lak) || 0;
    const grossMargin = selling - actualProduct;
    return Math.round(grossMargin + shippingProfit + serviceFee);
  }
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
