'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ParcelCard } from '@/components/parcels/ParcelCard';
import { CheckInModal } from '@/components/warehouse/CheckInModal';
import { Order, OrderStatus } from '@/types/database';
import { getOrders, saveOrder, deleteOrder } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { Boxes, Plus, Filter, ArrowLeft, Printer, Trash2, Calendar, X, RotateCcw } from 'lucide-react';
import Link from 'next/link';

type DateFilterPreset = 'ALL' | 'TODAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'CUSTOM';

export default function ParcelsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState<'ALL' | 'BUY_FOR_YOU' | 'PREORDER'>('ALL');
  const [selectedRoute, setSelectedRoute] = useState<'ALL' | 'CHINA_LAOS' | 'THAI_LAOS'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDatePreset, setSelectedDatePreset] = useState<DateFilterPreset>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [activeCheckInOrder, setActiveCheckInOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckInSave = async (updatedOrder: Order) => {
    await saveOrder(updatedOrder);
    await loadData();
    setActiveCheckInOrder(null);
  };

  const handleUpdateStatus = async (id: string, newStatus: Order['status']) => {
    const target = orders.find((o) => o.id === id);
    if (target) {
      const updated = { ...target, status: newStatus, updated_at: new Date().toISOString() };
      await saveOrder(updated);
      await loadData();
    }
  };

  // Date Calculations for filter counts
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

  const filteredOrders = orders.filter((o) => {
    // Service Type filter
    if (selectedServiceType !== 'ALL' && (o.service_type || 'BUY_FOR_YOU') !== selectedServiceType) return false;
    // Route filter
    if (selectedRoute !== 'ALL' && o.route !== selectedRoute) return false;
    // Status filter
    if (selectedStatus !== 'ALL' && o.status !== selectedStatus) return false;

    // Date Range Filter
    if (selectedDatePreset !== 'ALL') {
      const orderDateStr = o.order_date || (o.created_at ? o.created_at.slice(0, 10) : '');
      if (!orderDateStr) return false;

      if (selectedDatePreset === 'TODAY') {
        if (orderDateStr !== todayStr) return false;
      } else if (selectedDatePreset === 'LAST_7_DAYS') {
        if (orderDateStr < past7Str) return false;
      } else if (selectedDatePreset === 'THIS_MONTH') {
        if (!orderDateStr.startsWith(currentMonthStr)) return false;
      } else if (selectedDatePreset === 'CUSTOM') {
        if (customStartDate && orderDateStr < customStartDate) return false;
        if (customEndDate && orderDateStr > customEndDate) return false;
      }
    }

    // Search query
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.tracking_code.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      o.product_name.toLowerCase().includes(q) ||
      (o.foreign_tracking_no && o.foreign_tracking_no.toLowerCase().includes(q))
    );
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
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
              <Boxes size={18} className="text-slate-900" />
              ຈັດການພັດສະດຸທັງໝົດ
            </h1>
            <p className="text-[11px] text-slate-500">ລາຍການອໍເດີ ຈີນ-ລາວ & ໄທ-ລາວ</p>
          </div>
        </div>

        <Link
          href="/orders/new"
          className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm hover:bg-black transition-all"
        >
          <Plus size={18} className="stroke-[2.5]" />
        </Link>
      </div>

      <div className="p-4 space-y-3">
        {/* Search Bar */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ຄົ້ນຫາເລກພັດສະດຸ, ເບີໂທ, ຊື່ລູກຄ້າ..."
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none shadow-sm"
        />

        {/* Service Type Filter Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-200/70 rounded-2xl border border-slate-300">
          <button
            type="button"
            onClick={() => setSelectedServiceType('ALL')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl transition-all ${
              selectedServiceType === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ທັງໝົດ ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedServiceType('BUY_FOR_YOU')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl transition-all ${
              selectedServiceType === 'BUY_FOR_YOU'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📦 ຮັບສັ່ງ ({orders.filter((o) => (o.service_type || 'BUY_FOR_YOU') === 'BUY_FOR_YOU').length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedServiceType('PREORDER')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl transition-all ${
              selectedServiceType === 'PREORDER'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏷️ ພຣີອໍເດີ ({orders.filter((o) => o.service_type === 'PREORDER').length})
          </button>
        </div>

        {/* Route Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedRoute('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedRoute === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
          >
            🌐 ທຸກສາຍທາງ ({orders.length})
          </button>
          <button
            onClick={() => setSelectedRoute('CHINA_LAOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedRoute === 'CHINA_LAOS'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
          >
            🇨🇳 ຈີນ ➔ ລາວ ({orders.filter((o) => o.route === 'CHINA_LAOS').length})
          </button>
          <button
            onClick={() => setSelectedRoute('THAI_LAOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedRoute === 'THAI_LAOS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
          >
            🇹🇭 ໄທ ➔ ລາວ ({orders.filter((o) => o.route === 'THAI_LAOS').length})
          </button>
        </div>

        {/* Date Filter Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Calendar size={13} className="text-slate-800" />
              ກັ່ນຕອງວັນທີ (Date):
            </span>
            {(selectedDatePreset !== 'ALL' || customStartDate || customEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDatePreset('ALL');
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
              { id: 'ALL', label: `ທັງໝົດ (${orders.length})` },
              { id: 'TODAY', label: `☀️ ມື້ນີ້ (${todayCount})` },
              { id: 'LAST_7_DAYS', label: `🗓️ 7 ມື້ (${last7Count})` },
              { id: 'THIS_MONTH', label: `📆 ເດືອນນີ້ (${thisMonthCount})` },
              { id: 'CUSTOM', label: `🔍 ເລືອກຊ່ວງວັນທີ` },
            ].map((dTab) => (
              <button
                key={dTab.id}
                onClick={() => setSelectedDatePreset(dTab.id as DateFilterPreset)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDatePreset === dTab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
                }`}
              >
                {dTab.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker */}
          {selectedDatePreset === 'CUSTOM' && (
            <div className="p-2.5 bg-white border border-slate-300 rounded-xl space-y-2 shadow-sm">
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

        {/* Status Filter Scrollbar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'ALL', label: 'ທັງໝົດ' },
            { id: 'ordered', label: '📦 ສັ່ງຊື້ແລ້ວ' },
            { id: 'in_transit', label: '🚚 ກຳລັງມາ' },
            { id: 'arrived_laos', label: '🏢 ຮອດລາວແລ້ວ' },
            { id: 'delivering', label: '🛵 ກຳລັງຈັດສົ່ງ' },
            { id: 'completed', label: '✅ ສຳເລັດ' },
          ].map((st) => {
            const count = orders.filter((o) => st.id === 'ALL' || o.status === st.id).length;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  selectedStatus === st.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
                }`}
              >
                {st.label} ({count})
              </button>
            );
          })}
        </div>

        {/* List of Orders */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">ກຳລັງໂຫຼດ...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs px-4 shadow-sm">
            <Boxes size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700">ບໍ່ພົບລາຍການພັດສະດຸ</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredOrders.map((order) => (
              <ParcelCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                onCheckIn={(ord) => setActiveCheckInOrder(ord)}
              />
            ))}
          </div>
        )}
      </div>

      {activeCheckInOrder && (
        <CheckInModal
          order={activeCheckInOrder}
          onClose={() => setActiveCheckInOrder(null)}
          onSave={handleCheckInSave}
        />
      )}

      <BottomNav />
    </main>
  );
}
