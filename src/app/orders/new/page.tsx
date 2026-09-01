'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RouteType, OriginCurrency, Order, DELIVERY_PROVIDERS, ServiceType } from '@/types/database';
import {
  calculateProductCostLAK,
  calculateBalanceDueLAK,
  generateTrackingCode,
  formatLAK,
  formatForeignCurrency,
} from '@/lib/calculations';
import { getExchangeRates, saveOrder, DEFAULT_EXCHANGE_RATES } from '@/lib/storage';
import { generateCustomerMessage } from '@/lib/messageGenerator';
import { ImageUpload } from '@/components/ImageUpload';
import {
  ArrowLeft,
  PackagePlus,
  Sparkles,
  Check,
  Copy,
  Share2,
  DollarSign,
  User,
  MapPin,
  Tag,
  TrendingUp,
  Boxes,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as ServiceType) || 'BUY_FOR_YOU';

  const [serviceType, setServiceType] = useState<ServiceType>(initialType);
  const [route, setRoute] = useState<RouteType>('CHINA_LAOS');
  const [rates, setRates] = useState(DEFAULT_EXCHANGE_RATES);

  // Sync URL query if changed
  useEffect(() => {
    const typeParam = searchParams.get('type') as ServiceType;
    if (typeParam && (typeParam === 'BUY_FOR_YOU' || typeParam === 'PREORDER')) {
      setServiceType(typeParam);
    }
  }, [searchParams]);

  // Common Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerSocialUrl, setCustomerSocialUrl] = useState('');
  const [customerSocialImage, setCustomerSocialImage] = useState('');
  const [deliveryProvider, setDeliveryProvider] = useState('RungAroun');
  const [deliveryBranch, setDeliveryBranch] = useState('');
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [foreignTrackingNo, setForeignTrackingNo] = useState('');
  const [depositLAK, setDepositLAK] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Mode 1 (Buy-For-You / ຮັບສັ່ງ) Specific Fields:
  const [originCost, setOriginCost] = useState<number | ''>('');
  const [customRate, setCustomRate] = useState<number | ''>('');

  // Mode 2 (Preorder Retail / ພຣີອໍເດີ) Specific Fields:
  const [sellingPriceLAK, setSellingPriceLAK] = useState<number | ''>('');
  const [internalCostLAK, setInternalCostLAK] = useState<number | ''>('');

  // Post-Save Modal
  const [savedOrder, setSavedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getExchangeRates().then((data) => {
      setRates(data);
      const defaultCurrency: OriginCurrency = route === 'CHINA_LAOS' ? 'CNY' : 'THB';
      const r =
        data.find((x) => x.currency === defaultCurrency)?.rate_to_lak ||
        (route === 'CHINA_LAOS' ? 3200 : 640);
      setCustomRate(r);
    });
  }, [route]);

  const originCurrency: OriginCurrency = route === 'CHINA_LAOS' ? 'CNY' : 'THB';
  const effectiveRate = Number(customRate) || (route === 'CHINA_LAOS' ? 3200 : 640);
  const currentDepositLAK = Number(depositLAK) || 0;
  const isProxy = serviceType === 'BUY_FOR_YOU';

  // Mode 1 Product Cost (from ¥/฿ * Rate)
  const proxyProductCostLAK = calculateProductCostLAK(Number(originCost) || 0, effectiveRate);
  const proxyInitialBalanceDueLAK = calculateBalanceDueLAK(proxyProductCostLAK, currentDepositLAK);

  // Mode 2 Calculations (Direct Selling Price in LAK)
  const retailSellingPriceLAK = Number(sellingPriceLAK) || 0;
  const retailInitialBalanceDueLAK = calculateBalanceDueLAK(retailSellingPriceLAK, currentDepositLAK);
  const retailProfitLAK =
    Number(sellingPriceLAK) > 0 && Number(internalCostLAK) > 0
      ? Math.max(0, Number(sellingPriceLAK) - Number(internalCostLAK))
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isProxy) {
      if (!customerName || !customerPhone || !productName || !originCost) {
        alert('ກະລຸນາປ້ອນຂໍ້ມູນສຳຄັນ: ຊື່ລູກຄ້າ, ເບີໂທ, ຊື່ສິນຄ້າ, ລາຄາຕົ້ນທາງ (¥/฿)');
        return;
      }
    } else {
      if (!customerName || !customerPhone || !productName || !sellingPriceLAK) {
        alert('ກະລຸນາປ້ອນຂໍ້ມູນສຳຄັນ: ຊື່ລູກຄ້າ, ເບີໂທ, ຊື່ສິນຄ້າ, ລາຄາຂາຍ (LAK)');
        return;
      }
    }

    setSubmitting(true);
    const trackingCode = generateTrackingCode(route);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      tracking_code: trackingCode,
      service_type: serviceType,
      route,
      foreign_tracking_no: foreignTrackingNo,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_social_url: customerSocialUrl,
      customer_social_image: customerSocialImage,
      delivery_provider: deliveryProvider,
      delivery_branch: deliveryBranch,
      product_name: productName,
      product_url: productUrl,
      product_image_url: productImageUrl,
      order_date: new Date().toISOString().split('T')[0],
      origin_currency: originCurrency,
      origin_cost: isProxy ? Number(originCost) : 0,
      exchange_rate: isProxy ? effectiveRate : 0,
      product_cost_lak: isProxy ? proxyProductCostLAK : (Number(internalCostLAK) || 0),
      selling_price_lak: !isProxy ? retailSellingPriceLAK : undefined,
      shipping_cost_lak: 0,
      actual_shipping_cost_lak: 0,
      service_fee_lak: 0,
      total_cost_lak: isProxy ? proxyProductCostLAK : retailSellingPriceLAK,
      deposit_lak: currentDepositLAK,
      balance_due_lak: isProxy ? proxyInitialBalanceDueLAK : retailInitialBalanceDueLAK,
      profit_lak: isProxy ? 0 : retailProfitLAK,
      status: 'ordered',
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await saveOrder(newOrder);
    setSubmitting(false);
    setSavedOrder(newOrder);
  };

  const handleCopyMessage = () => {
    if (!savedOrder) return;
    const text = generateCustomerMessage(savedOrder, 'order_created');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <main className="min-h-screen bg-background text-slate-100 flex flex-col pb-24">
      {/* Top Header with Navigation & Mode Tabs */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 rounded-lg bg-surface border border-slate-700 flex items-center justify-center text-slate-300 hover:text-neon hover:border-neon transition-colors"
            title="ຍ້ອນກັບ"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              {isProxy ? (
                <>
                  <PackagePlus size={18} className="text-neon" />
                  ຮັບສັ່ງເຄື່ອງ (Buy-For-You)
                </>
              ) : (
                <>
                  <Tag size={18} className="text-amber-400" />
                  ພຣີອໍເດີມາຂາຍ (Retail)
                </>
              )}
            </h1>
            <p className="text-[11px] text-slate-400">
              {isProxy
                ? 'ລູກຄ້າຈ່າຍຄ່າເຄື່ອງ • ບວກກຳໄລຄ່າສົ່ງມາລາວ'
                : 'ຮ້ານລົງທຶນເອງ • ຕັ້ງລາຄາຂາຍ + ເກັບມັດຈຳ'}
            </p>
          </div>
        </div>

        {/* Top Mode Switcher */}
        <div className="flex bg-surface rounded-xl p-0.5 border border-slate-700">
          <button
            type="button"
            onClick={() => setServiceType('BUY_FOR_YOU')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              isProxy
                ? 'bg-neon text-black shadow-neon-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📦 ຮັບສັ່ງ
          </button>
          <button
            type="button"
            onClick={() => setServiceType('PREORDER')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              !isProxy
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏷️ ພຣີອໍເດີ
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* ========================================================= */}
        {/* FORM 1: 📦 ຮັບສັ່ງເຄື່ອງ (BUY-FOR-YOU / PROXY ORDERING) */}
        {/* ========================================================= */}
        {isProxy ? (
          <>
            {/* Route Selector (China vs Thailand) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">
                🛣️ ເລືອກສາຍທາງຂົນສົ່ງ (Route)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRoute('CHINA_LAOS')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    route === 'CHINA_LAOS'
                      ? 'border-neon bg-neon/10 ring-1 ring-neon text-slate-100 shadow-neon-sm'
                      : 'border-slate-800 bg-surface/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">🇨🇳</span>
                  <div>
                    <div className="text-xs font-bold text-slate-100">ຈີນ ➔ ລາວ</div>
                    <div className="text-[10px] text-slate-400">ສະກຸນເງິນ: ຢວນ (CNY ¥)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRoute('THAI_LAOS')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    route === 'THAI_LAOS'
                      ? 'border-neon bg-neon/10 ring-1 ring-neon text-slate-100 shadow-neon-sm'
                      : 'border-slate-800 bg-surface/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">🇹🇭</span>
                  <div>
                    <div className="text-xs font-bold text-slate-100">ໄທ ➔ ລາວ</div>
                    <div className="text-[10px] text-slate-400">ສະກຸນເງິນ: ບາດ (THB ฿)</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Product Info & Foreign Cost */}
            <div className="p-3.5 bg-surface rounded-2xl border border-slate-800 space-y-3">
              <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Tag size={15} className="text-neon" />
                ລາຍລະອຽດສິນຄ້າ & ລາຄາຕົ້ນທາງ (¥ / ฿)
              </h2>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  ຊື່ສິນຄ້າ / ຕົວເລືອກທີ່ສັ່ງ *
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="ເຊັ່ນ: ເສື້ອແຂນຍາວ ສີຄຣີມ ໄຊສ໌ L"
                  className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-neon focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>🔗 ລິ້ງສັ່ງສິນຄ້າ (Taobao / 1688 / Shopee / TikTok)</span>
                </label>
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://item.taobao.com/... ຫຼື https://shopee.co.th/..."
                  className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-neon focus:outline-none"
                />
              </div>

              {/* Foreign Price & Exchange Rate */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">
                    ລາຄາຕົ້ນທາງ ({originCurrency === 'CNY' ? 'ຢວນ ¥' : 'ບາດ ฿'}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={originCost}
                    onChange={(e) =>
                      setOriginCost(e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder={originCurrency === 'CNY' ? 'ເຊັ່ນ: 199' : 'ເຊັ່ນ: 650'}
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs font-bold text-neon focus:border-neon focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    ເລດເງິນຮ້ານ (1 {originCurrency} = ກີບ)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customRate}
                    onChange={(e) =>
                      setCustomRate(e.target.value ? Number(e.target.value) : '')
                    }
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs font-bold text-slate-100 focus:border-neon focus:outline-none"
                  />
                </div>
              </div>

              {/* Auto Calculated Product Cost Badge */}
              <div className="p-2.5 bg-background rounded-xl border border-slate-700 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  💵 ຄ່າສິນຄ້າເກັບລູກຄ້າ:
                </span>
                <span className="text-sm font-black text-neon">
                  {formatLAK(proxyProductCostLAK)}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  ເລກແທຣັກກິ້ງຕົ້ນທາງ (ຈີນ/ໄທ ຖ້າມີ)
                </label>
                <input
                  type="text"
                  value={foreignTrackingNo}
                  onChange={(e) => setForeignTrackingNo(e.target.value)}
                  placeholder="ເຊັ່ນ: SF192837492CN ຫຼື TH019283TH"
                  className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-neon focus:outline-none"
                />
              </div>

              <ImageUpload
                label="📸 ຮູບພາບສິນຄ້າ (Product Photo)"
                sublabel="ອັບໂຫຼດຮູບສິນຄ້າ"
                value={productImageUrl}
                onChange={setProductImageUrl}
              />
            </div>

            {/* Customer & Delivery */}
            <div className="p-3.5 bg-surface rounded-2xl border border-slate-800 space-y-3">
              <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <User size={15} className="text-neon" />
                ຂໍ້ມູນລູກຄ້າ & ຂົນສົ່ງປາຍທາງ
              </h2>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">ຊື່ລູກຄ້າ *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ຊື່ລູກຄ້າ..."
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    ເບີໂທ / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="020 5xxxxxxx"
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    ຂົນສົ່ງໃນລາວ
                  </label>
                  <select
                    value={deliveryProvider}
                    onChange={(e) => setDeliveryProvider(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                  >
                    {DELIVERY_PROVIDERS.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.nameLao}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    ສາຂາ / ບ້ານ / ແຂວງ *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryBranch}
                    onChange={(e) => setDeliveryBranch(e.target.value)}
                    placeholder="ເຊັ່ນ: ສາຂາດົງໂດກ / ປາກເຊ"
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                  />
                </div>
              </div>

              <ImageUpload
                label="👤 ຮູບໜ້າ Facebook / WhatsApp ລູກຄ້າ"
                sublabel="ແຄັບໜ້າຈໍແຊັດ/ໂປຣໄຟລ໌ເພື່ອບໍ່ໃຫ້ຫຼົງ"
                value={customerSocialImage}
                onChange={setCustomerSocialImage}
                aspectRatio="wide"
              />
            </div>

            {/* Deposit & Financial Summary */}
            <div className="p-3.5 bg-surface rounded-2xl border border-slate-800 space-y-3">
              <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <DollarSign size={15} className="text-neon" />
                ເງິນມັດຈຳ & ສະຫຼຸບຍອດ
              </h2>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  ເງິນມັດຈຳ / ໂອນຄ່າເຄື່ອງແລ້ວ (ກີບ LAK)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={depositLAK}
                  onChange={(e) =>
                    setDepositLAK(e.target.value ? Number(e.target.value) : '')
                  }
                  placeholder="ເຊັ່ນ: 500000 (ຫຼື 0)"
                  className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs font-bold text-slate-100 focus:border-neon focus:outline-none"
                />
              </div>

              <div className="p-3 bg-neon/5 rounded-xl border border-neon/30 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>💵 ຄ່າສິນຄ້າເກັບລູກຄ້າ:</span>
                  <span className="font-bold text-slate-100">
                    {formatLAK(proxyProductCostLAK)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>🚚 ຄ່າຂົນສົ່ງມາລາວ:</span>
                  <span className="text-slate-400">ປ້ອນເມື່ອຮອດສາງ (ບວກກຳໄລໄດ້)</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>💳 ມັດຈຳແລ້ວ:</span>
                  <span className="font-semibold text-emerald-400">
                    -{formatLAK(currentDepositLAK)}
                  </span>
                </div>
                <div className="pt-2 border-t border-neon/20 flex justify-between items-center">
                  <span className="text-xs font-bold text-neon">ຍອດຄ້າງຊຳລະເບື້ອງຕົ້ນ:</span>
                  <span className="text-base font-black text-neon neon-glow-text">
                    {formatLAK(proxyInitialBalanceDueLAK)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl neon-button text-sm font-black flex items-center justify-center gap-2"
            >
              <Check size={18} />
              {submitting ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກອໍເດີຮັບສັ່ງເຄື່ອງ 📦'}
            </button>
          </>
        ) : (
          /* ========================================================= */
          /* FORM 2: 🏷️ ພຣີອໍເດີມາຂາຍເອງ (PREORDER RETAIL) */
          /* ========================================================= */
          <>
            {/* Product & Direct Selling Price in LAK */}
            <div className="p-3.5 bg-surface rounded-2xl border border-amber-500/30 space-y-3">
              <h2 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Tag size={15} className="text-amber-400" />
                ລາຍການສິນຄ້າ & ລາຄາຂາຍໃຫ້ລູກຄ້າ (LAK)
              </h2>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">
                  ຊື່ສິນຄ້າທີ່ຂາຍ *
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="ເຊັ່ນ: ເສື້ອກັນໜາວ Cardigan ໄໝພົມເກົາຫຼີ (3 ໂຕ)"
                  className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Direct Selling Price Input (LAK) */}
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/40 space-y-1.5">
                <label className="text-xs font-black text-amber-400 flex items-center justify-between">
                  <span>🔥 ລາຄາຂາຍໃຫ້ລູກຄ້າ (LAK) *</span>
                  <span className="text-[10px] text-amber-300 font-normal">
                    ລາຄາທີ່ແຈ້ງລູກຄ້າ
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={sellingPriceLAK}
                    onChange={(e) =>
                      setSellingPriceLAK(e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="ເຊັ່ນ: 180000"
                    className="w-full px-3.5 py-2.5 bg-background border border-amber-400 rounded-xl text-base font-black text-amber-400 focus:outline-none"
                    autoFocus
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ກີບ (LAK)
                  </span>
                </div>
              </div>

              {/* Customer Deposit Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>💳 ເງິນມັດຈຳທີ່ລູກຄ້າຈ່າຍແລ້ວ (LAK)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={depositLAK}
                    onChange={(e) =>
                      setDepositLAK(e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="ເຊັ່ນ: 50000 (ຫຼື 0)"
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 focus:border-neon focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ກີບ
                  </span>
                </div>
              </div>

              {/* Retail COD Balance Preview */}
              <div className="p-3 bg-neon/5 rounded-xl border border-neon/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    ຍອດ COD ທີ່ເຫຼືອເກັບລູກຄ້າ
                  </span>
                  <span className="text-base font-black text-neon neon-glow-text">
                    {formatLAK(retailInitialBalanceDueLAK)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  (ຄ່າສົ່ງຈະບວກເພີ່ມຕອນຮອດລາວ)
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">
                  🔗 ລິ້ງສິນຄ້າ (Taobao/Shopee ຖ້າມີ)
                </label>
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-neon focus:outline-none"
                />
              </div>

              <ImageUpload
                label="📸 ຮູບພາບສິນຄ້າ"
                sublabel="ອັບໂຫຼດຮູບສິນຄ້າ"
                value={productImageUrl}
                onChange={setProductImageUrl}
              />
            </div>

            {/* Customer & Destination Delivery */}
            <div className="p-3.5 bg-surface rounded-2xl border border-slate-800 space-y-3">
              <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <User size={15} className="text-amber-400" />
                ຂໍ້ມູນລູກຄ້າ & ຂົນສົ່ງປາຍທາງ
              </h2>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">ຊື່ລູກຄ້າ *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ຊື່ລູກຄ້າ..."
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    ເບີໂທ / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="020 5xxxxxxx"
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    ຂົນສົ່ງໃນລາວ
                  </label>
                  <select
                    value={deliveryProvider}
                    onChange={(e) => setDeliveryProvider(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                  >
                    {DELIVERY_PROVIDERS.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.nameLao}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    ສາຂາ / ບ້ານ / ແຂວງ *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryBranch}
                    onChange={(e) => setDeliveryBranch(e.target.value)}
                    placeholder="ເຊັ່ນ: ສາຂາດົງໂດກ / ປາກເຊ"
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                  />
                </div>
              </div>

              <ImageUpload
                label="👤 ຮູບໜ້າ Facebook / WhatsApp ລູກຄ້າ"
                sublabel="ແຄັບໜ້າຈໍແຊັດປິດການຂາຍ"
                value={customerSocialImage}
                onChange={setCustomerSocialImage}
                aspectRatio="wide"
              />
            </div>

            {/* Internal Shop Cost (Optional for Profit Calculation) */}
            <div className="p-3.5 bg-surface rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <TrendingUp size={14} className="text-emerald-400" />
                  ຕົ້ນທຶນພາຍໃນຮ້ານ (ບັນທຶກໄວ້ເບິ່ງກຳໄລ)
                </span>
                <span className="text-[10px] text-slate-500">ບໍ່ບັງຄັບ</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">
                    ຕົ້ນທຶນສິນຄ້າ (ກີບ LAK)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={internalCostLAK}
                    onChange={(e) =>
                      setInternalCostLAK(e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="ເຊັ່ນ: 110000"
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">
                    ເລກແທຣັກຕົ້ນທາງ (ຈີນ/ໄທ)
                  </label>
                  <input
                    type="text"
                    value={foreignTrackingNo}
                    onChange={(e) => setForeignTrackingNo(e.target.value)}
                    placeholder="SF... / TH..."
                    className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                  />
                </div>
              </div>

              {retailProfitLAK > 0 && (
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold">✨ ກຳໄລສິນຄ້າຂັ້ນຕົ້ນ:</span>
                  <span className="text-emerald-400 font-extrabold">
                    +{formatLAK(retailProfitLAK)}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black text-sm font-black flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Check size={18} />
              {submitting ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກອໍເດີພຣີອໍເດີມາຂາຍ 🏷️'}
            </button>
          </>
        )}
      </form>

      {/* Post-Save Success & Message Copy Modal */}
      {savedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-slate-700 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-neon/20 text-neon mx-auto flex items-center justify-center shadow-neon-sm mb-2">
                <Check size={28} className="stroke-[3]" />
              </div>
              <h3 className="text-base font-bold text-slate-100">ບັນທຶກອໍເດີສຳເລັດແລ້ວ!</h3>
              <p className="text-xs text-slate-400">
                ເລກຕິດຕາມ:{' '}
                <span className="font-mono text-neon font-bold">
                  {savedOrder.tracking_code}
                </span>
              </p>
            </div>

            {/* Quick Preview Message Box */}
            <div className="p-3 bg-background rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
              {generateCustomerMessage(savedOrder, 'order_created')}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCopyMessage}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  copied
                    ? 'bg-neon/20 text-neon border border-neon'
                    : 'neon-button'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'ກັອບປີ້ແລ້ວ!' : 'ກັອບປີ້ຂໍ້ຄວາມສົ່ງໃຫ້ລູກຄ້າ (1-Click)'}
              </button>

              {savedOrder.customer_phone && (
                <a
                  href={`https://wa.me/${savedOrder.customer_phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 size={15} />
                  ສົ່ງຂໍ້ຄວາມຜ່ານ WhatsApp
                </a>
              )}

              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 text-center"
              >
                ກັບໄປໜ້າຫຼັກ Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-slate-400 text-xs">
          ກຳລັງໂຫຼດ...
        </div>
      }
    >
      <NewOrderForm />
    </Suspense>
  );
}
