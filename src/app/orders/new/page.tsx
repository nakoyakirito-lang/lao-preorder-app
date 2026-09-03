'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  RouteType,
  OriginCurrency,
  Order,
  DELIVERY_PROVIDERS,
  LAO_PROVINCES,
  ServiceType,
} from '@/types/database';
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
  Truck,
  Building,
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
  const [deliveryProvince, setDeliveryProvince] = useState(LAO_PROVINCES[0]);
  const [deliveryBranch, setDeliveryBranch] = useState('');
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [foreignTrackingNo, setForeignTrackingNo] = useState('');
  const [shippingCostLAK, setShippingCostLAK] = useState<number | ''>('');
  const [actualShippingCostLAK, setActualShippingCostLAK] = useState<number | ''>('');
  const [depositLAK, setDepositLAK] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Mode 1 (Buy-For-You / ຮັບສັ່ງ) Specific Fields:
  const [proxyPriceMode, setProxyPriceMode] = useState<'LAK' | 'FOREIGN'>('LAK');
  const [directProxyCostLAK, setDirectProxyCostLAK] = useState<number | ''>('');
  const [originCost, setOriginCost] = useState<number | ''>('');
  const [customRate, setCustomRate] = useState<number | ''>('');

  // Mode 2 (Preorder Retail / ພຣີອໍເດີ) Specific Fields:
  const [sellingPriceLAK, setSellingPriceLAK] = useState<number | ''>('');
  const [internalCostLAK, setInternalCostLAK] = useState<number | ''>('');

  // Post-Save Modal
  const [savedOrder, setSavedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCopyMessage = () => {
    if (!savedOrder) return;
    const msg = generateCustomerMessage(savedOrder, 'order_created');
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
  const currentShippingLAK = Number(shippingCostLAK) || 0;
  const currentActualShippingLAK = Number(actualShippingCostLAK) || 0;
  const isProxy = serviceType === 'BUY_FOR_YOU';

  // Mode 1 Product Cost: directly in LAK or from (¥/฿ * Rate)
  const proxyProductCostLAK =
    proxyPriceMode === 'LAK'
      ? Number(directProxyCostLAK) || 0
      : calculateProductCostLAK(Number(originCost) || 0, effectiveRate);

  const proxyTotalCostLAK = proxyProductCostLAK + currentShippingLAK;
  const proxyInitialBalanceDueLAK = calculateBalanceDueLAK(proxyTotalCostLAK, currentDepositLAK);
  const proxyShippingProfitLAK =
    currentShippingLAK > currentActualShippingLAK && currentActualShippingLAK > 0
      ? currentShippingLAK - currentActualShippingLAK
      : 0;

  // Mode 2 Calculations (Direct Selling Price in LAK)
  const retailSellingPriceLAK = Number(sellingPriceLAK) || 0;
  const retailTotalCostLAK = retailSellingPriceLAK + currentShippingLAK;
  const retailInitialBalanceDueLAK = calculateBalanceDueLAK(retailTotalCostLAK, currentDepositLAK);
  const retailProductProfitLAK =
    Number(sellingPriceLAK) > 0 && Number(internalCostLAK) > 0
      ? Math.max(0, Number(sellingPriceLAK) - Number(internalCostLAK))
      : 0;
  const retailShippingProfitLAK =
    currentShippingLAK > currentActualShippingLAK && currentActualShippingLAK > 0
      ? currentShippingLAK - currentActualShippingLAK
      : 0;
  const retailProfitLAK = retailProductProfitLAK + retailShippingProfitLAK;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isProxy) {
      if (!customerName || !customerPhone || !productName || proxyProductCostLAK <= 0) {
        alert('ກະລຸນາປ້ອນຂໍ້ມູນສຳຄັນ: ຊື່ລູກຄ້າ, ເບີໂທ, ຊື່ສິນຄ້າ, ລາຄາສິນຄ້າ (ກີບ LAK)');
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

    const calculatedOriginCost =
      proxyPriceMode === 'FOREIGN'
        ? Number(originCost)
        : effectiveRate > 0
        ? Math.round(Number(directProxyCostLAK) / effectiveRate)
        : 0;

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
      delivery_province: deliveryProvince,
      delivery_branch: deliveryBranch,
      product_name: productName,
      product_url: productUrl,
      product_image_url: productImageUrl,
      order_date: new Date().toISOString().split('T')[0],
      origin_currency: originCurrency,
      origin_cost: isProxy ? calculatedOriginCost : 0,
      exchange_rate: isProxy ? effectiveRate : 0,
      product_cost_lak: isProxy ? proxyProductCostLAK : (Number(internalCostLAK) || 0),
      selling_price_lak: !isProxy ? retailSellingPriceLAK : undefined,
      shipping_cost_lak: currentShippingLAK,
      actual_shipping_cost_lak: currentActualShippingLAK,
      service_fee_lak: 0,
      total_cost_lak: isProxy ? proxyTotalCostLAK : retailTotalCostLAK,
      deposit_lak: currentDepositLAK,
      balance_due_lak: isProxy ? proxyInitialBalanceDueLAK : retailInitialBalanceDueLAK,
      profit_lak: isProxy ? proxyShippingProfitLAK : retailProfitLAK,
      status: 'ordered',
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await saveOrder(newOrder);
    setSubmitting(false);
    setSavedOrder(newOrder);
  };

   return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-24">
      {/* Top Header */}
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
              {isProxy ? (
                <>
                  <PackagePlus size={18} className="text-slate-900" />
                  ຮັບສັ່ງເຄື່ອງ (Buy-For-You)
                </>
              ) : (
                <>
                  <Tag size={18} className="text-amber-600" />
                  ພຣີອໍເດີມາຂາຍ (Retail)
                </>
              )}
            </h1>
            <p className="text-[11px] text-slate-500">
              {isProxy
                ? 'ລູກຄ້າຈ່າຍຄ່າເຄື່ອງ • ບວກກຳໄລຄ່າສົ່ງມາລາວ'
                : 'ຮ້ານລົງທຶນເອງ • ຕັ້ງລາຄາຂາຍ + ເກັບມັດຈຳ'}
            </p>
          </div>
        </div>

        {/* Top Mode Switcher */}
        <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-300">
          <button
            type="button"
            onClick={() => setServiceType('BUY_FOR_YOU')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              isProxy
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            📦 ຮັບສັ່ງ
          </button>
          <button
            type="button"
            onClick={() => setServiceType('PREORDER')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              !isProxy
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
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
              <label className="text-xs font-bold text-slate-800">
                🛣️ ເລືອກສາຍທາງຂົນສົ່ງ (Route)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRoute('CHINA_LAOS')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    route === 'CHINA_LAOS'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <span className="text-2xl">🇨🇳</span>
                  <div>
                    <div className="text-xs font-bold">ຈີນ ➔ ລາວ</div>
                    <div className={`text-[10px] ${route === 'CHINA_LAOS' ? 'text-slate-300' : 'text-slate-500'}`}>
                      ສະກຸນເງິນ: ຢວນ (CNY ¥)
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRoute('THAI_LAOS')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    route === 'THAI_LAOS'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <span className="text-2xl">🇹🇭</span>
                  <div>
                    <div className="text-xs font-bold">ໄທ ➔ ລາວ</div>
                    <div className={`text-[10px] ${route === 'THAI_LAOS' ? 'text-slate-300' : 'text-slate-500'}`}>
                      ສະກຸນເງິນ: ບາດ (THB ฿)
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Product Info & Foreign Cost */}
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Tag size={15} className="text-slate-900" />
                ລາຍລະອຽດສິນຄ້າ & ລາຄາຕົ້ນທາງ (¥ / ฿)
              </h2>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  ຊື່ສິນຄ້າ / ຕົວເລືອກທີ່ສັ່ງ *
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="ເຊັ່ນ: ເສື້ອແຂນຍາວ ສີຄຣີມ ໄຊສ໌ L"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>🔗 ລິ້ງສັ່ງສິນຄ້າ (Taobao / 1688 / Shopee / TikTok)</span>
                </label>
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://item.taobao.com/... ຫຼື https://shopee.co.th/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* Pricing Input: Direct LAK (Kip) */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 border-2 border-slate-900 rounded-2xl">
                <label className="text-xs font-black text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <DollarSign size={16} className="text-slate-900" />
                    ຕົ້ນທຶນ / ລາຄາສິນຄ້າ (ເງິນກີບ LAK) *
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    ປ້ອນຍອດເງິນກີບໄດ້ເລີຍ
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={directProxyCostLAK}
                    onChange={(e) =>
                      setDirectProxyCostLAK(
                        e.target.value ? Number(e.target.value) : ''
                      )
                    }
                    placeholder="ເຊັ່ນ: 150000"
                    className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    autoFocus
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-600">
                    ກີບ (LAK)
                  </span>
                </div>
              </div>

              {/* Shipping Fee Input (Optional when creating, can update at warehouse) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Truck size={15} className="text-slate-900" />
                    🚚 ຄ່າຂົນສົ່ງມາລາວ (Shipping Fee)
                  </label>
                  <span className="text-[10px] text-slate-500">ຖ້າຍັງບໍ່ຮູ້ ປະວ່າງໄວ້ໄດ້</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-900">
                      ຄ່າສົ່ງເກັບລູກຄ້າ (LAK)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={shippingCostLAK}
                        onChange={(e) =>
                          setShippingCostLAK(e.target.value ? Number(e.target.value) : '')
                        }
                        placeholder="ເຊັ່ນ: 80000"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                        ກີບ
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      ຕົ້ນທຶນສົ່ງຈິງ (LAK)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={actualShippingCostLAK}
                        onChange={(e) =>
                          setActualShippingCostLAK(
                            e.target.value ? Number(e.target.value) : ''
                          )
                        }
                        placeholder="ເຊັ່ນ: 50000"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                        ກີບ
                      </span>
                    </div>
                  </div>
                </div>

                {proxyShippingProfitLAK > 0 && (
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold">✨ ກຳໄລຄ່າສົ່ງ:</span>
                    <span className="text-emerald-700 font-black">
                      +{formatLAK(proxyShippingProfitLAK)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  ເລກແທຣັກກິ້ງຕົ້ນທາງ (ຈີນ/ໄທ ຖ້າມີ)
                </label>
                <input
                  type="text"
                  value={foreignTrackingNo}
                  onChange={(e) => setForeignTrackingNo(e.target.value)}
                  placeholder="ເຊັ່ນ: SF192837492CN ຫຼື TH019283TH"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none"
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
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <User size={15} className="text-slate-900" />
                ຂໍ້ມູນລູກຄ້າ & ຂົນສົ່ງປາຍທາງ
              </h2>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">ຊື່ລູກຄ້າ *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ຊື່ລູກຄ້າ..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ເບີໂທ / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="020 5xxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ຂົນສົ່ງໃນລາວ
                  </label>
                  <select
                    value={deliveryProvider}
                    onChange={(e) => setDeliveryProvider(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                  >
                    {DELIVERY_PROVIDERS.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.nameLao}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ແຂວງ (Province) *
                  </label>
                  <select
                    value={deliveryProvince}
                    onChange={(e) => setDeliveryProvince(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                  >
                    {LAO_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ສາຂາ / ບ້ານ / ຈຸດຮັບ *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryBranch}
                    onChange={(e) => setDeliveryBranch(e.target.value)}
                    placeholder="ເຊັ່ນ: ສາຂາດົງໂດກ / ໂພນຕ້ອງ"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
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
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <DollarSign size={15} className="text-slate-900" />
                ເງິນມັດຈຳ & ສະຫຼຸບຍອດ
              </h2>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-700">
                  <span>💵 ຄ່າສິນຄ້າເກັບລູກຄ້າ:</span>
                  <span className="font-bold text-slate-900">
                    {formatLAK(proxyProductCostLAK)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-700">
                  <span>🚚 ຄ່າຂົນສົ່ງມາລາວ:</span>
                  <span className="font-bold text-slate-900">
                    {currentShippingLAK > 0 ? formatLAK(currentShippingLAK) : '0 ກີບ (ປ້ອນເມື່ອຮອດສາງ)'}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-700">
                  <span>💳 ມັດຈຳແລ້ວ:</span>
                  <span className="font-semibold text-emerald-600">
                    -{formatLAK(currentDepositLAK)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900">ຍອດ COD ທີ່ຕ້ອງເກັບປາຍທາງ:</span>
                  <span className="text-base font-black text-slate-900">
                    {formatLAK(proxyInitialBalanceDueLAK)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all"
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
            {/* Product, Cost Price & Selling Price in LAK */}
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <h2 className="text-xs font-bold text-amber-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Tag size={15} className="text-amber-600" />
                ລາຍການສິນຄ້າ, ຕົ້ນທຶນ & ລາຄາຂາຍ (LAK)
              </h2>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  ຊື່ສິນຄ້າທີ່ຂາຍ *
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="ເຊັ່ນ: ເສື້ອກັນໜາວ Cardigan ໄໝພົມເກົາຫຼີ (3 ໂຕ)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* Dual Inputs: ຕົ້ນທຶນສິນຄ້າ vs ລາຄາຂາຍ */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Cost Price */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>💵 ຕົ້ນທຶນສິນຄ້າ *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      required
                      value={internalCostLAK}
                      onChange={(e) =>
                        setInternalCostLAK(e.target.value ? Number(e.target.value) : '')
                      }
                      placeholder="ເຊັ່ນ: 100000"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                      ກີບ
                    </span>
                  </div>
                </div>

                {/* Selling Price */}
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 space-y-1.5">
                  <label className="text-xs font-black text-amber-700 flex items-center justify-between">
                    <span>🔥 ລາຄາຂາຍ *</span>
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
                      className="w-full px-3 py-2 bg-white border border-amber-400 rounded-xl text-sm font-black text-amber-900 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-700">
                      ກີບ
                    </span>
                  </div>
                </div>
              </div>

              {/* Profit preview if cost and selling price are provided */}
              {Number(sellingPriceLAK) > 0 && Number(internalCostLAK) > 0 && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <TrendingUp size={14} />
                    ກຳໄລສິນຄ້າຂັ້ນຕົ້ນ:
                  </span>
                  <span className="text-emerald-700 font-black text-sm">
                    +{formatLAK(Number(sellingPriceLAK) - Number(internalCostLAK))}
                  </span>
                </div>
              )}

              {/* Customer Deposit Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
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
                    placeholder="ເຊັ່ນ: 50000 (ຫຼື 0 ຖ້າຍັງບໍ່ມັດຈຳ)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    ກີບ
                  </span>
                </div>
              </div>

              {/* Shipping Fee Input for Preorder Retail */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Truck size={15} className="text-amber-600" />
                    🚚 ຄ່າຂົນສົ່ງມາລາວ (Shipping Fee)
                  </label>
                  <span className="text-[10px] text-slate-500">ຖ້າຍັງບໍ່ຮູ້ ປະວ່າງໄວ້ໄດ້</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-700">
                      ຄ່າສົ່ງເກັບລູກຄ້າ (LAK)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={shippingCostLAK}
                        onChange={(e) =>
                          setShippingCostLAK(e.target.value ? Number(e.target.value) : '')
                        }
                        placeholder="ເຊັ່ນ: 30000"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                        ກີບ
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      ຕົ້ນທຶນສົ່ງຈິງ (LAK)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={actualShippingCostLAK}
                        onChange={(e) =>
                          setActualShippingCostLAK(
                            e.target.value ? Number(e.target.value) : ''
                          )
                        }
                        placeholder="ເຊັ່ນ: 20000"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                        ກີບ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Retail COD Balance Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">
                    ຍອດ COD ທີ່ເຫຼືອເກັບລູກຄ້າ (ລາຄາຂາຍ + ຄ່າສົ່ງ - ມັດຈຳ)
                  </span>
                  <span className="text-base font-black text-slate-900">
                    {formatLAK(retailInitialBalanceDueLAK)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {currentShippingLAK > 0 ? `(ລວມຄ່າສົ່ງ ${formatLAK(currentShippingLAK)})` : '(ຍັງບໍ່ລວມຄ່າສົ່ງ)'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  🔗 ລິ້ງສິນຄ້າ (Taobao/Shopee ຖ້າມີ)
                </label>
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none"
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
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <h2 className="text-xs font-bold text-amber-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <User size={15} className="text-amber-600" />
                ຂໍ້ມູນລູກຄ້າ & ຂົນສົ່ງປາຍທາງ
              </h2>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">ຊື່ລູກຄ້າ *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ຊື່ລູກຄ້າ..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ເບີໂທ / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="020 5xxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ຂົນສົ່ງໃນລາວ
                  </label>
                  <select
                    value={deliveryProvider}
                    onChange={(e) => setDeliveryProvider(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                  >
                    {DELIVERY_PROVIDERS.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.nameLao}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ແຂວງ (Province) *
                  </label>
                  <select
                    value={deliveryProvince}
                    onChange={(e) => setDeliveryProvince(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                  >
                    {LAO_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ສາຂາ / ບ້ານ / ຈຸດຮັບ *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryBranch}
                    onChange={(e) => setDeliveryBranch(e.target.value)}
                    placeholder="ເຊັ່ນ: ສາຂາດົງໂດກ / ໂພນຕ້ອງ"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
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

            {/* Optional Foreign Tracking # */}
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1.5 shadow-sm">
              <label className="text-xs font-semibold text-slate-700">
                ເລກແທຣັກກິ້ງຕົ້ນທາງ (ຈີນ/ໄທ ຖ້າມີ)
              </label>
              <input
                type="text"
                value={foreignTrackingNo}
                onChange={(e) => setForeignTrackingNo(e.target.value)}
                placeholder="SF192837492CN / TH019283TH"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Check size={18} />
              {submitting ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກອໍເດີພຣີອໍເດີມາຂາຍ 🏷️'}
            </button>
          </>
        )}
      </form>

      {/* Post-Save Success & Message Copy Modal */}
      {savedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-sm mb-2">
                <Check size={28} className="stroke-[3]" />
              </div>
              <h3 className="text-base font-bold text-slate-900">ບັນທຶກອໍເດີສຳເລັດແລ້ວ!</h3>
              <p className="text-xs text-slate-500">
                ເລກຕິດຕາມ:{' '}
                <span className="font-mono text-slate-900 font-bold">
                  {savedOrder.tracking_code}
                </span>
              </p>
            </div>

            {/* Quick Preview Message Box */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-slate-800 max-h-40 overflow-y-auto whitespace-pre-wrap">
              {generateCustomerMessage(savedOrder, 'order_created')}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCopyMessage}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  copied
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-900 hover:bg-black text-white shadow-sm'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'ກັອບປີ້ແລ້ວ!' : 'ກັອບປີ້ຂໍ້ຄວາມສົ່ງໃຫ້ລູກຄ້າ (1-Click)'}
              </button>

              {savedOrder.customer_phone && (
                <a
                  href={`https://wa.me/${savedOrder.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    generateCustomerMessage(savedOrder, 'order_created')
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Share2 size={15} />
                  ສົ່ງຂໍ້ຄວາມຜ່ານ WhatsApp
                </a>
              )}

              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 text-center"
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs">
          ກຳລັງໂຫຼດ...
        </div>
      }
    >
      <NewOrderForm />
    </Suspense>
  );
}
