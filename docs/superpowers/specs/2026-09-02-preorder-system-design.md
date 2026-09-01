# Preorder System Design Specification (China ➔ Laos & Thailand ➔ Laos)

**Date**: 2026-09-02  
**System Name**: Lao Preorder & Parcel Logistics Manager  
**Target Users**: Admin / Shop Owner & Staff (Internal Management) + Public Customer Tracking Link  
**Language & Typography**: Lao (ພາສາລາວ) with `Noto Sans Lao` font  
**Design Theme**: Dark Neon Cyber-Clean — Deep Black (`#0B0F19` / `#000000`), Bright Neon Green `#00FF00` accents, high contrast text and glowing indicators.  
**Hosting & Deployment**: GitHub Repository + Supabase Backend  

---

## 1. Overview & Business Objectives

A specialized web application for managing cross-border preorder and shipping businesses operating routes:
1. **China ➔ Laos (ຈີນ ➔ ລາວ)** 🇨🇳🇱🇦
2. **Thailand ➔ Laos (ໄທ ➔ ລາວ)** 🇹🇭🇱🇦

Key capabilities:
- Track parcels from order placement in China/Thailand through warehouse arrival in Laos and final customer handover.
- Two-stage cost input:
  - **Stage 1 (Order time)**: Record foreign product cost (CNY or THB), apply exchange rate to convert to Lao Kip (LAK), capture product photos, customer social profile (FB/WhatsApp), and local delivery address.
  - **Stage 2 (Arrival in Laos)**: Record international shipping fee directly in Lao Kip (LAK), compute final total cost and balance due / COD.
- Automated Bill Generation & Batch Thermal Printing (80mm & 100mm) with parcel tracking QR codes.
- One-click customized customer notification message generator for WhatsApp / Facebook.
- Public customer tracking page without requiring customer login.

---

## 2. Architecture & Tech Stack

- **Frontend**: Next.js (App Router) + React + Tailwind CSS + Lucide Icons + Google Font `Noto Sans Lao`
- **Theme**: Dark Background (`bg-neutral-950` / `bg-black`), Neon Green `#00FF00` (`text-emerald-400` / `#00FF00` / `border-[#00FF00]`) accents & glowing status badges
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security, Realtime, Supabase Storage for images)
- **Print System**: CSS Paged Media `@media print` optimized for 80mm & 100mm Thermal Receipt Printers & Sticker Labels
- **Deployment**: GitHub Repository with automatic Continuous Deployment

---

## 3. Database Schema (Supabase PostgreSQL)

