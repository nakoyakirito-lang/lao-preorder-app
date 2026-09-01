'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ThermalBill } from '@/components/print/ThermalBill';
import { Order, ShopSettings } from '@/types/database';
import { getOrders, getShopSettings, DEFAULT_SHOP_SETTINGS } from '@/lib/storage';
import { formatLAK } from '@/lib/calculations';
import { Printer, ArrowLeft, CheckSquare, Square, SlidersHorizontal, Check } from 'lucide-react';
import Link from 'next/link';

export default function PrintPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [paperWidth, setPaperWidth] = useState<'80mm' | '100mm'>('100mm');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrders(), getShopSettings()]).then(([ordData, settsData]) => {
      setOrders(ordData);
      setSettings(settsData);
      // Auto-select arrived or active orders
      const defaultSelected = ordData
        .filter((o) => o.status === 'arrived_laos' || o.status === 'ordered')
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

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const selectedOrdersToPrint = orders.filter((o) => selectedIds.includes(o.id));

  return (
    <main className="min-h-screen bg-background text-slate-100 flex flex-col pb-24">
      {/* Top Header (Hidden when printing) */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between no-print">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="w-8 h-8 rounded-lg bg-surface border border-slate-700 flex items-center justify-center text-slate-300 hover:text-neon"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <Printer size={18} className="text-neon" />
              ພິມບິນ Thermal (Batch Print)
            </h1>
            <p className="text-[11px] text-slate-400">ເລືອກຫຼາຍບິນ & ພິມພ້ອມກັນ</p>
          </div>
        </div>

        {/* Print Button in Header */}
        <button
          onClick={handlePrint}
          disabled={selectedIds.length === 0}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            selectedIds.length > 0
              ? 'neon-button'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Printer size={15} />
          ພິມ ({selectedIds.length})
        </button>
      </div>

      {/* Control Panel (No Print) */}
      <div className="p-4 space-y-3 no-print">
        {/* Paper Size & Filter Settings */}
        <div className="p-3 bg-surface rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-300 font-semibold">ຂະໜາດເຈ້ຍ:</span>
            <div className="flex bg-background rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setPaperWidth('100mm')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  paperWidth === '100mm'
                    ? 'bg-neon text-black shadow-neon-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                100mm (ສະຕິກເກີ)
              </button>
              <button
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  paperWidth === '80mm'
                    ? 'bg-neon text-black shadow-neon-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                80mm (ສະລິບ)
              </button>
            </div>
          </div>

          <button
            onClick={handleSelectAll}
            className="text-xs font-bold text-neon hover:underline flex items-center gap-1"
          >
            {selectedIds.length === filteredOrders.length ? (
              <CheckSquare size={15} />
            ) : (
              <Square size={15} />
            )}
            {selectedIds.length === filteredOrders.length ? 'ຍົກເລີກທັງໝົດ' : 'ເລືອກທັງໝົດ'}
          </button>
        </div>

        {/* Parcel Selector Checklist */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-300">
              ເລືອກລາຍການພັດສະດຸທີ່ຈະພິມ ({selectedIds.length}/{filteredOrders.length}):
            </span>
          </div>

          {filteredOrders.map((ord) => {
            const isSelected = selectedIds.includes(ord.id);
            return (
              <div
                key={ord.id}
                onClick={() => toggleSelect(ord.id)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-neon bg-neon/5'
                    : 'border-slate-800 bg-surface/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-neon bg-neon text-black'
                        : 'border-slate-700 bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check size={13} className="stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {ord.tracking_code}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({ord.route === 'CHINA_LAOS' ? '🇨🇳 ຈີນ' : '🇹🇭 ໄທ'})
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-semibold truncate">
                      {ord.customer_name} • {ord.product_name}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-black text-neon">
                    {formatLAK(ord.balance_due_lak)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {ord.delivery_provider}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Print Preview Section */}
        <div className="pt-4 border-t border-slate-800">
          <h2 className="text-xs font-bold text-slate-300 mb-2">
            👁️ ຕົວຢ່າງໃບບິນກ່ອນພິມ ({selectedOrdersToPrint.length} ໃບ):
          </h2>
        </div>
      </div>

      {/* Printable Area - Rendered cleanly on screen and on print */}
      <div id="printable-area" className="p-2 space-y-4">
        {selectedOrdersToPrint.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs no-print">
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
