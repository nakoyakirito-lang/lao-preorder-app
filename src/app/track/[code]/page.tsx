'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Order, ShopSettings } from '@/types/database';
import { getOrderByTrackingCode, getShopSettings, DEFAULT_SHOP_SETTINGS } from '@/lib/storage';
import { TrackingTimeline } from '@/components/track/TrackingTimeline';
import { StatusBadge } from '@/components/parcels/StatusBadge';
import { formatLAK } from '@/lib/calculations';
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
} from 'lucide-react';
import Link from 'next/link';

export default function PublicTrackingPage() {
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
      <div className="min-h-screen bg-background text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-400">ກຳລັງກວດສອບສະຖານະພັດສະດຸ...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center mb-3">
          <Package size={28} />
        </div>
        <h1 className="text-base font-bold text-slate-100">ບໍ່ພົບຂໍ້ມູນພັດສະດຸ</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          ກະລຸນາກວດສອບເລກຕິດຕາມ <span className="font-mono text-neon">{trackingCode}</span> ຄືນໃໝ່
        </p>
        <Link
          href="/"
          className="mt-4 px-4 py-2 rounded-xl bg-surface border border-slate-700 text-xs font-bold text-slate-200"
        >
          ກັບສູ່ໜ້າຫຼັກ
        </Link>
      </div>
    );
  }

  const isChina = order.route === 'CHINA_LAOS';

  return (
    <main className="min-h-screen bg-background text-slate-100 flex flex-col pb-12">
      {/* Brand Header */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neon/10 border border-neon/30 text-neon text-[10px] font-bold mb-1">
          <ShieldCheck size={12} />
          ລະບົບກວດສອບສະຖານະພັດສະດຸ
        </div>
        <h1 className="text-base font-black text-slate-100 uppercase tracking-tight">
          {settings.shop_name}
        </h1>
        <p className="text-[11px] text-slate-400">
          ຕິດຕໍ່ສອບຖາມ: {settings.phone}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <div className="p-4 rounded-2xl bg-surface border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isChina
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              }`}
            >
              {isChina ? '🇨🇳 ຈີນ ➔ ລາວ' : '🇹🇭 ໄທ ➔ ລາວ'}
            </span>
            <StatusBadge status={order.status} size="md" />
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-mono">
              ເລກຕິດຕາມພັດສະດຸ:
            </span>
            <h2 className="text-lg font-mono font-black text-neon neon-glow-text">
              {order.tracking_code}
            </h2>
          </div>

          {/* Product Details with Image */}
          <div className="pt-3 border-t border-slate-800/80 flex gap-3 items-center">
            {order.product_image_url && (
              <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex-shrink-0">
                <img
                  src={order.product_image_url}
                  alt={order.product_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-2">
                {order.product_name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ວັນທີສັ່ງຊື້: {order.order_date}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Progress */}
        <div className="p-4 rounded-2xl bg-surface border border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-slate-300">📍 ສະຖານະການຈັດສົ່ງ (Timeline)</h3>
          <TrackingTimeline
            status={order.status}
            orderDate={order.order_date}
            arrivedDate={order.arrived_date}
          />
        </div>

        {/* Destination Info */}
        <div className="p-4 rounded-2xl bg-surface border border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-slate-300">📦 ຂໍ້ມູນຜູ້ຮັບ & ຈຸດຈັດສົ່ງໃນລາວ</h3>
          <div className="p-3 bg-background rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">ຊື່ຜູ້ຮັບ:</span>
              <span className="font-bold text-slate-200">{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ເບີໂທ:</span>
              <span className="font-semibold text-slate-200">{order.customer_phone}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">ຂົນສົ່ງປາຍທາງ:</span>
              <span className="font-bold text-neon">
                {order.delivery_provider} ({order.delivery_branch || 'ສາຂາຫຼັກ'})
              </span>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-4 rounded-2xl bg-surface border border-slate-800 space-y-2.5">
          <h3 className="text-xs font-bold text-slate-300">💰 ລາຍລະອຽດຄ່າໃຊ້ຈ່າຍ (ເງິນກີບ)</h3>
          <div className="p-3 bg-background rounded-xl border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">1. ຄ່າສິນຄ້າ:</span>
              <span className="font-semibold text-slate-200">{formatLAK(order.product_cost_lak)}</span>
            </div>
            {order.shipping_cost_lak > 0 ? (
              <div className="flex justify-between">
                <span className="text-slate-400">2. ຄ່າຂົນສົ່ງມາລາວ:</span>
                <span className="font-semibold text-slate-200">{formatLAK(order.shipping_cost_lak)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-slate-500">
                <span>2. ຄ່າຂົນສົ່ງມາລາວ:</span>
                <span>(ຄິດໄລ່ເມື່ອຮອດສາງລາວ)</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-slate-800 font-semibold text-slate-200">
              <span>ຍອດລວມທັງໝົດ:</span>
              <span>{formatLAK(order.total_cost_lak)}</span>
            </div>
            {order.deposit_lak > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>ຫັກມັດຈຳທີ່ຈ່າຍແລ້ວ:</span>
                <span>-{formatLAK(order.deposit_lak)}</span>
              </div>
            )}
          </div>

          {/* Prominent COD Amount */}
          <div className="p-3.5 bg-neon/10 border border-neon rounded-xl flex items-center justify-between shadow-neon-sm">
            <div>
              <span className="text-[10px] font-bold text-neon uppercase">
                ຍອດທີ່ຕ້ອງຊຳລະ / COD ປາຍທາງ
              </span>
              <div className="text-xl font-black text-neon neon-glow-text">
                {formatLAK(order.balance_due_lak)}
              </div>
            </div>
            <div className="text-right text-[11px] font-bold text-slate-300">
              {order.balance_due_lak === 0 ? 'ຊຳລະຄົບແລ້ວ ✅' : 'ກຽມຈ່າຍຕອນຮັບເຄື່ອງ'}
            </div>
          </div>
        </div>

        {/* Share Button & Contact Shop */}
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 py-3 px-4 bg-surface border border-slate-700 hover:border-neon rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all"
          >
            {copied ? <Check size={15} /> : <Share2 size={15} />}
            {copied ? 'ກັອບປີ້ລິ້ງແລ້ວ!' : 'ແຊຣ໌ລິ້ງຕິດຕາມ'}
          </button>

          {settings.phone && (
            <a
              href={`https://wa.me/${settings.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 px-4 bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-600/30 transition-all"
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