### 3.1 Table: `orders` / `parcels`
| Column | Type | Description |
|---|---|---|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` | Unique parcel identifier |
| `tracking_code` | `VARCHAR(30) UNIQUE NOT NULL` | Internal tracking ID (e.g. `LA-CN-260901-001`, `LA-TH-260901-002`) |
| `route` | `VARCHAR(20) NOT NULL` | `CHINA_LAOS` or `THAI_LAOS` |
| `foreign_tracking_no` | `VARCHAR(100)` | China/Thai carrier tracking # (e.g. Flash, Kerry, ZTO, Shein, Taobao) |
| `customer_name` | `VARCHAR(100) NOT NULL` | Customer name |
| `customer_phone` | `VARCHAR(30) NOT NULL` | WhatsApp / Phone number |
| `customer_social_url` | `TEXT` | Facebook / WhatsApp profile link or note |
| `customer_social_image` | `TEXT` | URL of customer FB/WhatsApp profile/chat screenshot |
| `delivery_provider` | `VARCHAR(50)` | Local Laos delivery service (e.g. `RungAroun`, `Anousith`, `HAL`, `SelfPickup`, `Other`) |
| `delivery_branch` | `VARCHAR(100)` | Destination branch / address in Laos |
| `product_name` | `TEXT NOT NULL` | Product description / items |
| `product_image_url` | `TEXT` | Product image URL |
| `order_date` | `DATE NOT NULL` | Date when order was placed |
| `origin_currency` | `VARCHAR(10) NOT NULL` | `CNY` or `THB` |
| `origin_cost` | `NUMERIC(12,2) NOT NULL` | Product cost in source currency (¥ or ฿) |
| `exchange_rate` | `NUMERIC(12,4) NOT NULL` | Exchange rate applied (e.g. 1 CNY = 3,250 LAK, 1 THB = 645 LAK) |
| `product_cost_lak` | `NUMERIC(14,0) NOT NULL` | Converted product cost in LAK (`origin_cost * exchange_rate`) |
| `shipping_cost_lak` | `NUMERIC(14,0) DEFAULT 0` | International shipping cost entered in Lao Kip (LAK) upon arrival |
| `service_fee_lak` | `NUMERIC(14,0) DEFAULT 0` | Service / handling / margin fee in LAK |
| `total_cost_lak` | `NUMERIC(14,0) NOT NULL` | Total cost in LAK (`product_cost_lak + shipping_cost_lak + service_fee_lak`) |
| `deposit_lak` | `NUMERIC(14,0) DEFAULT 0` | Advance deposit paid by customer in LAK |
| `balance_due_lak` | `NUMERIC(14,0) NOT NULL` | Remaining balance to collect / COD in LAK (`total_cost_lak - deposit_lak`) |
| `status` | `VARCHAR(30) NOT NULL DEFAULT 'ordered'` | Enum: `ordered`, `in_transit`, `arrived_laos`, `delivering`, `completed`, `cancelled` |
| `arrived_date` | `DATE` | Date parcel arrived at Laos warehouse |
| `weight_kg` | `NUMERIC(8,2)` | Weight in kg (optional reference) |
| `notes` | `TEXT` | Special remarks |
| `created_at` | `TIMESTAMPTZ DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ DEFAULT NOW()` | Record update timestamp |

### 3.2 Table: `exchange_rates`
| Column | Type | Description |
|---|---|---|
| `currency` | `VARCHAR(10) PRIMARY KEY` | `CNY` or `THB` |
| `rate_to_lak` | `NUMERIC(12,4) NOT NULL` | Default exchange rate to 1 LAK |
| `updated_at` | `TIMESTAMPTZ DEFAULT NOW()` | Timestamp of last rate update |

### 3.3 Table: `shop_settings`
| Column | Type | Description |
|---|---|---|
| `id` | `INTEGER PRIMARY KEY DEFAULT 1` | Singleton settings row |
| `shop_name` | `VARCHAR(100)` | Shop title (e.g. `Preorder Lao-China-Thai`) |
| `phone` | `VARCHAR(50)` | Shop contact phone / WhatsApp |
| `address` | `TEXT` | Shop warehouse address in Laos |
| `bank_qr_image` | `TEXT` | BCEL One / Bank QR Code image for payments |
| `slip_header` | `TEXT` | Thermal slip header text |
| `slip_footer` | `TEXT` | Thermal slip footer terms |

---

## 4. User Workflows

### 4.1 Order Creation (ບັນທຶກອໍເດີໃໝ່)
1. Admin selects Route: **ຈີນ ➔ ລາວ** 🇨🇳 ຫຼື **ໄທ ➔ ລາວ** 🇹🇭.
2. Form auto-fills default daily exchange rate for the selected route.
3. Admin inputs:
   - Customer Name, Phone, Social Profile image/link.
   - Local delivery carrier in Laos & branch (e.g. ຮຸ່ງອາລຸນ ສາຂາດົງໂດກ).
   - Product name, source price (¥ / ฿), upload product photo.
   - Deposit paid in LAK (if any).
4. System calculates `product_cost_lak = origin_cost * exchange_rate`.
5. Status is initialized as `ordered` (ສັ່ງຊື້ແລ້ວ).
6. Admin clicks "Copy Order Confirmation Message" to send receipt summary to customer via WhatsApp/FB with 1 click.

### 4.2 Warehouse Arrival & Cost Finalization (ເຄື່ອງຮອດສາງລາວ)
1. Admin opens warehouse check-in tab or scans barcode/QR on incoming boxes.
2. Admin inputs:
   - `shipping_cost_lak` (ຄ່າຂົນສົ່ງມາລາວ ເປັນເງິນກີບ LAK).
   - Arrival date & optional parcel weight.
3. System recalculates:
   - `total_cost_lak = product_cost_lak + shipping_cost_lak + service_fee_lak`
   - `balance_due_lak = total_cost_lak - deposit_lak`
4. Status transitions to `arrived_laos` (ຮອດສາງລາວແລ້ວ / ພ້ອມຈັດສົ່ງ).
5. Admin clicks "Copy Arrival & Payment Notice" with tracking URL and exact balance in LAK to send to customer.

### 4.3 Batch Thermal Printing (ພິມບິນ Thermal ຫຼາຍໃບພ້ອມກັນ)
1. Admin checks multiple parcels on the parcel list table or filters by `arrived_laos` / `delivering`.
2. Admin clicks **"ພິມບິນທີ່ເລືອກ (Print Selected Bills)"**.
3. System opens print view with format selector (100mm Sticker / 80mm Slip).
4. Each bill renders:
   - Shop Header & Contact.
   - Parcel Tracking ID + QR Code pointing to live public tracking URL.
   - Route (🇨🇳➔🇱🇦 / 🇹🇭➔🇱🇦) & Foreign Tracking #.
   - Receiver: Name, Phone, Delivery Provider & Branch in Laos.
   - Cost Breakdown: Product Cost (LAK), Shipping Cost (LAK), Deposit (LAK), **Total Balance Due (LAK / COD)** prominently displayed.
   - BCEL One QR Code for payment.
5. Standard browser print dialog triggers with clean continuous page breaks for thermal printers.

### 4.4 Customer Self-Service Tracking (ໜ້າກວດສອບສະຖານະສາທາລະນະ)
- Accessible at `/track/[tracking_code]`.
- No login required.
- Shows real-time visual progress timeline:
  `ສັ່ງຊື້ແລ້ວ ➔ ສິນຄ້າກຳລັງເດີນທາງ ➔ ຮອດສາງລາວແລ້ວ ➔ ກຳລັງຈັດສົ່ງ ➔ ສຳເລັດ`
- Displays item photo, delivery branch, shipping breakdown in LAK, and payment QR.

---

## 5. Mobile-First UI/UX Structure

Matching the reference UI layout:
- **Header**: Search bar for instant tracking number or phone search + notifications + quick filter.
- **Metric Cards**: Total Active Orders, In-Transit, Arrived Laos (Awaiting Delivery), Total Pending Collection (LAK).
- **Primary Grid Actions**:
  - ➕ **ສັ່ງພຣີອໍເດີໃໝ່ (New Preorder)**
  - 📥 **ເຊັກອິນເຄື່ອງຮອດລາວ (Warehouse Arrival & Cost Input)**
  - 🖨️ **ພິມບິນ Thermal (Batch Thermal Print)**
  - 📦 **ຈັດການພັດສະດຸທັງໝົດ (All Parcels & Status)**
  - 💬 **ຂໍ້ຄວາມແຈ້ງລູກຄ້າ (Message Templates)**
  - 💱 **ຄິດໄລ່ & ຕັ້ງຄ່າເລດເງິນ (Exchange Rates & Settings)**
- **Bottom Navigation**:
  - ໜ້າຫຼັກ (Home)
  - ພັດສະດຸ (Parcels)
  - ປຸ່ມເພີ່ມດ່ວນ (+) (Quick Add)
  - ບິນ / COD (Bills & Collections)
  - ຕັ້ງຄ່າ (Settings)
