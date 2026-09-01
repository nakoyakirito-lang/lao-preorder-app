# Preorder System (China-Laos & Thailand-Laos) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete mobile-first Preorder & Parcel Logistics Web App for China-Laos and Thailand-Laos routes with dark neon-green theme (#00FF00), two-stage cost calculation in Lao Kip (LAK), batch thermal slip printing (80mm/100mm), 1-click customer message templates, and Supabase integration.

**Architecture:** Next.js (App Router) with Tailwind CSS, Lucide Icons, Google Font `Noto Sans Lao`, Supabase PostgreSQL database + Storage, and responsive mobile-first dark UI. Includes an offline-capable mock fallback provider so the app functions immediately with sample data.

**Tech Stack:** Next.js 14+, React 18/19, TypeScript, Tailwind CSS, Supabase JS, Lucide-React, Canvas-Confetti / QRCodeSVG, Noto Sans Lao.

**Spec:** [`docs/superpowers/specs/2026-09-02-preorder-system-design.md`](file:///c:/Web%20App/Preorder/docs/superpowers/specs/2026-09-02-preorder-system-design.md)

## Global Constraints
- Primary Language: Lao (ພາສາລາວ) with `Noto Sans Lao` font.
- Visual Theme: Deep Dark (`#0B0F19` / `#000000`), Neon Green `#00FF00` highlights, glowing indicators.
- Currency Rules: Source cost in CNY / THB converted to LAK; International shipping fee entered directly in LAK; Total & COD calculated in LAK.
- Thermal Print: Support 80mm & 100mm print formats with QR code pointing to live public tracking URL.
- Zero placeholder code ("TODO", "TBD"). All code must be complete and fully functional.

---

### Task 1: Project Scaffolding & Dark Neon UI Setup
**Files:**
- Create: `package.json`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/globals.css`
- Interfaces: Base layout, fonts (`Noto Sans Lao`), Tailwind `#00FF00` neon green theme extensions.

- [ ] **Step 1: Create package.json with dependencies**
- [ ] **Step 2: Create Tailwind config with Dark Neon theme & Lao font**
- [ ] **Step 3: Create global CSS with neon glow utilities & thermal print styles**
- [ ] **Step 4: Create Root Layout with Noto Sans Lao font injection**
- [ ] **Step 5: Run install & verify clean build**

---

### Task 2: Database Schema & Supabase Data Service
**Files:**
- Create: `supabase/schema.sql`, `src/types/database.ts`, `src/lib/supabase.ts`, `src/lib/storage.ts`
- Interfaces: Data models for `Order`, `ExchangeRate`, `ShopSettings`, CRUD functions with Supabase and localStorage fallback.

- [ ] **Step 1: Write `supabase/schema.sql` for PostgreSQL tables, indexes & RLS policies**
- [ ] **Step 2: Write TypeScript definitions in `src/types/database.ts`**
- [ ] **Step 3: Implement Supabase client & LocalStorage fallback provider in `src/lib/storage.ts`**
- [ ] **Step 4: Verify storage service reads/writes orders and exchange rates**

---

### Task 3: Financial Calculations, Currency & Message Utilities
**Files:**
- Create: `src/lib/calculations.ts`, `src/lib/messageGenerator.ts`, `src/lib/qr.ts`
- Interfaces: Math utilities for CNY/THB to LAK conversion, formatted balance due, WhatsApp/Facebook message template builders.

- [ ] **Step 1: Implement cost calculation functions in `src/lib/calculations.ts`**
- [ ] **Step 2: Implement auto message formatting in `src/lib/messageGenerator.ts`**
- [ ] **Step 3: Verify LAK formatting and message output**

---

### Task 4: Main Navigation & Dashboard (ໜ້າຫຼັກ)
**Files:**
- Create: `src/components/Header.tsx`, `src/components/BottomNav.tsx`, `src/components/StatsCards.tsx`, `src/components/QuickActionGrid.tsx`, `src/app/page.tsx`
- Interfaces: Mobile top bar with search, quick metrics (Active, In-Transit, Arrived, Total COD LAK), action grid matching mockup.

- [ ] **Step 1: Build Top Header with search bar and branch status**
- [ ] **Step 2: Build Metric Stats Cards with glowing neon green counters**
- [ ] **Step 3: Build Quick Action Grid with icons matching the user's reference mockup**
- [ ] **Step 4: Build Bottom Navigation bar for mobile devices**
- [ ] **Step 5: Integrate into `src/app/page.tsx` and verify layout**

---

### Task 5: New Preorder Creation Module (ສັ່ງພຣີອໍເດີໃໝ່)
**Files:**
- Create: `src/app/orders/new/page.tsx`, `src/components/orders/OrderForm.tsx`, `src/components/ImageUpload.tsx`
- Interfaces: Route selector (🇨🇳 จีน / 🇹🇭 ไทย), image upload for product & FB/WhatsApp chat, delivery carrier/branch picker, live LAK cost preview, 1-click copy message modal.

- [ ] **Step 1: Build Image Upload component with camera/file preview**
- [ ] **Step 2: Build Order Form with real-time currency conversion and route defaults**
- [ ] **Step 3: Add auto-generated confirmation message with 1-click copy button**
- [ ] **Step 4: Verify saving new preorder and copy message flow**

---

### Task 6: Warehouse Check-in & Cost Finalization (ເຄື່ອງຮອດສາງລາວ)
**Files:**
- Create: `src/app/warehouse/page.tsx`, `src/components/warehouse/CheckInModal.tsx`
- Interfaces: Search/scan incoming parcels, input shipping cost directly in LAK, update status to `arrived_laos`, calculate final total & balance due.

- [ ] **Step 1: Build incoming parcels check-in list with search & filter**
- [ ] **Step 2: Build Check-In modal for entering shipping fee (LAK) and arrival date**
- [ ] **Step 3: Add instant notification copy button for customer arrival alert**
- [ ] **Step 4: Verify cost recalculation and status update**

---

### Task 7: Batch Thermal Printing Module (ພິມບິນ Thermal 80mm / 100mm)
**Files:**
- Create: `src/app/print/page.tsx`, `src/components/print/ThermalBill.tsx`
- Interfaces: Multi-select parcels, toggle 80mm / 100mm slip formats, generate QR code for live tracking, print styling.

- [ ] **Step 1: Build Thermal Bill component with QR code, recipient details, and LAK cost breakdown**
- [ ] **Step 2: Build Batch Print page with format selector (80mm / 100mm) and print trigger**
- [ ] **Step 3: Test print view across single and multiple parcels**

---

### Task 8: All Parcels Management & Status Filter (ຈັດການພັດສະດຸທັງໝົດ)
**Files:**
- Create: `src/app/parcels/page.tsx`, `src/components/parcels/ParcelCard.tsx`, `src/components/parcels/StatusBadge.tsx`
- Interfaces: List with filter tabs (All, China->Laos, Thai->Laos, Ordered, Arrived, Delivered), quick WhatsApp button, search.

- [ ] **Step 1: Build Parcel Card with customer photo, status badge, and quick action buttons**
- [ ] **Step 2: Build filter tabs and search bar**
- [ ] **Step 3: Integrate quick status changer and WhatsApp link trigger**

---

### Task 9: Public Customer Tracking Page (ໜ້າຕິດຕາມພັດສະດຸສຳລັບລູກຄ້າ)
**Files:**
- Create: `src/app/track/[code]/page.tsx`, `src/components/track/TrackingTimeline.tsx`
- Interfaces: Publicly accessible parcel tracking page with step-by-step progress, cost summary in LAK, product photo, and shop contact.

- [ ] **Step 1: Build public tracking page layout**
- [ ] **Step 2: Build visual timeline progress component**
- [ ] **Step 3: Verify access via tracking code without authentication**

---

### Task 10: Exchange Rate Settings & Shop Profile (ຕັ້ງຄ່າເລດເງິນ & ຮ້ານ)
**Files:**
- Create: `src/app/settings/page.tsx`, `src/components/settings/RateSettings.tsx`
- Interfaces: Update CNY->LAK and THB->LAK rates, shop contact info, BCEL QR upload, test data seeding.

- [ ] **Step 1: Build Exchange Rate editor with live preview calculator**
- [ ] **Step 2: Build Shop Profile and thermal slip header/footer configuration**
- [ ] **Step 3: Add database reset/sample data loader for testing**

---

### Task 11: Deployment Setup & Verification
**Files:**
- Create: `README.md`, `.env.example`, `vercel.json`
- Interfaces: GitHub deployment guide, Supabase connection instructions.

- [ ] **Step 1: Create README with Supabase setup and GitHub deployment instructions**
- [ ] **Step 2: Run end-to-end verification (build test, mobile layout test, print test)**
