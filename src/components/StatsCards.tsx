'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Truck, CheckCircle2, DollarSign, TrendingUp, Sparkles, ChevronRight, BarChart3 } from 'lucide-react';
import { Order } from '@/types/database';
import { formatLAK } from '@/lib/calculations';

interface StatsCardsProps {
  orders: Order[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ orders }) => {
  const totalOrders = orders.length;
  const inTransitCount = orders.filter((o) => o.status === 'in_transit' || o.status === 'ordered').length;
  const arrivedLaosCount = orders.filter((o) => o.status === 'arrived_laos').length;
  const totalBalanceDue = orders.reduce(
    (sum, o) => sum + (o.status !== 'completed' && o.status !== 'cancelled' ? o.balance_due_lak : 0),
    0
  );
  const totalProfit = orders.reduce((sum, o) => sum + (o.profit_lak || 0), 0);

  return (
    <div className="px-4 py-2">
      {/* Banner / Total COD Card */}
      <Link
        href="/reports"
        className="group block relative overflow-hidden rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 p-4 mb-3 shadow-sm transition-all"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold tracking-wide uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span>
              ຍອດເກັບເງິນປາຍທາງ (COD ທີ່ຕ້ອງເກັບ)
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatLAK(totalBalanceDue)}
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
              <span>ລໍຖ້າຈັດສົ່ງ {arrivedLaosCount} ລາຍການ</span>
              {totalProfit > 0 && (
                <span className="text-emerald-700 font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <Sparkles size={12} className="text-amber-500" />
                  ກຳໄລສະສົມ: +{formatLAK(totalProfit)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-all">
              <BarChart3 size={22} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
              ລາຍງານ <ChevronRight size={10} />
            </span>
          </div>
        </div>
      </Link>

      {/* 3 Quick Metric Mini-Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-1">
            <Package size={15} />
          </div>
          <span className="text-xs text-slate-500 font-medium">ທັງໝົດ</span>
          <span className="text-base font-black text-slate-900">{totalOrders}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
            <Truck size={15} />
          </div>
          <span className="text-xs text-slate-500 font-medium">ກຳລັງມາ</span>
          <span className="text-base font-black text-amber-600">{inTransitCount}</span>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-1">
            <CheckCircle2 size={15} />
          </div>
          <span className="text-xs text-slate-500 font-medium">ຮອດລາວແລ້ວ</span>
          <span className="text-base font-black text-slate-900">{arrivedLaosCount}</span>
        </div>
      </div>
    </div>
  );
};
