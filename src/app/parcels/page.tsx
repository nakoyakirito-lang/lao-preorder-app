'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ParcelCard } from '@/components/parcels/ParcelCard';
import { CheckInModal } from '@/components/warehouse/CheckInModal';
import { Order, OrderStatus } from '@/types/database';
import { getOrders, saveOrder, deleteOrder } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { Boxes, Plus, Filter, ArrowLeft, Printer, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ParcelsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<'ALL' | 'CHINA_LAOS' | 'THAI_LAOS'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
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

  const filteredOrders = orders.filter((o) => {
    // Route filter
    if (selectedRoute !== 'ALL' && o.route !== selectedRoute) return false;
    // Status filter
    if (selectedStatus !== 'ALL' && o.status !== selectedStatus) return false;
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
    <main className="min-h-screen bg-background text-slate-100 flex flex-col pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 rounded-lg bg-surface border border-slate-700 flex items-center justify-center text-slate-300 hover:text-neon hover:border-neon transition-colors"
            title="ຍ້ອນກັບ"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <Boxes size={18} className="text-neon" />
              ຈັດການພັດສະດຸທັງໝົດ
            </h1>
            <p className="text-[11px] text-slate-400">ລາຍການອໍເດີ ຈີນ-ລາວ & ໄທ-ລາວ</p>
          </div>
        </div>

        <Link
          href="/orders/new"
          className="w-8 h-8 rounded-lg bg-neon text-black flex items-center justify-center shadow-neon-sm hover:scale-105 transition-all"
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
          className="w-full px-3.5 py-2.5 bg-surface border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-neon focus:outline-none"
        />

        {/* Route Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedRoute('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedRoute === 'ALL'
                ? 'bg-neon text-black shadow-neon-sm'
                : 'bg-surface border border-slate-800 text-slate-400'
            }`}
          >
            🌐 ທຸກສາຍທາງ ({orders.length})
          </button>
          <button
            onClick={() => setSelectedRoute('CHINA_LAOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedRoute === 'CHINA_LAOS'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-surface border border-slate-800 text-slate-400'
            }`}
          >
            🇨🇳 ຈີນ ➔ ລາວ ({orders.filter((o) => o.route === 'CHINA_LAOS').length})
          </button>
          <button
            onClick={() => setSelectedRoute('THAI_LAOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedRoute === 'THAI_LAOS'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-surface border border-slate-800 text-slate-400'
            }`}
          >
            🇹🇭 ໄທ ➔ ລາວ ({orders.filter((o) => o.route === 'THAI_LAOS').length})
          </button>
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
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedStatus === st.id
                  ? 'bg-slate-200 text-black'
                  : 'bg-surface/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* List of Orders */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">ກຳລັງໂຫຼດ...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 bg-surface/60 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs px-4">
            <Boxes size={32} className="mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">ບໍ່ພົບລາຍການພັດສະດຸ</p>
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
