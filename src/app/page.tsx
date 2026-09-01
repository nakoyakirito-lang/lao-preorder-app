'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { QuickActionGrid } from '@/components/QuickActionGrid';
import { BottomNav } from '@/components/BottomNav';
import { ParcelCard } from '@/components/parcels/ParcelCard';
import { CheckInModal } from '@/components/warehouse/CheckInModal';
import { Order } from '@/types/database';
import { getOrders, saveOrder } from '@/lib/storage';
import { Package, Sparkles, Filter, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredOrders = orders.filter((o) => {
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

  const recentOrders = filteredOrders.slice(0, 5);

  return (
    <main className="min-h-screen bg-background text-slate-100 flex flex-col">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <div className="flex-1 space-y-3 pb-8">
        {/* Metric Summary Cards */}
        <StatsCards orders={orders} />

        {/* Quick Actions Grid */}
        <QuickActionGrid />

        {/* Recent Parcels List */}
        <div className="px-4 pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon animate-pulse"></span>
              <h2 className="text-sm font-bold text-slate-100">
                {searchQuery ? `ຜົນການຄົ້ນຫາ (${filteredOrders.length})` : 'ພັດສະດຸຫຼ້າສຸດ'}
              </h2>
            </div>
            <Link
              href="/parcels"
              className="text-xs font-bold text-neon hover:underline flex items-center gap-0.5"
            >
              ເບິ່ງທັງໝົດ <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
              <span>ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-12 bg-surface/60 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs px-4">
              <Package size={32} className="mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-slate-300">ບໍ່ພົບລາຍການພັດສະດຸ</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {searchQuery ? 'ລອງປ່ຽນຄຳຄົ້ນຫາໃໝ່' : 'ກົດປຸ່ມ + ເພື່ອສັ່ງພຣີອໍເດີທຳອິດ'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentOrders.map((order) => (
                <ParcelCard
                  key={order.id}
                  order={order}
                  onCheckIn={(ord) => setActiveCheckInOrder(ord)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Check-In Modal when clicking 'ເຄື່ອງຮອດລາວ' */}
      {activeCheckInOrder && (
        <CheckInModal
          order={activeCheckInOrder}
          onClose={() => setActiveCheckInOrder(null)}
          onSave={handleCheckInSave}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </main>
  );
}
