export type RouteType = 'CHINA_LAOS' | 'THAI_LAOS';
export type OriginCurrency = 'CNY' | 'THB';
export type ServiceType = 'BUY_FOR_YOU' | 'PREORDER'; // ຮັບສັ່ງເຄື່ອງ (Proxy) vs ພຣີອໍເດີມາຂາຍ (Retail)
export type OrderStatus =
  | 'ordered'        // ສັ່ງຊື້ແລ້ວ
  | 'in_transit'      // ກຳລັງເດີນທາງມາລາວ
  | 'arrived_laos'    // ຮອດສາງລາວແລ້ວ
  | 'delivering'      // ກຳລັງຈັດສົ່ງໃນລາວ
  | 'completed'       // ສຳເລັດ / ຈ່າຍເງິນແລ້ວ
  | 'cancelled';      // ຍົກເລີກ / ຕີກັບ

export interface Order {
  id: string;
  tracking_code: string;
  service_type: ServiceType;
  route: RouteType;
  foreign_tracking_no: string;
  
  // Customer
  customer_name: string;
  customer_phone: string;
  customer_social_url?: string;
  customer_social_image?: string;
  delivery_provider: string;
  delivery_branch: string;
  
  // Product
  product_name: string;
  product_url?: string;
  product_image_url?: string;
  order_date: string; // YYYY-MM-DD
  
  // Financials & Currency
  origin_currency: OriginCurrency;
  origin_cost: number;
  exchange_rate: number;         // ເລດຮ້ານທີ່ຄິດໄລ່ເກັບລູກຄ້າ
  real_exchange_rate?: number;    // ເລດຕົ້ນທຶນຕົວຈິງ (ຖ້າມີ)
  product_cost_lak: number;      // ຄ່າສິນຄ້າເກັບລູກຄ້າ
  selling_price_lak?: number;    // ລາຄາຂາຍລວມ (ກໍລະນີພຣີອໍເດີມາຂາຍ)
  
  // Arrival Shipping & Final Balance
  shipping_cost_lak: number;        // ຄ່າສົ່ງທີ່ເກັບນຳລູກຄ້າ (ເຊັ່ນ 80,000)
  actual_shipping_cost_lak?: number; // ຕົ້ນທຶນຄ່າສົ່ງຈິງທີ່ຈ່າຍໃຫ້ຂົນສົ່ງ (ເຊັ່ນ 50,000)
  service_fee_lak: number;
  total_cost_lak: number;           // ຍອດລວມທີ່ເກັບນຳລູກຄ້າ
  deposit_lak: number;
  balance_due_lak: number;          // ຍອດ COD ທີ່ເຫຼືອເກັບລູກຄ້າ
  profit_lak?: number;              // ກຳໄລສຸດທິຂອງຮ້ານ (ລວມສ່ວນຕ່າງເລດ + ກຳໄລຄ່າສົ່ງ + ຄ່າບໍລິການ)
  
  // Status
  status: OrderStatus;
  arrived_date?: string;
  weight_kg?: number;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ExchangeRate {
  currency: OriginCurrency;
  rate_to_lak: number;
  updated_at: string;
}

export interface ShopSettings {
  id: number;
  shop_name: string;
  phone: string;
  address: string;
  bank_qr_image?: string;
  slip_header?: string;
  slip_footer?: string;
  updated_at: string;
}

export interface DeliveryProviderOption {
  id: string;
  nameLao: string;
  nameEn: string;
  color: string;
}

export const DELIVERY_PROVIDERS: DeliveryProviderOption[] = [
  { id: 'RungAroun', nameLao: 'ຂົນສົ່ງ ຮຸ່ງອາລຸນ (HAL Express)', nameEn: 'RungAroun Express', color: '#dc2626' },
  { id: 'Anousith', nameLao: 'ຂົນສົ່ງ ອານຸສິດ (Anousith Express)', nameEn: 'Anousith Express', color: '#2563eb' },
  { id: 'HAL', nameLao: 'HAL Logistics', nameEn: 'HAL Logistics', color: '#ea580c' },
  { id: 'Mittaphab', nameLao: 'ຂົນສົ່ງ ມິດຕະພາບ', nameEn: 'Mittaphab Express', color: '#059669' },
  { id: 'Mixay', nameLao: 'ຂົນສົ່ງ ມີໄຊ', nameEn: 'Mixay Express', color: '#7c3aed' },
  { id: 'SelfPickup', nameLao: 'ມາຮັບເອງທີ່ສາງ/ໜ້າຮ້ານ', nameEn: 'Self Pickup', color: '#00FF00' },
  { id: 'Other', nameLao: 'ອື່ນໆ / ຂົນສົ່ງທ້ອງຖິ່ນ', nameEn: 'Other Delivery', color: '#64748b' },
];

export const STATUS_CONFIG: Record<
  OrderStatus,
  { labelLao: string; color: string; bg: string; border: string }
> = {
  ordered: {
    labelLao: 'ສັ່ງຊື້ແລ້ວ',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: '#38bdf8',
  },
  in_transit: {
    labelLao: 'ກຳລັງມາລາວ',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: '#fbbf24',
  },
  arrived_laos: {
    labelLao: 'ຮອດສາງລາວແລ້ວ',
    color: '#00FF00',
    bg: 'rgba(0, 255, 0, 0.15)',
    border: '#00FF00',
  },
  delivering: {
    labelLao: 'ກຳລັງຈັດສົ່ງໃນລາວ',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: '#a855f7',
  },
  completed: {
    labelLao: 'ສຳເລັດ / ຈ່າຍແລ້ວ',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: '#10b981',
  },
  cancelled: {
    labelLao: 'ຍົກເລີກ / ຕີກັບ',
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.15)',
    border: '#f43f5e',
  },
};
