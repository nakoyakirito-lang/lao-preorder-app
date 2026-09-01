'use client';

import React, { useState } from 'react';
import { Order } from '@/types/database';
import { formatLAK, calculateTotalCostLAK, calculateBalanceDueLAK } from '@/lib/calculations';
import { generateCustomerMessage } from '@/lib/messageGenerator';
import { X, Check, Copy, PackageCheck, AlertCircle } from 'lucide-react';

interface CheckInModalProps {
  order: Order;
  onClose: () => void;
  onSave: (updatedOrder: Order) => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  order,
  onClose,
  onSave,
}) => {
  const [shippingCostLAK, setShippingCostLAK] = useState<number>(order.shipping_cost_lak || 0);
  const [serviceFeeLAK, setServiceFeeLAK] = useState<number>(order.service_fee_lak || 0);
  const [weightKg, setWeightKg] = useState<number>(order.weight_kg || 1);
  const [notes, setNotes] = useState<string>(order.notes || '');
  const [arrivedDate, setArrivedDate] = useState<string>(
    order.arrived_date || new Date().toISOString().split('T')[0]
  );
  const [copied, setCopied] = useState(false);

  // Live recalculation
  const totalCostLAK = calculateTotalCostLAK(order.product_cost_lak, shippingCostLAK, serviceFeeLAK);
  const balanceDueLAK = calculateBalanceDueLAK(totalCostLAK, order.deposit_lak);

  const handleSave = () => {
    const updated: Order = {
      ...order,
      shipping_cost_lak: Number(shippingCostLAK) || 0,
      service_fee_lak: Number(serviceFeeLAK) || 0,
      total_cost_lak: totalCostLAK,
      balance_due_lak: balanceDueLAK,
      weight_kg: Number(weightKg) || 0,
      arrived_date: arrivedDate,
      status: 'arrived_laos',
      notes: notes,
      updated_at: new Date().toISOString(),
    };
    onSave(updated);
  };

  const handleCopyArrivalNotice = () => {
    const previewOrder: Order = {
      ...order,
      shipping_cost_lak: Number(shippingCostLAK) || 0,
      service_fee_lak: Number(serviceFeeLAK) || 0,
      total_cost_lak: totalCostLAK,
      balance_due_lak: balanceDueLAK,
      status: 'arrived_laos',
    };
    const text = generateCustomerMessage(previewOrder, 'arrived');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neon/15 text-neon flex items-center justify-center border border-neon/30">
              <PackageCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                ເຊັກອິນເຄື່ອງຮອດສາງລາວ 🇱🇦
              </h3>
              <p className="text-[11px] font-mono text-neon">{order.tracking_code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
          {/* Order Snapshot */}
          <div className="p-3 rounded-xl bg-background border border-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">👤 ລູກຄ້າ:</span>
              <span className="font-bold text-slate-200">{order.customer_name} ({order.customer_phone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">🛒 ສິນຄ້າ:</span>
              <span className="text-slate-200 truncate max-w-[200px]">{order.product_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">💵 ຕົ້ນທຶນສິນຄ້າ:</span>
              <span className="font-semibold text-slate-100">{formatLAK(order.product_cost_lak)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">💳 ມັດຈຳແລ້ວ:</span>
              <span className="font-semibold text-emerald-400">-{formatLAK(order.deposit_lak)}</span>
            </div>
          </div>

          {/* Input: Shipping Fee in LAK */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>🚚 ຄ່າຂົນສົ່ງມາລາວ (ປ້ອນເປັນເງິນກີບ LAK) *</span>
              <span className="text-[10px] text-neon font-normal">ຈີນ/ໄທ ➔ ລາວ</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1000"
                value={shippingCostLAK || ''}
                onChange={(e) => setShippingCostLAK(Number(e.target.value))}
                placeholder="ເຊັ່ນ: 45000"
                className="w-full px-3.5 py-2.5 bg-background border border-slate-700 rounded-xl text-base font-bold text-neon focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                autoFocus
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                LAK (ກີບ)
              </span>
            </div>
          </div>

          {/* Row: Weight and Date */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">⚖️ ນ້ຳໜັກ (Kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={weightKg || ''}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">📅 ວັນທີຮອດສາງ</label>
              <input
                type="date"
                value={arrivedDate}
                onChange={(e) => setArrivedDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">📝 ໝາຍເຫດເພີ່ມເຕີມ</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ເຊັ່ນ: ກ່ອງໃຫຍ່, ຝາກສາຂາດົງໂດກ"
              className="w-full px-3 py-2 bg-background border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
            />
          </div>

          {/* Calculated Summary Box */}
          <div className="p-3.5 rounded-xl bg-neon/5 border border-neon/30 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>ຕົ້ນທຶນລວມສຸດທິ (Total):</span>
              <span className="font-bold text-slate-100">{formatLAK(totalCostLAK)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>ຫັກມັດຈຳ:</span>
              <span className="text-emerald-400">-{formatLAK(order.deposit_lak)}</span>
            </div>
            <div className="pt-2 border-t border-neon/20 flex justify-between items-center">
              <span className="text-xs font-bold text-neon">🔥 ຍອດ COD ທີ່ຕ້ອງເກັບ:</span>
              <span className="text-lg font-black text-neon neon-glow-text">
                {formatLAK(balanceDueLAK)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={handleCopyArrivalNotice}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
              copied
                ? 'bg-neon/20 text-neon border-neon'
                : 'bg-surface text-slate-300 border-slate-700 hover:text-neon hover:border-neon'
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'ກັອບປີ້ແລ້ວ!' : 'ກັອບປີ້ຂໍ້ຄວາມແຈ້ງລູກຄ້າ'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-3 rounded-xl neon-button text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Check size={16} />
            ບັນທຶກຮອດລາວ
          </button>
        </div>
      </div>
    </div>
  );
};
