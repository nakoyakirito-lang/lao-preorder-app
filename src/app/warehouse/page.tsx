'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ParcelCard } from '@/components/parcels/ParcelCard';
import { CheckInModal } from '@/components/warehouse/CheckInModal';
import { Order } from '@/types/database';
import { getOrders, saveOrder } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { BarcodeScannerModal } from '@/components/BarcodeScannerModal';
import { Warehouse, Search, CheckCircle2, ArrowLeft, Plus, Camera, ScanLine } from 'lucide-react';
import Link from 'next/link';

export default function WarehousePage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'pending_shipping' | 'arrived'>('pending_shipping');
  const [activeCheckInOrder, setActiveCheckInOrder] = useState<Order | null>(null);
  const [showScanner, setShowScanner] = useState(false);
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

  const handleScanSuccess = (scannedText: string) => {
    setSearchQuery(scannedText);
    // Auto-match order
    const match = orders.find(
      (o) =>
        o.tracking_code.toLowerCase() === scannedText.toLowerCase() ||
        (o.foreign_tracking_no && o.foreign_tracking_no.toLowerCase() === scannedText.toLowerCase())
    );
    if (match) {
      setActiveCheckInOrder(match);
    }
  };

  const pendingShippingOrders = orders.filter(
    (o) => o.status === 'ordered' || o.status === 'in_transit'
  );
  const arrivedOrders = orders.filter((o) => o.status === 'arrived_laos');

  const displayedOrders = (
    filterTab === 'pending_shipping' ? pendingShippingOrders : arrivedOrders
  ).filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.tracking_code.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      (o.foreign_tracking_no && o.foreign_tracking_no.toLowerCase().includes(q))
    );
  });

  return (
    <main className="min-h-screen bg-background text-slate-100 flex flex-col pb-24">
      {/* Top Bar */}
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
              <Warehouse size={18} className="text-neon" />
              ເຊັກອິນເຄື່ອງຮອດສາງລາວ
            </h1>
            <p className="text-[11px] text-slate-400">
              ປ້ອນຄ່າຂົນສົ່ງມາລາວ (ກີບ LAK) & ອອກບິນ
            </p>
          </div>
        </div>

        {/* Top Scan Shortcut Button */}
        <button
          onClick={() => setShowScanner(true)}
          className="py-1.5 px-3 rounded-xl bg-neon/15 border border-neon/40 text-neon text-xs font-bold flex items-center gap-1.5 hover:bg-neon hover:text-black shadow-neon-sm transition-all"
        >
          <Camera size={15} />
          <span>ສະແກນ</span>
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Search Bar with Camera Scanner Icon */}
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ສະແກນ ຫຼື ຄົ້ນຫາເລກແທຣັກກິ້ງ / ຊື່ລູກຄ້າ..."
            className="w-full pl-10 pr-20 py-2.5 bg-surface border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="w-6 h-6 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center"
              >
                ✕
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="h-8 px-2.5 rounded-lg bg-neon text-black font-extrabold text-xs flex items-center gap-1 shadow-neon-sm hover:scale-105 active:scale-95 transition-all"
              title="ເປີດກ້ອງສະແກນບາໂຄ້ດ"
            >
              <Camera size={14} />
              <ScanLine size={14} />
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="grid grid-cols-2 p-1 bg-surface rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterTab('pending_shipping')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              filterTab === 'pending_shipping'
                ? 'bg-neon text-black shadow-neon-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⏳ ລໍຖ້າປ້ອນຄ່າສົ່ງ</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-extrabold">
              {pendingShippingOrders.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('arrived')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              filterTab === 'arrived'
                ? 'bg-neon text-black shadow-neon-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>✅ ຮອດລາວແລ້ວ</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-extrabold">
              {arrivedOrders.length}
            </span>
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">ກຳລັງໂຫຼດ...</div>
        ) : displayedOrders.length === 0 ? (
          <div className="py-12 bg-surface/50 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs px-4">
            <CheckCircle2 size={32} className="mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">ບໍ່ມີພັດສະດຸໃນໝວດນີ້</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedOrders.map((order) => (
              <ParcelCard
                key={order.id}
                order={order}
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

      {showScanner && (
        <BarcodeScannerModal
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      <BottomNav />
    </main>
  );
}
