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
      className={`relative rounded-2xl bg-white border transition-all overflow-hidden cursor-pointer group ${
        selected
          ? 'border-slate-900 ring-2 ring-slate-900 shadow-md'
          : 'border-slate-200 hover:border-slate-400 hover:shadow-md'
      }`}
    >
      {/* Header Info Bar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          {selectable && (
            <input
              type="checkbox"
              checked={selected}
              onClick={(e) => e.stopPropagation()}
              onChange={() => onSelect && onSelect(order.id)}
              className="w-4 h-4 rounded border-slate-300 bg-white text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900"
            />
          )}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isChina
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            {isChina ? '🇨🇳 ຈີນ ➔ ລາວ' : '🇹🇭 ໄທ ➔ ລາວ'}
          </span>
          <span className="text-xs font-mono font-bold text-slate-800">
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
            className="text-[11px] font-bold py-1 px-2 rounded-lg bg-white border border-slate-300 text-slate-800 focus:border-slate-900 focus:outline-none cursor-pointer shadow-sm"
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
        <div className="relative w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {order.product_image_url ? (
            <img
              src={order.product_image_url}
              alt={order.product_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <Tag size={24} className="text-slate-400" />
          )}

          {order.customer_social_image && (
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white overflow-hidden shadow-sm">
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
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-black transition-colors">
            {order.product_name}
          </h3>

          <div className="mt-1 flex items-center gap-1.5 text-slate-700 text-xs font-medium">
            <span className="text-slate-400">👤</span>
            <span className="font-semibold text-slate-900 truncate">
              {order.customer_name}
            </span>
            <span className="text-[11px] text-slate-500">({order.customer_phone})</span>
          </div>

          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <MapPin size={12} className="text-slate-700 flex-shrink-0" />
            <span className="truncate">
              {order.delivery_provider}: {order.delivery_province ? `${order.delivery_province} - ` : ''}{order.delivery_branch || 'ສາຂາຫຼັກ'}
            </span>
          </div>

          {/* Cost Preview */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block">
                {order.service_type === 'PREORDER' ? 'ລາຄາຂາຍ: ' : 'ຄ່າເຄື່ອງ: '}
                {formatLAK(order.selling_price_lak || order.product_cost_lak)}
              </span>
              {order.shipping_cost_lak > 0 && (
                <span className="text-[10px] text-blue-600 block">
                  + ຄ່າສົ່ງ: {formatLAK(order.shipping_cost_lak)}
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">ຍອດ COD ຕ້ອງເກັບ</span>
              <span className="text-xs sm:text-sm font-black text-slate-900">
                {formatLAK(order.balance_due_lak)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* 1-Click Copy Message */}
          <button
            type="button"
            onClick={handleCopyMessage}
            className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
              copied
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:text-slate-900 hover:border-slate-900 shadow-sm'
            }`}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'ກັອບປີ້ແລ້ວ!' : order.status === 'arrived_laos' ? '📋 ບິນຮອດລາວ' : 'ກັອບປີ້ຂໍ້ຄວາມ'}
          </button>

          {/* Quick WhatsApp Link with Pre-filled Arrived Notice */}
          {order.customer_phone && (
            <a
              href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                generateCustomerMessage(
                  order,
                  order.status === 'arrived_laos' ? 'arrived' : 'order_created'
                )
              )}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition-all shadow-sm ${
                order.status === 'arrived_laos'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:text-slate-900'
              }`}
            >
              <MessageCircle size={13} />
              {order.status === 'arrived_laos' ? '📢 ແຈ້ງຮອດລາວ' : 'WhatsApp'}
            </a>
          )}

          {/* Product URL Link if available */}
          {order.product_url && (
            <a
              href={order.product_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-white text-slate-700 border border-slate-300 hover:text-slate-900 shadow-sm"
              title="ເບິ່ງລິ້ງສັ່ງສິນຄ້າ"
            >
              <ExternalLink size={13} />
              ລິ້ງສິນຄ້າ
            </a>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {order.status !== 'arrived_laos' && order.status !== 'completed' && onCheckIn && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCheckIn(order);
              }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-white hover:bg-black shadow-sm transition-all"
            >
              📥 ເຊັກອິນຮອດລາວ
            </button>
          )}

          <Link
            href={`/track/${order.tracking_code}`}
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-300 transition-colors"
            title="ເບິ່ງໜ້າຕິດຕາມ"
          >
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
