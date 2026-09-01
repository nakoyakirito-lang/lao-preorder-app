'use client';

import React from 'react';
import Link from 'next/link';
import {
  PackagePlus,
  Warehouse,
  Printer,
  Boxes,
  Calculator,
  RotateCcw,
  Banknote,
  MapPin,
  MessageSquareShare,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const QuickActionGrid: React.FC = () => {
  const actions = [
    {
      title: 'ສັ່ງພຣີອໍເດີໃໝ່',
      subtitle: 'New Preorder',
      href: '/orders/new',
      icon: PackagePlus,
      color: '#00FF00',
      bgColor: 'bg-neon/10',
      borderColor: 'border-neon/40',
      textColor: 'text-neon',
      badge: 'ໃໝ່',
    },
    {
      title: 'ເຄື່ອງຮອດສາງລາວ',
      subtitle: 'Warehouse In',
      href: '/warehouse',
      icon: Warehouse,
      color: '#38bdf8',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/30',
      textColor: 'text-sky-400',
      badge: 'ປ້ອນຄ່າສົ່ງ',
    },
    {
      title: 'ພິມບິນ Thermal',
      subtitle: 'Batch Print',
      href: '/print',
      icon: Printer,
      color: '#a855f7',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      badge: '80/100mm',
    },
    {
      title: 'ຈັດການພັດສະດຸ',
      subtitle: 'All Parcels',
      href: '/parcels',
      icon: Boxes,
      color: '#f59e0b',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
    },
    {
      title: 'ສະຫຼຸບ COD / ຍອດເງິນ',
      subtitle: 'COD Summary',
      href: '/parcels?tab=arrived_laos',
      icon: Banknote,
      color: '#10b981',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
    },
    {
      title: 'ຄິດໄລ່ & ເລດເງິນ',
      subtitle: 'Rates & Calc',
      href: '/settings',
      icon: Calculator,
      color: '#00FF00',
      bgColor: 'bg-neon/10',
      borderColor: 'border-neon/30',
      textColor: 'text-neon',
    },
  ];

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
          <Sparkles size={15} className="text-neon" />
          ເມນູຫຼັກ / Quick Actions
        </h2>
        <span className="text-[11px] text-slate-400">ເລືອກລາຍການ</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              href={act.href}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl bg-surface border ${act.borderColor} hover:scale-105 active:scale-95 transition-all text-center group shadow-sm`}
            >
              {act.badge && (
                <span className="absolute -top-1.5 right-1.5 bg-neon text-black font-extrabold text-[9px] px-1.5 py-0.2 rounded-full shadow-neon-sm">
                  {act.badge}
                </span>
              )}
              <div
                className={`w-11 h-11 rounded-xl ${act.bgColor} ${act.textColor} flex items-center justify-center mb-1.5 border ${act.borderColor} group-hover:shadow-neon-sm transition-all`}
              >
                <Icon size={22} />
              </div>
              <span className="text-[12px] font-bold text-slate-100 leading-tight">
                {act.title}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {act.subtitle}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
