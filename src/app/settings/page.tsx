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
  clearAllOrders,
  DEFAULT_EXCHANGE_RATES,
  DEFAULT_SHOP_SETTINGS,
  SEED_ORDERS,
} from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase';
import { formatLAK } from '@/lib/calculations';
import { useRouter } from 'next/navigation';
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
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
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

  const handleClearOrders = async () => {
    if (confirm('ທ່ານຕ້ອງການລຶບຂໍ້ມູນອໍເດີທັງໝົດແທ້ບໍ່? (ຂໍ້ມູນຈະຖືກລຶບອອກຈາກ Cloud Database & ເຄື່ອງນີ້)')) {
      await clearAllOrders();
      alert('ລຶບຂໍ້ມູນອໍເດີທັງໝົດຮຽບຮ້ອຍແລ້ວ!');
      window.location.href = '/parcels';
    }
  };

  const currentCalcRate = calcCurrency === 'CNY' ? cnyRate : thbRate;
  const calcResultLAK = (Number(calcInput) || 0) * (Number(currentCalcRate) || 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
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
              <Sliders size={18} className="text-slate-900" />
              ຕັ້ງຄ່າລະບົບ & ເລດເງິນ
            </h1>
            <p className="text-[11px] text-slate-500">ຈັດການອັດຕາແລກປ່ຽນ & ໂປຣໄຟລ໌ຮ້ານ</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Exchange Rate Calculator Widget */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Calculator size={16} className="text-slate-900" />
              ເຄື່ອງຄິດໄລ່ເງິນດ່ວນ (Quick Converter)
            </h3>
            <span className="text-[10px] text-slate-600 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md">
              1 {calcCurrency} = {currentCalcRate.toLocaleString()} LAK
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-700">ສະກຸນເງິນ</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300">
                <button
                  type="button"
                  onClick={() => setCalcCurrency('CNY')}
                  className={`py-1 text-xs font-bold rounded-lg transition-all ${
                    calcCurrency === 'CNY' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600'
                  }`}
                >
                  🇨🇳 ຢວນ
                </button>
                <button
                  type="button"
                  onClick={() => setCalcCurrency('THB')}
                  className={`py-1 text-xs font-bold rounded-lg transition-all ${
                    calcCurrency === 'THB' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
                  }`}
                >
                  🇹🇭 ບາດ
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-700">
                ຈຳນວນເງິນ ({calcCurrency})
              </label>
              <input
                type="number"
                value={calcInput}
                onChange={(e) => setCalcInput(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">ແປງເປັນເງິນກີບ:</span>
            <span className="text-base font-black text-slate-900">
              {formatLAK(calcResultLAK)}
            </span>
          </div>
        </div>

        {/* Form: Exchange Rates */}
        <form onSubmit={handleSaveRates} className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <DollarSign size={16} className="text-slate-900" />
              ອັດຕາແລກປ່ຽນປະຈຳວັນ (Default Rates)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  🇨🇳 1 ຢວນຈີນ (CNY) =
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={cnyRate}
                    onChange={(e) => setCnyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">
                    ກີບ
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  🇹🇭 1 ບາດໄທ (THB) =
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={thbRate}
                    onChange={(e) => setThbRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">
                    ກີບ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Profile & Thermal Slip Settings */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Store size={16} className="text-slate-900" />
              ຂໍ້ມູນຮ້ານ & ຫົວໃບບິນ Thermal
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">ຊື່ຮ້ານ / ບໍລິສັດ</label>
              <input
                type="text"
                value={settings.shop_name}
                onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">ເບີໂທຕິດຕໍ່ / WhatsApp</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">ທີ່ຢູ່ສາງ / ສາຂາ</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">ຂໍ້ຄວາມທ້າຍໃບບິນ</label>
              <input
                type="text"
                value={settings.slip_footer}
                onChange={(e) => setSettings({ ...settings, slip_footer: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Database / Supabase Status */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Database size={16} className="text-slate-900" />
              ສະຖານະຖານຂໍ້ມູນ (Database Status)
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="text-xs font-semibold text-slate-900">
                  {isSupabaseConfigured ? 'Supabase Connected (Online)' : 'Local Storage Mode (Active)'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                {isSupabaseConfigured ? 'Cloud Sync' : 'Offline Ready'}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            {savedSuccess ? <Check size={16} /> : <Sliders size={16} />}
            {savedSuccess ? 'ບັນທຶກການຕັ້ງຄ່າສຳເລັດ!' : 'ບັນທຶກການຕັ້ງຄ່າ'}
          </button>
        </form>

        {/* Clear All Orders */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleClearOrders}
            className="w-full py-2.5 px-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 hover:border-red-400 transition-colors shadow-sm"
          >
            <Trash2 size={14} />
            ລຶບຂໍ້ມູນອໍເດີທັງໝົດ (ເລີ່ມຕົ້ນລະບົບໃໝ່)
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
