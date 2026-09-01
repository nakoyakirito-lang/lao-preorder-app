'use client';

import React from 'react';
import { Package, Truck, CheckCircle2, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
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
      {/* Banner / Promotion Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-slate-900 to-black border border-slate-800 p-4 mb-3 shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-neon text-[11px] font-bold tracking-wide uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-neon animate-ping"></span>
              ຍອດເກັບເງິນປາຍທາງ (COD ທີ່ຕ້ອງເກັບ)
            </div>
            <div className="text-2xl font-black text-neon neon-glow-text tracking-tight">
              {formatLAK(totalBalanceDue)}
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
              <span>ລໍຖ້າຈັດສົ່ງ {arrivedLaosCount} ລາຍການ</span>
              {totalProfit > 0 && (
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <Sparkles size={12} />
                  ກຳໄລສະສົມ: +{formatLAK(totalProfit)}
                </span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon shadow-neon-sm">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* 3 Quick Metric Mini-Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface/80 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center mb-1">
            <Package size={15} />
          </div>
          <span className="text-xs text-slate-400 font-medium">ທັງໝົດ</span>
          <span className="text-base font-bold text-slate-100">{totalOrders}</span>
        </div>

        <div className="bg-surface/80 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center mb-1">
            <Truck size={15} />
          </div>
          <span className="text-xs text-slate-400 font-medium">ກຳລັງມາ</span>
          <span className="text-base font-bold text-amber-400">{inTransitCount}</span>
        </div>

        <div className="bg-surface/80 border border-neon/30 bg-neon/5 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-neon-sm">
          <div className="w-7 h-7 rounded-lg bg-neon/20 text-neon flex items-center justify-center mb-1">
            <CheckCircle2 size={15} />
          </div>
          <span className="text-xs text-slate-300 font-medium">ຮອດລາວແລ້ວ</span>
          <span className="text-base font-bold text-neon">{arrivedLaosCount}</span>
        </div>
      </div>
    </div>
  );
};
