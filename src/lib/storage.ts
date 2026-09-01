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

export const SEED_ORDERS: Order[] = [
  {
    id: 'ord-101',
    tracking_code: 'LA-CN-260901-001',
    route: 'CHINA_LAOS',
    foreign_tracking_no: 'SF1983748293CN',
    customer_name: 'ທ້າວ ສົມສັກ ວົງສາ',
    customer_phone: '020 5512 3456',
    customer_social_url: 'fb.com/somsak.lao',
    customer_social_image: '',
    delivery_provider: 'RungAroun',
    delivery_branch: 'ຮຸ່ງອາລຸນ ສາຂາ ດົງໂດກ (ມຊ)',
    product_name: 'ເກີບຜ້າໃບ Nike Dunk Low Retro (ສີຂາວ-ດຳ)',
    product_image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
    order_date: '2026-09-01',
    origin_currency: 'CNY',
    origin_cost: 299,
    exchange_rate: 3200,
    product_cost_lak: 956800,
    shipping_cost_lak: 45000,
    service_fee_lak: 0,
    total_cost_lak: 1001800,
    deposit_lak: 500000,
    balance_due_lak: 501800,
    status: 'arrived_laos',
    arrived_date: '2026-09-02',
    weight_kg: 1.2,
    notes: 'ເຄື່ອງຮອດແລ້ວ ພ້ອມສົ່ງສາຂາດົງໂດກ',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ord-102',
    tracking_code: 'LA-TH-260901-002',
    route: 'THAI_LAOS',
    foreign_tracking_no: 'TH01928374TH',
    customer_name: 'ນາງ ມະນີວອນ ແສງດາວົງ',
    customer_phone: '020 9988 7766',
    customer_social_url: 'fb.com/manivone.fashion',
    customer_social_image: '',
    delivery_provider: 'Anousith',
    delivery_branch: 'ອານຸສິດ ສາຂາ ປາກເຊ',
    product_name: 'ເສື້ອກັນໜາວ Cardigan ໄໝພົມເກົາຫຼີ (3 ໂຕ)',
    product_image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60',
    order_date: '2026-09-01',
    origin_currency: 'THB',
    origin_cost: 850,
    exchange_rate: 640,
    product_cost_lak: 544000,
    shipping_cost_lak: 0,
    service_fee_lak: 0,
    total_cost_lak: 544000,
    deposit_lak: 200000,
    balance_due_lak: 344000,
    status: 'in_transit',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ord-103',
    tracking_code: 'LA-CN-260902-003',
    route: 'CHINA_LAOS',
    foreign_tracking_no: 'ZT7829102934CN',
    customer_name: 'ທ້າວ ບຸນທັນ ຈັນທະມາລີ',
    customer_phone: '020 2233 4455',
    customer_social_url: 'wa.me/8562022334455',
    delivery_provider: 'HAL',
    delivery_branch: 'HAL ສາຂາ ໜອງບອນ',
    product_name: 'ໂຄມໄຟ Smart LED RGB ສຳລັບຫ້ອງນອນ',
    product_image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60',
    order_date: '2026-09-02',
    origin_currency: 'CNY',
    origin_cost: 120,
    exchange_rate: 3200,
    product_cost_lak: 384000,
    shipping_cost_lak: 0,
    service_fee_lak: 0,
    total_cost_lak: 384000,
    deposit_lak: 384000,
    balance_due_lak: 0,
    status: 'ordered',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Data service helpers
export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Order[];
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage', e);
    }
  }

  if (typeof window === 'undefined') return SEED_ORDERS;
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(SEED_ORDERS));
    return SEED_ORDERS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_ORDERS;
  }
}

export async function getOrderByTrackingCode(code: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((o) => o.tracking_code.toLowerCase() === code.toLowerCase()) || null;
}

export async function saveOrder(order: Order): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('orders').upsert(order);
      if (error) console.error('Supabase upsert error:', error);
    } catch (e) {
      console.warn('Supabase save failed, saving locally:', e);
    }
  }

  if (typeof window !== 'undefined') {
    const orders = await getOrders();
    const index = orders.findIndex((o) => o.id === order.id || o.tracking_code === order.tracking_code);
    if (index >= 0) {
      orders[index] = { ...order, updated_at: new Date().toISOString() };
    } else {
      orders.unshift({ ...order, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
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
