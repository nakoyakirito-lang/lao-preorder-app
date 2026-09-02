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
      {/* Banner / Total COD Card */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 p-4 mb-3 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-bold tracking-wide uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              ຍອດເກັບເງິນປາຍທາງ (COD ທີ່ຕ້ອງເກັບ)
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {formatLAK(totalBalanceDue)}
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-neutral-400">
              <span>ລໍຖ້າຈັດສົ່ງ {arrivedLaosCount} ລາຍການ</span>
              {totalProfit > 0 && (
                <span className="text-white font-bold flex items-center gap-0.5 bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-700">
                  <Sparkles size={12} className="text-amber-400" />
                  ກຳໄລສະສົມ: +{formatLAK(totalProfit)}
                </span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black shadow-md">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* 3 Quick Metric Mini-Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
          <div className="w-7 h-7 rounded-lg bg-neutral-800 text-white flex items-center justify-center mb-1">
            <Package size={15} />
          </div>
          <span className="text-xs text-neutral-400 font-medium">ທັງໝົດ</span>
          <span className="text-base font-bold text-white">{totalOrders}</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
          <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center mb-1">
            <Truck size={15} />
          </div>
          <span className="text-xs text-neutral-400 font-medium">ກຳລັງມາ</span>
          <span className="text-base font-bold text-neutral-200">{inTransitCount}</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center mb-1">
            <CheckCircle2 size={15} />
          </div>
          <span className="text-xs text-neutral-300 font-medium">ຮອດລາວແລ້ວ</span>
          <span className="text-base font-bold text-white">{arrivedLaosCount}</span>
        </div>
      </div>
    </div>
  );
};
