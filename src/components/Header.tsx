'use client';

import React, { useState } from 'react';
import { Search, Bell, ShieldCheck, Flame, Camera, ScanLine, BarChart3 } from 'lucide-react';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import Link from 'next/link';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}) => {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 pt-3 pb-3">
      {/* Top Profile & Shop Banner */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-900 flex items-center justify-center shadow-sm overflow-hidden">
            <span className="text-white font-black text-sm tracking-wider">LAO</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-base text-slate-900 leading-tight">
                LAO PREORDER
              </h1>
              <span className="bg-slate-900 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ຈີນ ➔ ລາວ 🇨🇳🇱🇦 | ໄທ ➔ ລາວ 🇹🇭🇱🇦
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/reports"
            className="h-9 px-2.5 rounded-xl bg-slate-100 border border-slate-300 flex items-center gap-1 text-slate-800 hover:text-black hover:border-slate-900 transition-colors text-xs font-bold"
            title="ແດຊບອດລາຍງານ & ສະຖິຕິ"
          >
            <BarChart3 size={16} />
            <span className="hidden sm:inline">ລາຍງານ</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="h-9 px-3 rounded-xl bg-slate-900 text-white flex items-center gap-1.5 text-xs font-bold hover:bg-black transition-all shadow-sm"
            title="ສະແກນບາໂຄ້ດ"
          >
            <Camera size={16} />
            <span>ສະແກນ</span>
          </button>

          <Link
            href="/settings"
            className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:border-slate-900 transition-colors"
            title="ຕັ້ງຄ່າ"
          >
            <ShieldCheck size={18} />
          </Link>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search size={17} className="text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit && onSearchSubmit()}
          placeholder="ປ້ອນເລກພັດສະດຸ, ເບີໂທ ຫຼື ຊື່ລູກຄ້າ..."
          className="w-full pl-10 pr-20 py-2.5 bg-slate-100 text-slate-900 placeholder-slate-400 rounded-xl text-xs sm:text-sm border border-slate-300 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all"
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="h-8 px-2 rounded-lg bg-white border border-slate-300 hover:border-slate-900 text-slate-700 flex items-center justify-center transition-all shadow-sm"
            title="ສະແກນກ້ອງ"
          >
            <Camera size={15} />
          </button>
        </div>
      </div>

      {showScanner && (
        <BarcodeScannerModal
          onScanSuccess={(code) => {
            onSearchChange(code);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </header>
  );
};
