'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, PlusCircle, Printer, Sliders } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'ໜ້າຫຼັກ', href: '/', icon: Home },
    { label: 'ພັດສະດຸ', href: '/parcels', icon: Package },
    { label: 'ສັ່ງໃໝ່', href: '/orders/new', icon: PlusCircle, isMainAction: true },
    { label: 'ພິມບິນ', href: '/print', icon: Printer },
    { label: 'ຕັ້ງຄ່າ', href: '/settings', icon: Sliders },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center no-print">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-lg border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isMainAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-6 group"
              >
                <div className="w-13 h-13 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg border-4 border-slate-100 group-hover:scale-110 active:scale-95 transition-all">
                  <Icon size={28} className="stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-slate-900 mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
