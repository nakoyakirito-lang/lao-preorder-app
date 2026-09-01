'use client';

import React, { useState } from 'react';
import { Order } from '@/types/database';
import { StatusBadge } from './StatusBadge';
import { formatLAK, formatForeignCurrency } from '@/lib/calculations';
import { generateCustomerMessage } from '@/lib/messageGenerator';
import {
  Phone,
  Copy,
  Check,
  Printer,
  ChevronRight,
  ExternalLink,
  MapPin,
  Calendar,
  Share2,
  Tag,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';

interface ParcelCardProps {
  order: Order;
  onUpdateStatus?: (id: string, newStatus: Order['status']) => void;
  onCheckIn?: (order: Order) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export const ParcelCard: React.FC<ParcelCardProps> = ({
  order,
  onUpdateStatus,
  onCheckIn,
  selectable,
  selected,
  onSelect,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const msgType =
      order.status === 'arrived_laos'
        ? 'arrived'
        : order.status === 'delivering'
        ? 'delivering'
        : 'order_created';
    const text = generateCustomerMessage(order, msgType);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isChina = order.route === 'CHINA_LAOS';

  const handleCardClick = () => {
    if (onCheckIn) {
      onCheckIn(order);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative rounded-2xl bg-surface border transition-all overflow-hidden cursor-pointer group ${
        selected
          ? 'border-neon ring-1 ring-neon shadow-neon-sm bg-surface'
          : 'border-slate-800/90 hover:border-neon/60 hover:shadow-neon-sm'
      }`}
    >
      {/* Header Info Bar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2">
          {selectable && (
            <input
              type="checkbox"
              checked={selected}
              onClick={(e) => e.stopPropagation()}
              onChange={() => onSelect && onSelect(order.id)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-neon focus:ring-neon cursor-pointer accent-neon"
            />
          )}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isChina
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}
          >
            {isChina ? '🇨🇳 ຈີນ ➔ ລາວ' : '🇹🇭 ໄທ ➔ ລາວ'}
          </span>
          <span className="text-xs font-mono font-bold text-slate-300">
            {order.tracking_code}
          </span>
        </div>

        {/* Interactive Status Changer Dropdown */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <select
            value={order.status}
            onChange={(e) => {
              const newSt = e.target.value as Order['status'];
              if (onUpdateStatus) {
                onUpdateStatus(order.id, newSt);
              }
              if (newSt === 'arrived_laos' && order.shipping_cost_lak === 0 && onCheckIn) {
                onCheckIn(order);
              }
            }}
            className="text-[11px] font-bold py-1 px-2 rounded-lg bg-background border border-slate-700 text-slate-200 focus:border-neon focus:outline-none cursor-pointer"
          >
            <option value="ordered">📦 ສັ່ງຊື້ແລ້ວ</option>
            <option value="in_transit">🚚 ກຳລັງມາລາວ</option>
            <option value="arrived_laos">🏢 ຮອດສາງລາວແລ້ວ</option>
            <option value="delivering">🛵 ກຳລັງຈັດສົ່ງ</option>
            <option value="completed">✅ ສຳເລັດ / ຈ່າຍແລ້ວ</option>
            <option value="cancelled">❌ ຍົກເລີກ / ຕີກັບ</option>
          </select>
        </div>
      </div>

      {/* Main Card Body (Clickable to view/edit) */}
      <div className="p-3.5 flex gap-3">
        {/* Product / Social Image */}
        <div className="relative w-20 h-20 rounded-xl bg-slate-800/80 border border-slate-700/80 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {order.product_image_url ? (
            <img
              src={order.product_image_url}
              alt={order.product_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <Tag size={24} className="text-slate-500" />
          )}

          {order.customer_social_image && (
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-background overflow-hidden shadow-sm">
              <img
                src={order.customer_social_image}
                alt="Customer Profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Info & Customer Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-neon transition-colors">
            {order.product_name}
          </h3>

          <div className="mt-1 flex items-center gap-1.5 text-slate-300 text-xs font-medium">
            <span className="text-slate-400">👤</span>
            <span className="font-semibold text-slate-200 truncate">
              {order.customer_name}
            </span>
            <span className="text-[11px] text-slate-400">({order.customer_phone})</span>
          </div>

          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <MapPin size={12} className="text-neon flex-shrink-0" />
            <span className="truncate">
              {order.delivery_provider}: {order.delivery_branch || 'ສາຂາຫຼັກ'}
            </span>
          </div>

          {/* Cost Preview */}
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">
                ຕົ້ນທຶນ: {formatLAK(order.product_cost_lak)}
              </span>
              {order.shipping_cost_lak > 0 && (
                <span className="text-[10px] text-sky-400 block">
                  + ຄ່າສົ່ງ: {formatLAK(order.shipping_cost_lak)}
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">ຍອດ COD ຕ້ອງເກັບ</span>
              <span className="text-xs sm:text-sm font-black text-neon neon-glow-text">
                {formatLAK(order.balance_due_lak)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* 1-Click Copy Message */}
          <button
            type="button"
            onClick={handleCopyMessage}
            className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
              copied
                ? 'bg-neon/20 text-neon border-neon shadow-neon-sm'
                : 'bg-surface text-slate-300 border-slate-700 hover:text-neon hover:border-neon'
            }`}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'ກັອບປີ້ແລ້ວ!' : 'ກັອບປີ້ຂໍ້ຄວາມ'}
          </button>

          {/* Quick WhatsApp Link */}
          {order.customer_phone && (
            <a
              href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
            >
              <MessageCircle size={13} />
              WhatsApp
            </a>
          )}

          {/* Product URL Link if available */}
          {order.product_url && (
            <a
              href={order.product_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20"
              title="ເບິ່ງລິ້ງສັ່ງສິນຄ້າ"
            >
              <ExternalLink size={13} />
              ລິ້ງສິນຄ້າ
            </a>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {order.status !== 'arrived_laos' && order.status !== 'completed' && onCheckIn && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCheckIn(order);
              }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-neon text-black hover:bg-neon-400 shadow-neon-sm transition-all"
            >
              📥 ເຄື່ອງຮອດລາວ
            </button>
          )}

          <Link
            href={`/track/${order.tracking_code}`}
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
            title="ເບິ່ງໜ້າຕິດຕາມ"
          >
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
