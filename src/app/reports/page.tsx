'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Order, ShopSettings } from '@/types/database';
import { getOrders, getShopSettings, DEFAULT_SHOP_SETTINGS } from '@/lib/storage';
import { formatLAK } from '@/lib/calculations';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Truck,
  ArrowLeft,
  Calendar,
  Layers,
  ArrowUpRight,
  Printer,
  Sparkles,
  PieChart,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  Wallet,
  Coins,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

type DateFilter = 'all' | 'today' | 'this_week' | 'this_month' | 'custom';

export default function ReportsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrders(), getShopSettings()]).then(([ordData, settsData]) => {
      setOrders(ordData);
      setSettings(settsData);
      setLoading(false);
    });
  }, []);

  // Date Calculations for counts
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const past7 = new Date();
  past7.setDate(now.getDate() - 7);
  const past7Str = past7.toISOString().slice(0, 10);
  const currentMonthStr = todayStr.slice(0, 7);

  const todayCount = orders.filter((o) => {
    const d = o.order_date || (o.created_at ? o.created_at.slice(0, 10) : '');
    return d === todayStr;
  }).length;

  const last7Count = orders.filter((o) => {
    const d = o.order_date || (o.created_at ? o.created_at.slice(0, 10) : '');
    return d >= past7Str;
  }).length;

  const thisMonthCount = orders.filter((o) => {
    const d = o.order_date || (o.created_at ? o.created_at.slice(0, 10) : '');
    return d.startsWith(currentMonthStr);
  }).length;

  // Filter orders by date range
  const filteredOrders = orders.filter((order) => {
    if (dateFilter === 'all') return true;
    const orderDateStr = order.order_date || (order.created_at ? order.created_at.slice(0, 10) : '');
    if (!orderDateStr) return false;

    if (dateFilter === 'today') {
      return orderDateStr === todayStr;
    }

    if (dateFilter === 'this_week') {
      return orderDateStr >= past7Str;
    }

    if (dateFilter === 'this_month') {
      return orderDateStr.startsWith(currentMonthStr);
    }

    if (dateFilter === 'custom') {
      if (customStartDate && orderDateStr < customStartDate) return false;
      if (customEndDate && orderDateStr > customEndDate) return false;
      return true;
    }

    return true;
  });

  // Financial Calculations
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_cost_lak || 0), 0);
  const totalProfit = filteredOrders.reduce((sum, o) => sum + (o.profit_lak || 0), 0);
  const totalDepositCollected = filteredOrders.reduce((sum, o) => sum + (o.deposit_lak || 0), 0);
  const totalOutstandingCOD = filteredOrders.reduce(
    (sum, o) => sum + (o.status !== 'completed' && o.status !== 'cancelled' ? o.balance_due_lak || 0 : 0),
    0
  );
  const totalProductCost = filteredOrders.reduce(
    (sum, o) => sum + (o.product_cost_lak || 0),
    0
  );
  const totalActualShipping = filteredOrders.reduce(
    (sum, o) => sum + (o.actual_shipping_cost_lak || 0),
    0
  );

  // Service Type Breakdown
  const proxyOrders = filteredOrders.filter((o) => (o.service_type || 'BUY_FOR_YOU') === 'BUY_FOR_YOU');
  const preorderOrders = filteredOrders.filter((o) => o.service_type === 'PREORDER');

  const proxyRevenue = proxyOrders.reduce((sum, o) => sum + (o.total_cost_lak || 0), 0);
  const proxyProfit = proxyOrders.reduce((sum, o) => sum + (o.profit_lak || 0), 0);

  const preorderRevenue = preorderOrders.reduce((sum, o) => sum + (o.total_cost_lak || 0), 0);
  const preorderProfit = preorderOrders.reduce((sum, o) => sum + (o.profit_lak || 0), 0);

  // Route Breakdown
  const chinaOrders = filteredOrders.filter((o) => o.route === 'CHINA_LAOS');
  const thaiOrders = filteredOrders.filter((o) => o.route === 'THAI_LAOS');

  const chinaRevenue = chinaOrders.reduce((sum, o) => sum + (o.total_cost_lak || 0), 0);
  const thaiRevenue = thaiOrders.reduce((sum, o) => sum + (o.total_cost_lak || 0), 0);

  // Status Counts
  const statusCounts = {
    ordered: filteredOrders.filter((o) => o.status === 'ordered').length,
    in_transit: filteredOrders.filter((o) => o.status === 'in_transit').length,
    arrived_laos: filteredOrders.filter((o) => o.status === 'arrived_laos').length,
    delivering: filteredOrders.filter((o) => o.status === 'delivering').length,
    completed: filteredOrders.filter((o) => o.status === 'completed').length,
  };

  // Delivery Providers Breakdown
  const providerStats: Record<string, { count: number; totalShipping: number }> = {};
  filteredOrders.forEach((o) => {
    const prov = o.delivery_provider || 'ອື່ນໆ';
    if (!providerStats[prov]) {
      providerStats[prov] = { count: 0, totalShipping: 0 };
    }
    providerStats[prov].count += 1;
    providerStats[prov].totalShipping += o.shipping_cost_lak || 0;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between no-print shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:border-slate-900 transition-colors"
            title="ຍ້ອນກັບ"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <BarChart3 size={18} className="text-slate-900" />
              ແດຊບອດລາຍງານ & ສະຖິຕິ
            </h1>
            <p className="text-[11px] text-slate-500">ສະຫຼຸບຍອດຂາຍ, ກຳໄລ ແລະ ການຂົນສົ່ງ</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="py-1.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-black shadow-sm transition-all"
        >
          <Printer size={14} />
          <span>ພິມລາຍງານ</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Date Filter Tabs with Counts & Custom Picker */}
        <div className="space-y-1.5 no-print">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Calendar size={13} className="text-slate-800" />
              ກັ່ນຕອງວັນທີ (Date Range):
            </span>
            {(dateFilter !== 'all' || customStartDate || customEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setDateFilter('all');
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="text-[10px] text-slate-500 hover:text-slate-900 font-bold flex items-center gap-0.5"
              >
                <RotateCcw size={10} />
                ລ້າງວັນທີ
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: `ທັງໝົດ (${orders.length})` },
              { id: 'today', label: `☀️ ມື້ນີ້ (${todayCount})` },
              { id: 'this_week', label: `🗓️ 7 ມື້ (${last7Count})` },
              { id: 'this_month', label: `📆 ເດືອນນີ້ (${thisMonthCount})` },
              { id: 'custom', label: `🔍 ເລືອກຊ່ວງວັນທີ` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id as DateFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  dateFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker */}
          {dateFilter === 'custom' && (
            <div className="p-2.5 bg-white border border-slate-300 rounded-xl space-y-2 shadow-sm animate-fadeIn">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">ແຕ່ວັນທີ:</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">ຮອດວັນທີ:</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Executive Summary Cards */}
        <div className="space-y-2.5">
          {/* Main Financial Hero Card */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Wallet size={16} className="text-slate-300" />
                ຍອດລວມທຸລະກິດ (Total Revenue)
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded-full font-bold">
                {filteredOrders.length} ອໍເດີ
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatLAK(totalRevenue)}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <div className="bg-slate-800/80 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">📈 ກຳໄລສຸດທິ (Net Profit)</span>
                <span className="text-sm font-black text-emerald-400">
                  +{formatLAK(totalProfit)}
                </span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">⏳ COD ປາຍທາງທີ່ຕ້ອງເກັບ</span>
                <span className="text-sm font-black text-amber-400">
                  {formatLAK(totalOutstandingCOD)}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Secondary Metric Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1">
                <Coins size={15} />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold block">ເກັບແລ້ວ (ມັດຈຳ)</span>
              <span className="text-xs font-black text-slate-900">{formatLAK(totalDepositCollected)}</span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-7 h-7 mx-auto rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-1">
                <Package size={15} />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold block">ຕົ້ນທຶນສິນຄ້າ</span>
              <span className="text-xs font-black text-slate-900">{formatLAK(totalProductCost)}</span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-7 h-7 mx-auto rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-1">
                <Truck size={15} />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold block">ຄ່າຂົນສົ່ງຕົວຈິງ</span>
              <span className="text-xs font-black text-slate-900">{formatLAK(totalActualShipping)}</span>
            </div>
          </div>
        </div>

        {/* Service Type Breakdown: ຮັບສັ່ງ vs ພຣີອໍເດີມາຂາຍ */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Layers size={16} className="text-slate-900" />
            ສະຫຼຸບແຍກຕາມຮູບແບບການບໍລິການ (Service Types)
          </h3>

          <div className="space-y-2.5">
            {/* Buy-For-You (ຮັບສັ່ງ) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                  <span className="text-xs font-bold text-slate-900">📦 ຮັບສັ່ງເຄື່ອງ (Buy-For-You)</span>
                </div>
                <span className="text-xs font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {proxyOrders.length} ອໍເດີ
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
                <span>ຍອດລວມ: <strong className="text-slate-900">{formatLAK(proxyRevenue)}</strong></span>
                <span>ກຳໄລ: <strong className="text-emerald-700">+{formatLAK(proxyProfit)}</strong></span>
              </div>
            </div>

            {/* Preorder Retail (ພຣີອໍເດີມາຂາຍ) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-bold text-slate-900">🏷️ ພຣີອໍເດີມາຂາຍ (Retail Preorder)</span>
                </div>
                <span className="text-xs font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {preorderOrders.length} ອໍເດີ
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
                <span>ຍອດລວມ: <strong className="text-slate-900">{formatLAK(preorderRevenue)}</strong></span>
                <span>ກຳໄລ: <strong className="text-emerald-700">+{formatLAK(preorderProfit)}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Route Breakdown: ຈີນ-ລາວ vs ໄທ-ລາວ */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <TrendingUp size={16} className="text-slate-900" />
            ສະຫຼຸບຕາມສາຍທາງຂົນສົ່ງ (Routes)
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 text-center">
              <span className="text-xs font-bold text-red-900 block">🇨🇳 ຈີນ ➔ ລາວ</span>
              <span className="text-lg font-black text-red-900 mt-0.5 block">{chinaOrders.length} ອໍເດີ</span>
              <span className="text-[11px] font-semibold text-red-700 mt-1 block">
                {formatLAK(chinaRevenue)}
              </span>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-center">
              <span className="text-xs font-bold text-blue-900 block">🇹🇭 ໄທ ➔ ລາວ</span>
              <span className="text-lg font-black text-blue-900 mt-0.5 block">{thaiOrders.length} ອໍເດີ</span>
              <span className="text-[11px] font-semibold text-blue-700 mt-1 block">
                {formatLAK(thaiRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Status Funnel */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <PieChart size={16} className="text-slate-900" />
            ສະຖານະພັດສະດຸທັງໝົດ (Status Funnel)
          </h3>

          <div className="space-y-2">
            {[
              { label: '📦 ສັ່ງຊື້ແລ້ວ (Ordered)', count: statusCounts.ordered, color: 'bg-slate-400' },
              { label: '🚚 ກຳລັງມາລາວ (In Transit)', count: statusCounts.in_transit, color: 'bg-amber-500' },
              { label: '🏢 ເຄື່ອງຮອດສາງລາວ (Arrived Laos)', count: statusCounts.arrived_laos, color: 'bg-blue-600' },
              { label: '🛵 ກຳລັງຈັດສົ່ງປາຍທາງ (Delivering)', count: statusCounts.delivering, color: 'bg-purple-600' },
              { label: '✅ ສຳເລັດການຈັດສົ່ງ (Completed)', count: statusCounts.completed, color: 'bg-emerald-600' },
            ].map((st) => {
              const percentage = filteredOrders.length > 0 ? (st.count / filteredOrders.length) * 100 : 0;
              return (
                <div key={st.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{st.label}</span>
                    <span className="font-bold text-slate-900">{st.count} ລາຍການ ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${st.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logistics & Delivery Providers */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Building2 size={16} className="text-slate-900" />
            ສະຖິຕິບໍລິສັດຂົນສົ່ງພາຍໃນລາວ (Couriers)
          </h3>

          <div className="space-y-2">
            {Object.keys(providerStats).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">ຍັງບໍ່ມີຂໍ້ມູນຂົນສົ່ງ</p>
            ) : (
              Object.entries(providerStats).map(([name, data]) => (
                <div
                  key={name}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                    <span className="font-bold text-slate-900">{name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900">{data.count} ພັດສະດຸ</span>
                    <span className="text-[10px] text-slate-500 block">
                      ຄ່າສົ່ງ: {formatLAK(data.totalShipping)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Link to Parcels */}
        <div className="pt-2 no-print">
          <Link
            href="/parcels"
            className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <span>ເບິ່ງລາຍການພັດສະດຸທັງໝົດ</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
