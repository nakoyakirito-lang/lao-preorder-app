'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import Link from 'next/link';

export default function NewOrderPage() {
  const router = useRouter();
  const [serviceType, setServiceType] = useState<ServiceType>('BUY_FOR_YOU');
  const [route, setRoute] = useState<RouteType>('CHINA_LAOS');
  const [rates, setRates] = useState(DEFAULT_EXCHANGE_RATES);

  // Form Fields
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
  const [originCost, setOriginCost] = useState<number | ''>('');
  const [customRate, setCustomRate] = useState<number | ''>('');
  const [realCostRate, setRealCostRate] = useState<number | ''>('');
  const [sellingPriceLAK, setSellingPriceLAK] = useState<number | ''>('');
  const [depositLAK, setDepositLAK] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Post-Save Modal
  const [savedOrder, setSavedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getExchangeRates().then((data) => {
      setRates(data);
      const defaultCurrency: OriginCurrency = route === 'CHINA_LAOS' ? 'CNY' : 'THB';
      const r = data.find((x) => x.currency === defaultCurrency)?.rate_to_lak || (route === 'CHINA_LAOS' ? 3200 : 640);
      setCustomRate(r);
    });
  }, [route]);

  const originCurrency: OriginCurrency = route === 'CHINA_LAOS' ? 'CNY' : 'THB';
  const effectiveRate = Number(customRate) || (route === 'CHINA_LAOS' ? 3200 : 640);
  const productCostLAK = calculateProductCostLAK(Number(originCost) || 0, effectiveRate);
  const currentDepositLAK = Number(depositLAK) || 0;
  const effectiveCustomerBasePrice =
    serviceType === 'PREORDER' && Number(sellingPriceLAK) > 0
      ? Number(sellingPriceLAK)
      : productCostLAK;
  const initialBalanceDueLAK = calculateBalanceDueLAK(effectiveCustomerBasePrice, currentDepositLAK);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !productName || !originCost) {
      alert('ກະລຸນາປ້ອນຂໍ້ມູນສຳຄັນໃຫ້ຄົບຖ້ວນ (ຊື່ລູກຄ້າ, ເບີໂທ, ຊື່ສິນຄ້າ, ລາຄາຕົ້ນທາງ)');
      return;
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
      origin_cost: Number(originCost),
      exchange_rate: effectiveRate,
      real_exchange_rate: realCostRate ? Number(realCostRate) : undefined,
      product_cost_lak: productCostLAK,
      selling_price_lak: sellingPriceLAK ? Number(sellingPriceLAK) : undefined,
      shipping_cost_lak: 0,
      actual_shipping_cost_lak: 0,
      service_fee_lak: 0,
      total_cost_lak: effectiveCustomerBasePrice,
      deposit_lak: currentDepositLAK,
      balance_due_lak: initialBalanceDueLAK,
      profit_lak: 0,
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
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-background text-slate-100 flex flex-col pb-12">
      {/* Top Header */}
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
              <PackagePlus size={18} className="text-neon" />
              ສັ່ງພຣີອໍເດີໃໝ່
            </h1>
            <p className="text-[11px] text-slate-400">ບັນທຶກອໍເດີ & ຄິດໄລ່ເງິນກີບອັດຕະໂນມັດ</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Service Type Mode (Buy-for-you vs Preorder Retail) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-200">💼 ເລືອກຮູບແບບການບໍລິການ (Service Type)</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setServiceType('BUY_FOR_YOU')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all ${
                serviceType === 'BUY_FOR_YOU'
                  ? 'border-neon bg-neon/10 ring-1 ring-neon text-slate-100 shadow-neon-sm'
                  : 'border-slate-800 bg-surface/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-lg">📦</span>
                <span className="text-xs font-extrabold text-slate-100">ຮັບສັ່ງເຄື່ອງ (Proxy)</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                ລູກຄ້າຈ່າຍຄ່າເຄື່ອງ • ຮ້ານໄດ້ກຳໄລເລດເງິນ + ບວກຄ່າສົ່ງ
              </p>
            </button>

            <button
              type="button"
              onClick={() => setServiceType('PREORDER')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all ${
                serviceType === 'PREORDER'
                  ? 'border-neon bg-neon/10 ring-1 ring-neon text-slate-100 shadow-neon-sm'
                  : 'border-slate-800 bg-surface/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🏷️</span>
                <span className="text-xs font-extrabold text-slate-100">ພຣີອໍເດີມາຂາຍ (Retail)</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                ຮ້ານລົງທຶນຕົ້ນທຶນເອງ • ຕັ້ງລາຄາຂາຍ + ເກັບມັດຈຳ
              </p>
            </button>
          </div>
        </div>

        {/* Route Selector (China vs Thailand) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-200">🛣️ ເລືອກສາຍທາງຂົນສົ່ງ (Route)</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRoute('CHINA_LAOS')}
              className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                route === 'CHINA_LAOS'
                  ? 'border-neon bg-neon/10 ring-1 ring-neon text-slate-100'
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
                  ? 'border-neon bg-neon/10 ring-1 ring-neon text-slate-100'
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

        {/* Section: Product Information */}
        <div className="p-3.5 bg-surface rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Tag size={15} className="text-neon" />
            ຂໍ້ມູນສິນຄ້າ & ລາຄາຕົ້ນທາງ
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              ຊື່ສິນຄ້າ / ລາຍລະອຽດ *
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="ເຊັ່ນ: ເກີບ Nike Dunk Low (ຂາວ-ດຳ) ເບີ 42"
              className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-neon focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>🔗 ລິ້ງສັ່ງສິນຄ້າ (Product URL)</span>
              <span className="text-[10px] text-slate-400">Taobao / 1688 / Shopee / TikTok</span>
            </label>
            <input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://item.taobao.com/... ຫຼື https://shopee.co.th/..."
              className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-neon focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                ລາຄາຕົ້ນທາງ ({originCurrency === 'CNY' ? 'ຢວນ ¥' : 'ບາດ ฿'}) *
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={originCost}
                onChange={(e) => setOriginCost(e.target.value ? Number(e.target.value) : '')}
                placeholder={originCurrency === 'CNY' ? 'ເຊັ່ນ: 199' : 'ເຊັ່ນ: 650'}
                className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs font-bold text-slate-100 focus:border-neon focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                ເລດເງິນ (1 {originCurrency} = ກີບ)
              </label>
              <input
                type="number"
                step="any"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs font-bold text-slate-100 focus:border-neon focus:outline-none"
              />
            </div>
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

          {/* Product Image Upload */}
          <ImageUpload
            label="📸 ຮູບພາບສິນຄ້າ (Product Photo)"
            sublabel="ອັບໂຫຼດຮູບສິນຄ້າ"
            value={productImageUrl}
            onChange={setProductImageUrl}
          />
        </div>

        {/* Section: Customer & Delivery Information */}
        <div className="p-3.5 bg-surface rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <User size={15} className="text-neon" />
            ຂໍ້ມູນລູກຄ້າ & ຂົນສົ່ງປາຍທາງໃນລາວ
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
              <label className="text-xs font-semibold text-slate-300">ເບີໂທ / WhatsApp *</label>
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
                ຂົນສົ່ງໃນລາວ (Delivery)
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

          {/* Social Image Upload (Customer FB/WhatsApp screenshot) */}
          <ImageUpload
            label="👤 ຮູບໜ້າ Facebook / WhatsApp ລູກຄ້າ"
            sublabel="ແຄັບໜ້າຈໍແຊັດ/ໂປຣໄຟລ໌ເພື່ອບໍ່ໃຫ້ຫຼົງ"
            value={customerSocialImage}
            onChange={setCustomerSocialImage}
            aspectRatio="wide"
          />
        </div>

        {/* Financial Summary & Deposit */}
        <div className="p-3.5 bg-surface rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <DollarSign size={15} className="text-neon" />
            ຄິດໄລ່ເງິນກີບ (Lao Kip Calculation)
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              ເງິນມັດຈຳທີ່ລູກຄ້າຈ່າຍແລ້ວ (ກີບ LAK)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={depositLAK}
              onChange={(e) => setDepositLAK(e.target.value ? Number(e.target.value) : '')}
              placeholder="0 (ຖ້າຍັງບໍ່ທັນຈ່າຍ)"
              className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs font-bold text-slate-100 focus:border-neon focus:outline-none"
            />
          </div>

          <div className="p-3 bg-neon/5 rounded-xl border border-neon/30 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>💵 ຕົ້ນທຶນສິນຄ້າ (LAK):</span>
              <span className="font-bold text-slate-100">{formatLAK(productCostLAK)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>🚚 ຄ່າຂົນສົ່ງມາລາວ:</span>
              <span className="text-slate-400">ປ້ອນເມື່ອເຄື່ອງຮອດສາງລາວ</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>💳 ມັດຈຳແລ້ວ:</span>
              <span className="font-semibold text-emerald-400">-{formatLAK(currentDepositLAK)}</span>
            </div>
            <div className="pt-2 border-t border-neon/20 flex justify-between items-center">
              <span className="text-xs font-bold text-neon">ຍອດຄ້າງຊຳລະເບື້ອງຕົ້ນ:</span>
              <span className="text-base font-black text-neon neon-glow-text">
                {formatLAK(initialBalanceDueLAK)}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-2xl neon-button text-sm font-black flex items-center justify-center gap-2"
        >
          <Check size={18} />
          {submitting ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກອໍເດີພຣີອໍເດີ'}
        </button>
      </form>

      {/* Post-Save Success & Message Copy Modal */}
      {savedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-neon/20 text-neon border border-neon flex items-center justify-center mx-auto shadow-neon">
                <Check size={26} />
              </div>
              <h3 className="text-base font-bold text-slate-100">
                ບັນທຶກອໍເດີສຳເລັດແລ້ວ!
              </h3>
              <p className="text-xs text-neon font-mono font-bold">
                {savedOrder.tracking_code}
              </p>
            </div>

            {/* Generated Message Preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>💬 ຂໍ້ຄວາມແຈ້ງລູກຄ້າ (ພ້ອມສົ່ງ):</span>
                <span className="text-[10px] text-neon">ກັອບປີ້ໄປວາງໃນ WhatsApp ໄດ້ເລີຍ</span>
              </label>
              <textarea
                readOnly
                rows={7}
                value={generateCustomerMessage(savedOrder, 'order_created')}
                className="w-full p-2.5 bg-background border border-slate-700 rounded-xl text-[11px] font-mono text-slate-200 resize-none focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyMessage}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  copied
                    ? 'bg-neon/20 text-neon border-neon'
                    : 'bg-surface text-slate-200 border-slate-700 hover:border-neon'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'ກັອບປີ້ແລ້ວ!' : 'ກັອບປີ້ຂໍ້ຄວາມ'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/parcels')}
                className="flex-1 py-2.5 px-3 rounded-xl neon-button text-xs font-bold flex items-center justify-center gap-1.5"
              >
                ເບິ່ງລາຍການພັດສະດຸ
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
