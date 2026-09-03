-- Supabase Database Schema for Lao Preorder Logistics System
-- Routes: China -> Laos (ຈີນ-ລາວ) & Thailand -> Laos (ໄທ-ລາວ)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: orders (parcels)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_code VARCHAR(50) UNIQUE NOT NULL,
  service_type VARCHAR(30) NOT NULL DEFAULT 'BUY_FOR_YOU' CHECK (service_type IN ('BUY_FOR_YOU', 'PREORDER')),
  route VARCHAR(20) NOT NULL CHECK (route IN ('CHINA_LAOS', 'THAI_LAOS')),
  foreign_tracking_no VARCHAR(100) DEFAULT '',
  
  -- Customer Information
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_social_url TEXT DEFAULT '',
  customer_social_image TEXT DEFAULT '',
  delivery_provider VARCHAR(100) NOT NULL DEFAULT 'RungAroun',
  delivery_province VARCHAR(100) DEFAULT '',
  delivery_branch VARCHAR(255) NOT NULL DEFAULT '',
  
  -- Product Details
  product_name TEXT NOT NULL,
  product_url TEXT DEFAULT '',
  product_image_url TEXT DEFAULT '',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Financials & Currency Calculation
  origin_currency VARCHAR(10) NOT NULL CHECK (origin_currency IN ('CNY', 'THB')),
  origin_cost NUMERIC(14, 2) NOT NULL DEFAULT 0,
  exchange_rate NUMERIC(14, 4) NOT NULL DEFAULT 1,
  product_cost_lak NUMERIC(16, 0) NOT NULL DEFAULT 0,
  selling_price_lak NUMERIC(16, 0) NOT NULL DEFAULT 0,
  
  -- Shipping & Final Cost (Added when arrived in Laos)
  shipping_cost_lak NUMERIC(16, 0) NOT NULL DEFAULT 0,
  actual_shipping_cost_lak NUMERIC(16, 0) NOT NULL DEFAULT 0,
  service_fee_lak NUMERIC(16, 0) NOT NULL DEFAULT 0,
  total_cost_lak NUMERIC(16, 0) NOT NULL DEFAULT 0,
  deposit_lak NUMERIC(16, 0) NOT NULL DEFAULT 0,
  balance_due_lak NUMERIC(16, 0) NOT NULL DEFAULT 0,
  profit_lak NUMERIC(16, 0) NOT NULL DEFAULT 0,
  
  -- Status & Logistics Tracking
  status VARCHAR(30) NOT NULL DEFAULT 'ordered' CHECK (
    status IN ('ordered', 'in_transit', 'arrived_laos', 'delivering', 'completed', 'cancelled')
  ),
  arrived_date DATE,
  weight_kg NUMERIC(8, 2) DEFAULT 0,
  notes TEXT DEFAULT '',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast search
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_route ON orders(route);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 2. Table: exchange_rates
CREATE TABLE IF NOT EXISTS exchange_rates (
  currency VARCHAR(10) PRIMARY KEY CHECK (currency IN ('CNY', 'THB')),
  rate_to_lak NUMERIC(14, 4) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial default exchange rates
INSERT INTO exchange_rates (currency, rate_to_lak)
VALUES 
  ('CNY', 3200),
  ('THB', 640)
ON CONFLICT (currency) DO NOTHING;

-- 3. Table: shop_settings
CREATE TABLE IF NOT EXISTS shop_settings (
  id INT PRIMARY KEY DEFAULT 1,
  shop_name VARCHAR(150) NOT NULL DEFAULT 'Preorder Lao Express',
  phone VARCHAR(50) NOT NULL DEFAULT '020-xxxxxxxx',
  address TEXT NOT NULL DEFAULT 'ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ',
  bank_qr_image TEXT DEFAULT '',
  slip_header TEXT DEFAULT 'ໃບບິນຮັບຝາກ ແລະ ຈັດສົ່ງພັດສະດຸ',
  slip_footer TEXT DEFAULT 'ຂອບໃຈທີ່ໃຊ້ບໍລິການ! ກະລຸນາກວດສອບສິນຄ້າກ່ອນເຊັນຮັບ',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO shop_settings (id, shop_name, phone, address)
VALUES (1, 'Preorder Lao Express', '020-xxxx-xxxx', 'ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to orders by tracking_code for the public tracking page
CREATE POLICY "Public can view parcel by tracking code" 
  ON orders FOR SELECT 
  USING (true);

-- Allow authenticated or public insert/update (or configure via Supabase service key / anon key)
CREATE POLICY "Enable read/write for all (anon key)" 
  ON orders FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Enable all for exchange_rates" 
  ON exchange_rates FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Enable all for shop_settings" 
  ON shop_settings FOR ALL 
  USING (true) 
  WITH CHECK (true);
