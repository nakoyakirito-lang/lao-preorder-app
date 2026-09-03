'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ThermalBill } from '@/components/print/ThermalBill';
import { Order, ShopSettings } from '@/types/database';
import { getOrders, getShopSettings, DEFAULT_SHOP_SETTINGS } from '@/lib/storage';
import { formatLAK } from '@/lib/calculations';
import { useRouter } from 'next/navigation';
import { Printer, ArrowLeft, CheckSquare, Square, SlidersHorizontal, Check } from 'lucide-react';
import Link from 'next/link';

export default function PrintPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [paperWidth, setPaperWidth] = useState<'80mm' | '100mm'>('100mm');
  const [filterRoute, setFilterRoute] = useState<'ALL' | 'CHINA_LAOS' | 'THAI_LAOS'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('arrived_laos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrders(), getShopSettings()]).then(([ordData, settsData]) => {
      setOrders(ordData);
      setSettings(settsData);
      // Auto-select arrived orders by default
      const defaultSelected = ordData
        .filter((o) => o.status === 'arrived_laos')
        .map((o) => o.id);
      setSelectedIds(defaultSelected);
      setLoading(false);
    });
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (filterRoute !== 'ALL' && o.route !== filterRoute) return false;
    if (filterStatus !== 'ALL' && o.status !== filterStatus) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.tracking_code.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      o.product_name.toLowerCase().includes(q)
    );
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedOrdersToPrint = orders.filter((o) => selectedIds.includes(o.id));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-24">
      {/* Top Header (Hidden when printing) */}
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
              <Printer size={18} className="text-slate-900" />
              ພິມບິນ Thermal (Batch Print)
            </h1>
            <p className="text-[11px] text-slate-500">ເລືອກຫຼາຍບິນ & ພິມພ້ອມກັນ</p>
          </div>
        </div>

        {/* Print Button in Header */}
        <button
          onClick={handlePrint}
          disabled={selectedIds.length === 0}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
            selectedIds.length > 0
              ? 'bg-slate-900 text-white hover:bg-black'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Printer size={15} />
          ພິມ ({selectedIds.length})
        </button>
      </div>

      {/* Control Panel (No Print) */}
      <div className="p-4 space-y-3 no-print">
        {/* Search Bar */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ຄົ້ນຫາເລກພັດສະດຸ, ເບີໂທ, ຊື່ລູກຄ້າທີ່ຈະພິມ..."
          className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none shadow-sm"
        />

        {/* Status Filter Scrollbar */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700">
            🔍 ຟິວເຕີຕາມສະຖານະພັດສະດຸ (Status Filter):
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'ALL', label: 'ທັງໝົດ' },
              { id: 'arrived_laos', label: '🏢 ຮອດລາວແລ້ວ' },
              { id: 'ordered', label: '📦 ສັ່ງຊື້ແລ້ວ' },
              { id: 'in_transit', label: '🚚 ກຳລັງມາ' },
              { id: 'delivering', label: '🛵 ກຳລັງຈັດສົ່ງ' },
              { id: 'completed', label: '✅ ສຳເລັດ' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                  filterStatus === st.id
                    ? 'bg-slate-900 text-white font-extrabold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label} ({orders.filter((o) => st.id === 'ALL' || o.status === st.id).length})
              </button>
            ))}
          </div>
        </div>

        {/* Route Filter & Paper Size Controls */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-700 font-semibold">ຂະໜາດເຈ້ຍ:</span>
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-300">
                <button
                  onClick={() => setPaperWidth('100mm')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    paperWidth === '100mm'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  100mm (ສະຕິກເກີ)
                </button>
                <button
                  onClick={() => setPaperWidth('80mm')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    paperWidth === '80mm'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  80mm (ສະລິບ)
                </button>
              </div>
            </div>

            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
            >
              {selectedIds.length === filteredOrders.length && filteredOrders.length > 0 ? (
                <CheckSquare size={15} />
              ) : (
                <Square size={15} />
              )}
              {selectedIds.length === filteredOrders.length && filteredOrders.length > 0 ? 'ຍົກເລີກ' : 'ເລືອກທັງໝົດ'}
            </button>
          </div>
        </div>

        {/* Parcel Selector Checklist */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-700">
              ເລືອກລາຍການພັດສະດຸທີ່ຈະພິມ ({selectedIds.length}/{filteredOrders.length}):
            </span>
          </div>

          {filteredOrders.map((ord) => {
            const isSelected = selectedIds.includes(ord.id);
            return (
              <div
                key={ord.id}
                onClick={() => toggleSelect(ord.id)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all shadow-sm ${
                  isSelected
                    ? 'border-slate-900 ring-2 ring-slate-900 bg-white'
                    : 'border-slate-200 bg-white hover:border-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check size={13} className="stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {ord.tracking_code}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ({ord.route === 'CHINA_LAOS' ? '🇨🇳 ຈີນ' : '🇹🇭 ໄທ'})
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-semibold truncate">
                      {ord.customer_name} • {ord.product_name}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-black text-slate-900">
                    {formatLAK(ord.balance_due_lak)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {ord.delivery_provider}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional Live Print Preview Toggle */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            ໃບບິນທີ່ເລືອກ ({selectedOrdersToPrint.length} ໃບ)
          </span>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs font-bold text-slate-900 hover:underline py-1 px-2.5 rounded-lg bg-white border border-slate-300 flex items-center gap-1 transition-all shadow-sm"
          >
            {showPreview ? '🙈 ເຊື່ອງຕົວຢ່າງ' : '👁️ ເບິ່ງຕົວຢ່າງໃບບິນ'}
          </button>
        </div>
      </div>

      {/* Printable Area - Hidden on screen when collapsed, ALWAYS active on window.print() */}
      <div
        id="printable-area"
        className={`${showPreview ? 'block' : 'hidden'} print:block p-2 space-y-4`}
      >
        {selectedOrdersToPrint.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs no-print">
            ກະລຸນາຕິກເລືອກພັດສະດຸດ້ານເທິງເພື່ອພິມບິນ
          </div>
        ) : (
          selectedOrdersToPrint.map((ord) => (
            <ThermalBill
              key={ord.id}
              order={ord}
              settings={settings}
              paperWidth={paperWidth}
            />
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}
