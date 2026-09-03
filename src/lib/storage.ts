import { Order, ExchangeRate, ShopSettings } from '@/types/database';
import { supabase, isSupabaseConfigured } from './supabase';

const ORDERS_STORAGE_KEY = 'lao_preorder_orders_v1';
const RATES_STORAGE_KEY = 'lao_preorder_rates_v1';
const SETTINGS_STORAGE_KEY = 'lao_preorder_settings_v1';

export const DEFAULT_EXCHANGE_RATES: ExchangeRate[] = [
  { currency: 'CNY', rate_to_lak: 3200, updated_at: new Date().toISOString() },
  { currency: 'THB', rate_to_lak: 640, updated_at: new Date().toISOString() },
];

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  id: 1,
  shop_name: 'LAO PREORDER EXPRESS (ຈີນ-ລາວ / ໄທ-ລາວ)',
  phone: '020 5555 8888',
  address: 'ບ້ານ ດົງໂດກ, ເມືອງ ໄຊທານີ, ນະຄອນຫຼວງວຽງຈັນ',
  slip_header: 'ໃບບິນຮັບຝາກ ແລະ ຈັດສົ່ງພັດສະດຸ',
  slip_footer: 'ຂອບໃຈທີ່ໃຊ້ບໍລິການ! ກະລຸນາກວດສອບສິນຄ້າກ່ອນເຊັນຮັບ',
  updated_at: new Date().toISOString(),
};

export const SEED_ORDERS: Order[] = [];

// Data service helpers
export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Order[];
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage', e);
    }
  }

  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function clearAllOrders(): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (e) {
      console.error('Supabase clear failed:', e);
    }
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([]));
  }
  return true;
}

export async function getOrderByTrackingCode(code: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((o) => o.tracking_code.toLowerCase() === code.toLowerCase()) || null;
}

export async function saveOrder(order: Order): Promise<boolean> {
  const normalizedOrder: Order = {
    ...order,
    service_type: order.service_type || 'BUY_FOR_YOU',
    delivery_province: order.delivery_province || '',
    selling_price_lak: order.selling_price_lak ?? 0,
    actual_shipping_cost_lak: order.actual_shipping_cost_lak ?? 0,
    profit_lak: order.profit_lak ?? 0,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('orders').upsert(normalizedOrder);
      if (error) console.error('Supabase upsert error:', error);
    } catch (e) {
      console.warn('Supabase save failed, saving locally:', e);
    }
  }

  if (typeof window !== 'undefined') {
    const orders = await getOrders();
    const index = orders.findIndex((o) => o.id === order.id || o.tracking_code === order.tracking_code);
    if (index >= 0) {
      orders[index] = normalizedOrder;
    } else {
      orders.unshift({ ...normalizedOrder, created_at: order.created_at || new Date().toISOString() });
    }
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }
  return true;
}

export async function deleteOrder(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('orders').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete failed:', e);
    }
  }
  if (typeof window !== 'undefined') {
    const orders = (await getOrders()).filter((o) => o.id !== id);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }
  return true;
}

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('exchange_rates').select('*');
      if (!error && data && data.length > 0) return data as ExchangeRate[];
    } catch (e) {
      console.warn('Supabase fetch rates failed:', e);
    }
  }
  if (typeof window === 'undefined') return DEFAULT_EXCHANGE_RATES;
  const raw = localStorage.getItem(RATES_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(DEFAULT_EXCHANGE_RATES));
    return DEFAULT_EXCHANGE_RATES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_EXCHANGE_RATES;
  }
}

export async function saveExchangeRates(rates: ExchangeRate[]): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('exchange_rates').upsert(rates);
    } catch (e) {
      console.warn('Supabase save rates failed:', e);
    }
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(rates));
  }
  return true;
}

export async function getShopSettings(): Promise<ShopSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('shop_settings').select('*').single();
      if (!error && data) return data as ShopSettings;
    } catch (e) {
      console.warn('Supabase fetch settings failed:', e);
    }
  }
  if (typeof window === 'undefined') return DEFAULT_SHOP_SETTINGS;
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SHOP_SETTINGS));
    return DEFAULT_SHOP_SETTINGS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SHOP_SETTINGS;
  }
}

export async function saveShopSettings(settings: ShopSettings): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('shop_settings').upsert(settings);
    } catch (e) {
      console.warn('Supabase save settings failed:', e);
    }
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }
  return true;
}
