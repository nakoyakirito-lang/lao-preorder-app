'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ExchangeRate, ShopSettings } from '@/types/database';
import {
  getExchangeRates,
  saveExchangeRates,
  getShopSettings,
  saveShopSettings,
  DEFAULT_EXCHANGE_RATES,
  DEFAULT_SHOP_SETTINGS,
  SEED_ORDERS,
} from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase';
import { formatLAK } from '@/lib/calculations';
import {
  Sliders,
  ArrowLeft,
  Check,
  Calculator,
  Store,
  Database,
  RefreshCw,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [rates, setRates] = useState<ExchangeRate[]>(DEFAULT_EXCHANGE_RATES);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [cnyRate, setCnyRate] = useState<number>(3200);
  const [thbRate, setThbRate] = useState<number>(640);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Quick Calculator Tool State
  const [calcCurrency, setCalcCurrency] = useState<'CNY' | 'THB'>('CNY');
  const [calcInput, setCalcInput] = useState<number | ''>(100);

  useEffect(() => {
    Promise.all([getExchangeRates(), getShopSettings()]).then(([rData, sData]) => {
      setRates(rData);
      setSettings(sData);
      const c = rData.find((x) => x.currency === 'CNY')?.rate_to_lak || 3200;
      const t = rData.find((x) => x.currency === 'THB')?.rate_to_lak || 640;
      setCnyRate(c);
      setThbRate(t);
    });
  }, []);

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRates: ExchangeRate[] = [
      { currency: 'CNY', rate_to_lak: Number(cnyRate), updated_at: new Date().toISOString() },
      { currency: 'THB', rate_to_lak: Number(thbRate), updated_at: new Date().toISOString() },
    ];
    await saveExchangeRates(newRates);
    await saveShopSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (confirm('ທ່ານຕ້ອງການໂຫຼດຂໍ້ມູນຕົວຢ່າງທົດສອບໃໝ່ທັງໝົດແທ້ບໍ່?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const currentCalcRate = calcCurrency === 'CNY' ? cnyRate : thbRate;
  const calcResultLAK = (Number(calcInput) || 0) * (Number(currentCalcRate) || 0);

  return (
    <main className="min-h-screen bg-background text-slate-100 flex flex-col pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="w-8 h-8 rounded-lg bg-surface border border-slate-700 flex items-center justify-center text-slate-300 hover:text-neon"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <Sliders size={18} className="text-neon" />
              ຕັ້ງຄ່າລະບົບ & ເລດເງິນ
            </h1>
            <p className="text-[11px] text-slate-400">ຈັດການອັດຕາແລກປ່ຽນ & ໂປຣໄຟລ໌ຮ້ານ</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Exchange Rate Calculator Widget */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-surface to-slate-900 border border-neon/40 shadow-neon-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Calculator size={16} className="text-neon" />
              ເຄື່ອງຄິດໄລ່ເງິນດ່ວນ (Quick Converter)
            </h3>
            <span className="text-[10px] text-neon font-mono font-bold">
              1 {calcCurrency} = {currentCalcRate.toLocaleString()} LAK
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300">ສະກຸນເງິນ</label>
              <div className="grid grid-cols-2 gap-1 bg-background p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setCalcCurrency('CNY')}
                  className={`py-1 text-xs font-bold rounded-lg transition-all ${
                    calcCurrency === 'CNY' ? 'bg-red-500 text-white' : 'text-slate-400'
                  }`}
                >
                  🇨🇳 ຢວນ
                </button>
                <button
                  type="button"
                  onClick={() => setCalcCurrency('THB')}
                  className={`py-1 text-xs font-bold rounded-lg transition-all ${
                    calcCurrency === 'THB' ? 'bg-blue-500 text-white' : 'text-slate-400'
                  }`}
                >
                  🇹🇭 ບາດ
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300">
                ຈຳນວນເງິນ ({calcCurrency})
              </label>
              <input
                type="number"
                value={calcInput}
                onChange={(e) => setCalcInput(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-1.5 bg-background border border-slate-700 rounded-xl text-xs font-bold text-slate-100 focus:border-neon focus:outline-none"
              />
            </div>
          </div>

          <div className="p-2.5 bg-neon/10 rounded-xl border border-neon/30 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">ແປງເປັນເງິນກີບ:</span>
            <span className="text-base font-black text-neon neon-glow-text">
              {formatLAK(calcResultLAK)}
            </span>
          </div>
        </div>

        {/* Form: Exchange Rates */}
        <form onSubmit={handleSaveRates} className="space-y-4">
          <div className="p-4 bg-surface rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <DollarSign size={16} className="text-neon" />
              ອັດຕາແລກປ່ຽນປະຈຳວັນ (Default Rates)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  🇨🇳 1 ຢວນຈີນ (CNY) =
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={cnyRate}
                    onChange={(e) => setCnyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs font-bold text-neon focus:border-neon focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">
                    ກີບ
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  🇹🇭 1 ບາດໄທ (THB) =
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={thbRate}
                    onChange={(e) => setThbRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs font-bold text-neon focus:border-neon focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">
                    ກີບ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Profile & Thermal Slip Settings */}
          <div className="p-4 bg-surface rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Store size={16} className="text-neon" />
              ຂໍ້ມູນຮ້ານ & ຫົວໃບບິນ Thermal
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">ຊື່ຮ້ານ / ບໍລິສັດ</label>
              <input
                type="text"
                value={settings.shop_name}
                onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">ເບີໂທຕິດຕໍ່ / WhatsApp</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">ທີ່ຢູ່ສາງ / ສາຂາ</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">ຂໍ້ຄວາມທ້າຍໃບບິນ</label>
              <input
                type="text"
                value={settings.slip_footer}
                onChange={(e) => setSettings({ ...settings, slip_footer: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
              />
            </div>
          </div>

          {/* Database / Supabase Status */}
          <div className="p-4 bg-surface rounded-2xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Database size={16} className="text-neon" />
              ສະຖານະຖານຂໍ້ມູນ (Database Status)
            </h3>
            <div className="p-3 bg-background rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="text-xs font-semibold text-slate-200">
                  {isSupabaseConfigured ? 'Supabase Connected (Online)' : 'Local Storage Mode (Active)'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                {isSupabaseConfigured ? 'Cloud Sync' : 'Offline Ready'}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl neon-button text-xs font-black flex items-center justify-center gap-1.5"
          >
            {savedSuccess ? <Check size={16} /> : <Sliders size={16} />}
            {savedSuccess ? 'ບັນທຶກການຕັ້ງຄ່າສຳເລັດ!' : 'ບັນທຶກການຕັ້ງຄ່າ'}
          </button>
        </form>

        {/* Reset / Load Sample Data */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="w-full py-2.5 px-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-colors"
          >
            <RefreshCw size={14} />
            ຣີເຊັດ & ໂຫຼດຂໍ້ມູນຕົວຢ່າງທົດສອບໃໝ່
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
