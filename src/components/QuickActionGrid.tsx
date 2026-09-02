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
  Tag,
} from 'lucide-react';

export const QuickActionGrid: React.FC = () => {
  const actions = [
    {
      title: 'ຮັບສັ່ງເຄື່ອງ',
      subtitle: 'Buy-For-You',
      href: '/orders/new?type=BUY_FOR_YOU',
      icon: PackagePlus,
      badge: 'ຍອດນິຍົມ',
      isPrimary: true,
    },
    {
      title: 'ພຣີອໍເດີມາຂາຍ',
      subtitle: 'Retail Preorder',
      href: '/orders/new?type=PREORDER',
      icon: Tag,
      badge: 'ຕັ້ງລາຄາຂາຍ',
      isPrimary: false,
    },
    {
      title: 'ເຄື່ອງຮອດສາງລາວ',
      subtitle: 'Warehouse In',
      href: '/warehouse',
      icon: Warehouse,
      badge: 'ປ້ອນຄ່າສົ່ງ',
      isPrimary: false,
    },
    {
      title: 'ພິມບິນ Thermal',
      subtitle: 'Batch Print',
      href: '/print',
      icon: Printer,
      badge: '80/100mm',
      isPrimary: false,
    },
    {
      title: 'ຈັດການພັດສະດຸ',
      subtitle: 'All Parcels',
      href: '/parcels',
      icon: Boxes,
      isPrimary: false,
    },
    {
      title: 'ຄິດໄລ່ & ເລດເງິນ',
      subtitle: 'Rates & Calc',
      href: '/settings',
      icon: Calculator,
      isPrimary: false,
    },
  ];

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Sparkles size={15} className="text-white" />
          ເມນູຫຼັກ / Quick Actions
        </h2>
        <span className="text-[11px] text-neutral-400">ເລືອກລາຍການ</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              href={act.href}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl ${
                act.isPrimary
                  ? 'bg-neutral-900 border-2 border-white'
                  : 'bg-neutral-900 border border-neutral-800'
              } hover:border-neutral-500 hover:scale-[1.03] active:scale-95 transition-all text-center group shadow-sm`}
            >
              {act.badge && (
                <span
                  className={`absolute -top-1.5 right-1.5 ${
                    act.isPrimary ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                  } font-extrabold text-[9px] px-1.5 py-0.2 rounded-full shadow-sm`}
                >
                  {act.badge}
                </span>
              )}
              <div
                className={`w-11 h-11 rounded-xl ${
                  act.isPrimary ? 'bg-white text-black' : 'bg-neutral-800 text-white'
                } flex items-center justify-center mb-1.5 transition-all`}
              >
                <Icon size={22} />
              </div>
              <span className="text-[12px] font-bold text-white leading-tight">
                {act.title}
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5">
                {act.subtitle}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
