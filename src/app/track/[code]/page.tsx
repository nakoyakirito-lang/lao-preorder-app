'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Order, ShopSettings } from '@/types/database';
import { getOrderByTrackingCode, getShopSettings, DEFAULT_SHOP_SETTINGS } from '@/lib/storage';
import { TrackingTimeline } from '@/components/track/TrackingTimeline';
import { StatusBadge } from '@/components/parcels/StatusBadge';
import { formatLAK } from '@/lib/calculations';
import { useRouter } from 'next/navigation';
import {
  Package,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  Share2,
  DollarSign,
  ShieldCheck,
  Check,
  Copy,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function PublicTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const trackingCode = (params?.code as string) || '';

  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (trackingCode) {
      Promise.all([
        getOrderByTrackingCode(trackingCode),
        getShopSettings(),
      ]).then(([ord, setts]) => {
        setOrder(ord);
        setSettings(setts);
        setLoading(false);
      });
    }
  }, [trackingCode]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `ສະຖານະພັດສະດຸ ${order?.tracking_code}`,
        text: `ກວດສອບສະຖານະພັດສະດຸ ${order?.product_name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-500">ກຳລັງກວດສອບສະຖານະພັດສະດຸ...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-700 border border-red-200 flex items-center justify-center mb-3">
          <Package size={28} />
        </div>
        <h1 className="text-base font-bold text-slate-900">ບໍ່ພົບຂໍ້ມູນພັດສະດຸ</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          ກະລຸນາກວດສອບເລກຕິດຕາມ <span className="font-mono text-slate-900 font-bold">{trackingCode}</span> ຄືນໃໝ່
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:text-black shadow-sm"
        >
          ← ກັບຄືນ
        </button>
      </div>
    );
  }

  const isChina = order.route === 'CHINA_LAOS';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-12">
      {/* Brand Header with Back Button */}
      <div className="bg-white border-b border-slate-200 p-4 relative flex items-center justify-between shadow-sm">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:border-slate-900 transition-colors"
          title="ຍ້ອນກັບ"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="text-center flex-1 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-bold mb-0.5">
            <ShieldCheck size={12} />
            ລະບົບກວດສອບສະຖານະພັດສະດຸ
          </div>
          <h1 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
            {settings.shop_name}
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isChina
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {isChina ? '🇨🇳 ຈີນ ➔ ລາວ' : '🇹🇭 ໄທ ➔ ລາວ'}
            </span>
            <StatusBadge status={order.status} size="md" />
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-mono">
              ເລກຕິດຕາມພັດສະດຸ:
            </span>
            <h2 className="text-lg font-mono font-black text-slate-900">
              {order.tracking_code}
            </h2>
          </div>

          {/* Product Details with Image */}
          <div className="pt-3 border-t border-slate-100 flex gap-3 items-center">
            {order.product_image_url && (
              <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                <img
                  src={order.product_image_url}
                  alt={order.product_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">
                {order.product_name}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ວັນທີສັ່ງຊື້: {order.order_date}
              </p>
              {order.product_url && (
                <a
                  href={order.product_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1 font-semibold"
                >
                  🔗 ເບິ່ງລິ້ງສິນຄ້າຕົ້ນທາງ
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Progress */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900">📍 ສະຖານະການຈັດສົ່ງ (Timeline)</h3>
          <TrackingTimeline
            status={order.status}
            orderDate={order.order_date}
            arrivedDate={order.arrived_date}
          />
        </div>

        {/* Destination Info */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900">📦 ຂໍ້ມູນຜູ້ຮັບ & ຈຸດຈັດສົ່ງໃນລາວ</h3>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">ຊື່ຜູ້ຮັບ:</span>
              <span className="font-bold text-slate-900">{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ເບີໂທ:</span>
              <span className="font-semibold text-slate-900">{order.customer_phone}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500">ຂົນສົ່ງປາຍທາງ:</span>
              <span className="font-bold text-slate-900">
                {order.delivery_provider} ({order.delivery_province ? `${order.delivery_province} - ` : ''}{order.delivery_branch || 'ສາຂາຫຼັກ'})
              </span>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900">💰 ລາຍລະອຽດຄ່າໃຊ້ຈ່າຍ (ເງິນກີບ)</h3>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">
                {order.service_type === 'PREORDER' ? '1. ລາຄາຂາຍ:' : '1. ຄ່າສິນຄ້າ:'}
              </span>
              <span className="font-semibold text-slate-900">
                {formatLAK(order.selling_price_lak || order.product_cost_lak)}
              </span>
            </div>
            {order.shipping_cost_lak > 0 ? (
              <div className="flex justify-between">
                <span className="text-slate-500">2. ຄ່າຂົນສົ່ງມາລາວ:</span>
                <span className="font-semibold text-blue-600">{formatLAK(order.shipping_cost_lak)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-slate-400">
                <span>2. ຄ່າຂົນສົ່ງມາລາວ:</span>
                <span>(ຄິດໄລ່ເມື່ອຮອດສາງລາວ)</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-slate-200 font-semibold text-slate-900">
              <span>ຍອດລວມທັງໝົດ:</span>
              <span>{formatLAK(order.total_cost_lak)}</span>
            </div>
            {order.deposit_lak > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>ຫັກມັດຈຳທີ່ຈ່າຍແລ້ວ:</span>
                <span>-{formatLAK(order.deposit_lak)}</span>
              </div>
            )}
          </div>

          {/* Prominent COD Amount */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] font-bold text-slate-300 uppercase">
                ຍອດທີ່ຕ້ອງຊຳລະ / COD ປາຍທາງ
              </span>
              <div className="text-xl font-black text-white">
                {formatLAK(order.balance_due_lak)}
              </div>
            </div>
            <div className="text-right text-[11px] font-bold text-slate-200">
              {order.balance_due_lak === 0 ? 'ຊຳລະຄົບແລ້ວ ✅' : 'ກຽມຈ່າຍຕອນຮັບເຄື່ອງ'}
            </div>
          </div>
        </div>

        {/* Share Button & Contact Shop */}
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 py-3 px-4 bg-white border border-slate-300 hover:border-slate-900 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            {copied ? <Check size={15} /> : <Share2 size={15} />}
            {copied ? 'ກັອບປີ້ລິ້ງແລ້ວ!' : 'ແຊຣ໌ລິ້ງຕິດຕາມ'}
          </button>

          {settings.phone && (
            <a
              href={`https://wa.me/${settings.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <MessageCircle size={15} />
              ຕິດຕໍ່ຮ້ານຄ້າ
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
