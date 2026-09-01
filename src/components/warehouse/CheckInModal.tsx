'use client';

import React, { useState } from 'react';
import { Order, DELIVERY_PROVIDERS } from '@/types/database';
import { formatLAK, calculateTotalCostLAK, calculateBalanceDueLAK } from '@/lib/calculations';
import { generateCustomerMessage } from '@/lib/messageGenerator';
import { ImageUpload } from '@/components/ImageUpload';
import {
  X,
  Check,
  Copy,
  PackageCheck,
  AlertCircle,
  Edit3,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ExternalLink,
  User,
  MapPin,
  Tag,
} from 'lucide-react';

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
  // Shipping & Arrival State
  const [shippingCostLAK, setShippingCostLAK] = useState<number>(order.shipping_cost_lak || 0);
  const [serviceFeeLAK, setServiceFeeLAK] = useState<number>(order.service_fee_lak || 0);
  const [weightKg, setWeightKg] = useState<number>(order.weight_kg || 1);
  const [notes, setNotes] = useState<string>(order.notes || '');
  const [arrivedDate, setArrivedDate] = useState<string>(
    order.arrived_date || new Date().toISOString().split('T')[0]
  );

  // Editable Order Details State
  const [isEditing, setIsEditing] = useState(false);
  const [orderDate, setOrderDate] = useState(order.order_date || new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState(order.customer_name);
  const [customerPhone, setCustomerPhone] = useState(order.customer_phone);
  const [productName, setProductName] = useState(order.product_name);
  const [productUrl, setProductUrl] = useState(order.product_url || '');
  const [productCostLAK, setProductCostLAK] = useState<number>(order.product_cost_lak);
  const [depositLAK, setDepositLAK] = useState<number>(order.deposit_lak || 0);
  const [deliveryProvider, setDeliveryProvider] = useState(order.delivery_provider);
  const [deliveryBranch, setDeliveryBranch] = useState(order.delivery_branch);
  const [foreignTrackingNo, setForeignTrackingNo] = useState(order.foreign_tracking_no || '');
  const [productImageUrl, setProductImageUrl] = useState(order.product_image_url || '');
  const [customerSocialImage, setCustomerSocialImage] = useState(order.customer_social_image || '');

  const [copied, setCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Live recalculation
  const effectiveProductCostLAK = Number(productCostLAK) || 0;
  const effectiveDepositLAK = Number(depositLAK) || 0;
  const totalCostLAK = calculateTotalCostLAK(effectiveProductCostLAK, shippingCostLAK, serviceFeeLAK);
  const balanceDueLAK = calculateBalanceDueLAK(totalCostLAK, effectiveDepositLAK);

  const handleSave = () => {
    const updated: Order = {
      ...order,
      order_date: orderDate,
      customer_name: customerName,
      customer_phone: customerPhone,
      product_name: productName,
      product_url: productUrl,
      product_cost_lak: effectiveProductCostLAK,
      deposit_lak: effectiveDepositLAK,
      delivery_provider: deliveryProvider,
      delivery_branch: deliveryBranch,
      foreign_tracking_no: foreignTrackingNo,
      product_image_url: productImageUrl,
      customer_social_image: customerSocialImage,
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
      customer_name: customerName,
      product_name: productName,
      delivery_provider: deliveryProvider,
      delivery_branch: deliveryBranch,
      product_cost_lak: effectiveProductCostLAK,
      deposit_lak: effectiveDepositLAK,
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-surface border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
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
          {/* Images Row: Product Photo & Customer Chat Image */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Product Image Card */}
            <div className="p-2 bg-background rounded-2xl border border-slate-800 flex flex-col items-center justify-center relative group">
              <span className="text-[10px] font-bold text-slate-400 mb-1">
                📸 ຮູບສິນຄ້າ
              </span>
              <div
                onClick={() => productImageUrl && setPreviewImage(productImageUrl)}
                className="w-full h-24 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center cursor-pointer hover:border-neon transition-all"
              >
                {productImageUrl ? (
                  <img
                    src={productImageUrl}
                    alt="Product"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <span className="text-[10px] text-slate-500">ບໍ່ມີຮູບສິນຄ້າ</span>
                )}
              </div>
            </div>

            {/* Customer Chat / Profile Image Card */}
            <div className="p-2 bg-background rounded-2xl border border-slate-800 flex flex-col items-center justify-center relative group">
              <span className="text-[10px] font-bold text-slate-400 mb-1">
                👤 ຮູບແຊັດ/FB ລູກຄ້າ
              </span>
              <div
                onClick={() => customerSocialImage && setPreviewImage(customerSocialImage)}
                className="w-full h-24 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center cursor-pointer hover:border-neon transition-all"
              >
                {customerSocialImage ? (
                  <img
                    src={customerSocialImage}
                    alt="Customer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <span className="text-[10px] text-slate-500">ບໍ່ມີຮູບແຊັດ</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Snapshot / Edit Toggle */}
          <div className="p-3 rounded-2xl bg-background border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-200 truncate">
                {productName}
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-[11px] font-bold text-neon hover:underline flex items-center gap-1 flex-shrink-0"
              >
                <Edit3 size={13} />
                {isEditing ? 'ປິດແກ້ໄຂ' : 'ແກ້ໄຂລາຍການ'}
                {isEditing ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            {/* Basic Info view when not editing */}
            {!isEditing ? (
              <div className="text-xs space-y-1 pt-1 border-t border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">👤 ລູກຄ້າ:</span>
                  <span className="font-bold text-slate-200">
                    {customerName} ({customerPhone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">📍 ປາຍທາງ:</span>
                  <span className="text-slate-300">
                    {deliveryProvider}: {deliveryBranch || 'ສາຂາຫຼັກ'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">💵 ຕົ້ນທຶນສິນຄ້າ:</span>
                  <span className="font-semibold text-slate-100">
                    {formatLAK(effectiveProductCostLAK)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">💳 ມັດຈຳແລ້ວ:</span>
                  <span className="font-semibold text-emerald-400">
                    -{formatLAK(effectiveDepositLAK)}
                  </span>
                </div>
              </div>
            ) : (
              /* Extended Edit Form Fields */
              <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    ຊື່ສິນຄ້າ / ລາຍລະອຽດ
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    🔗 ລິ້ງສັ່ງສິນຄ້າ (URL)
                  </label>
                  <input
                    type="url"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      📅 ວັນທີສັ່ງຊື້ (Order Date)
                    </label>
                    <input
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      ເລກແທຣັກຕົ້ນທາງ (ຈີນ/ໄທ)
                    </label>
                    <input
                      type="text"
                      value={foreignTrackingNo}
                      onChange={(e) => setForeignTrackingNo(e.target.value)}
                      placeholder="SF... / TH..."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      ຕົ້ນທຶນສິນຄ້າ (LAK)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={productCostLAK}
                      onChange={(e) => setProductCostLAK(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-100 focus:border-neon focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      ມັດຈຳແລ້ວ (LAK)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={depositLAK}
                      onChange={(e) => setDepositLAK(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 focus:border-neon focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      ຊື່ລູກຄ້າ
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      ເບີໂທ
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      ຂົນສົ່ງໃນລາວ
                    </label>
                    <select
                      value={deliveryProvider}
                      onChange={(e) => setDeliveryProvider(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                    >
                      {DELIVERY_PROVIDERS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameLao}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      ສາຂາປາຍທາງ
                    </label>
                    <input
                      type="text"
                      value={deliveryBranch}
                      onChange={(e) => setDeliveryBranch(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-neon focus:outline-none"
                    />
                  </div>
                </div>

                {/* Optional Image replacements */}
                <ImageUpload
                  label="📸 ປ່ຽນຮູບສິນຄ້າ"
                  value={productImageUrl}
                  onChange={setProductImageUrl}
                />
                <ImageUpload
                  label="👤 ປ່ຽນຮູບແຊັດລູກຄ້າ"
                  value={customerSocialImage}
                  onChange={setCustomerSocialImage}
                  aspectRatio="wide"
                />
              </div>
            )}
          </div>

          {/* Primary Input: Shipping Fee in LAK */}
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
          <div className="p-3.5 rounded-2xl bg-neon/5 border border-neon/30 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>ຕົ້ນທຶນລວມສຸດທິ (Total):</span>
              <span className="font-bold text-slate-100">{formatLAK(totalCostLAK)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>ຫັກມັດຈຳ:</span>
              <span className="text-emerald-400">-{formatLAK(effectiveDepositLAK)}</span>
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
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all ${
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
            className="flex-1 py-2.5 px-3 rounded-2xl neon-button text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Check size={16} />
            ບັນທຶກຮອດລາວ
          </button>
        </div>
      </div>

      {/* Image Preview Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-lg max-h-[85vh] rounded-2xl overflow-hidden border border-slate-700">
            <img src={previewImage} alt="Fullscreen Preview" className="w-full h-full object-contain" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
