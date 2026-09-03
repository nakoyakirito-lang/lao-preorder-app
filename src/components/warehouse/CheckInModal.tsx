'use client';

import React, { useState } from 'react';
import { Order, DELIVERY_PROVIDERS, LAO_PROVINCES, ServiceType } from '@/types/database';
import {
  formatLAK,
  calculateTotalCostLAK,
  calculateBalanceDueLAK,
  calculateOrderProfitLAK,
} from '@/lib/calculations';
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
  TrendingUp,
  DollarSign,
  Sparkles,
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
  // Service Type
  const [serviceType, setServiceType] = useState<ServiceType>(
    order.service_type || 'BUY_FOR_YOU'
  );

  // Status & Arrival State
  const [currentStatus, setCurrentStatus] = useState<Order['status']>(
    order.status || 'arrived_laos'
  );
  // Shipping: Charged to Customer vs Actual Cost to Logistics
  const [shippingCostLAK, setShippingCostLAK] = useState<number>(
    order.shipping_cost_lak || 0
  );
  const [actualShippingCostLAK, setActualShippingCostLAK] = useState<number>(
    order.actual_shipping_cost_lak || 0
  );
  const [serviceFeeLAK, setServiceFeeLAK] = useState<number>(order.service_fee_lak || 0);
  const [weightKg, setWeightKg] = useState<number>(order.weight_kg || 1);
  const [notes, setNotes] = useState<string>(order.notes || '');
  const [arrivedDate, setArrivedDate] = useState<string>(
    order.arrived_date || new Date().toISOString().split('T')[0]
  );

  // Editable Order Details State
  const [isEditing, setIsEditing] = useState(false);
  const [orderDate, setOrderDate] = useState(
    order.order_date || new Date().toISOString().split('T')[0]
  );
  const [customerName, setCustomerName] = useState(order.customer_name);
  const [customerPhone, setCustomerPhone] = useState(order.customer_phone);
  const [productName, setProductName] = useState(order.product_name);
  const [productUrl, setProductUrl] = useState(order.product_url || '');
  const [productCostLAK, setProductCostLAK] = useState<number>(order.product_cost_lak);
  const [sellingPriceLAK, setSellingPriceLAK] = useState<number>(
    order.selling_price_lak || order.product_cost_lak
  );
  const [depositLAK, setDepositLAK] = useState<number>(order.deposit_lak || 0);
  const [deliveryProvider, setDeliveryProvider] = useState(order.delivery_provider);
  const [deliveryProvince, setDeliveryProvince] = useState(
    order.delivery_province || LAO_PROVINCES[0]
  );
  const [deliveryBranch, setDeliveryBranch] = useState(order.delivery_branch);
  const [foreignTrackingNo, setForeignTrackingNo] = useState(
    order.foreign_tracking_no || ''
  );
  const [productImageUrl, setProductImageUrl] = useState(order.product_image_url || '');
  const [customerSocialImage, setCustomerSocialImage] = useState(
    order.customer_social_image || ''
  );

  const [copied, setCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Live recalculation
  const effectiveProductCostLAK = Number(productCostLAK) || 0;
  const effectiveDepositLAK = Number(depositLAK) || 0;
  const effectiveShippingCharged = Number(shippingCostLAK) || 0;
  const effectiveActualShipping = Number(actualShippingCostLAK) || 0;

  // Customer Total & COD
  const customerBaseCost =
    serviceType === 'PREORDER' && sellingPriceLAK > 0
      ? Number(sellingPriceLAK)
      : effectiveProductCostLAK;

  const totalCostLAK = calculateTotalCostLAK(
    customerBaseCost,
    effectiveShippingCharged,
    serviceFeeLAK
  );
  const balanceDueLAK = calculateBalanceDueLAK(totalCostLAK, effectiveDepositLAK);

  // Net Profit for Shop
  const shippingProfitLAK =
    effectiveActualShipping > 0
      ? Math.max(0, effectiveShippingCharged - effectiveActualShipping)
      : 0;

  const profitLAK = calculateOrderProfitLAK({
    service_type: serviceType,
    origin_cost: order.origin_cost,
    exchange_rate: order.exchange_rate,
    real_exchange_rate: order.real_exchange_rate,
    product_cost_lak: effectiveProductCostLAK,
    selling_price_lak: sellingPriceLAK,
    shipping_cost_lak: effectiveShippingCharged,
    actual_shipping_cost_lak: effectiveActualShipping,
    service_fee_lak: serviceFeeLAK,
  });

  const handleSave = () => {
    const updated: Order = {
      ...order,
      service_type: serviceType,
      order_date: orderDate,
      customer_name: customerName,
      customer_phone: customerPhone,
      product_name: productName,
      product_url: productUrl,
      product_cost_lak: effectiveProductCostLAK,
      selling_price_lak: sellingPriceLAK,
      deposit_lak: effectiveDepositLAK,
      delivery_provider: deliveryProvider,
      delivery_province: deliveryProvince,
      delivery_branch: deliveryBranch,
      foreign_tracking_no: foreignTrackingNo,
      product_image_url: productImageUrl,
      customer_social_image: customerSocialImage,
      shipping_cost_lak: effectiveShippingCharged,
      actual_shipping_cost_lak: effectiveActualShipping,
      service_fee_lak: Number(serviceFeeLAK) || 0,
      total_cost_lak: totalCostLAK,
      balance_due_lak: balanceDueLAK,
      profit_lak: profitLAK,
      weight_kg: Number(weightKg) || 0,
      arrived_date: arrivedDate,
      status: currentStatus,
      notes: notes,
      updated_at: new Date().toISOString(),
    };
    onSave(updated);
  };

  const handleCopyArrivalNotice = () => {
    const previewOrder: Order = {
      ...order,
      service_type: serviceType,
      customer_name: customerName,
      product_name: productName,
      delivery_provider: deliveryProvider,
      delivery_branch: deliveryBranch,
      product_cost_lak: effectiveProductCostLAK,
      deposit_lak: effectiveDepositLAK,
      shipping_cost_lak: effectiveShippingCharged,
      service_fee_lak: Number(serviceFeeLAK) || 0,
      total_cost_lak: totalCostLAK,
      balance_due_lak: balanceDueLAK,
      status: currentStatus,
    };
    const msgType =
      currentStatus === 'arrived_laos'
        ? 'arrived'
        : currentStatus === 'delivering'
        ? 'delivering'
        : 'order_created';
    const text = generateCustomerMessage(previewOrder, msgType);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <PackageCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ລາຍລະອຽດ & ເຊັກອິນພັດສະດຸ
              </h3>
              <p className="text-[11px] font-mono text-slate-600 font-bold">{order.tracking_code}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Status Selector in Modal Header */}
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value as Order['status'])}
              className="text-xs font-bold py-1 px-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none cursor-pointer shadow-sm"
            >
              <option value="ordered">📦 ສັ່ງຊື້ແລ້ວ</option>
              <option value="in_transit">🚚 ກຳລັງມາລາວ</option>
              <option value="arrived_laos">🏢 ຮອດສາງລາວ</option>
              <option value="delivering">🛵 ກຳລັງຈັດສົ່ງ</option>
              <option value="completed">✅ ສຳເລັດ/ຈ່າຍແລ້ວ</option>
              <option value="cancelled">❌ ຍົກເລີກ/ຕີກັບ</option>
            </select>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 bg-white">
          {/* Service Mode Selector Badge */}
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-600">ປະເພດບໍລິການ:</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setServiceType('BUY_FOR_YOU')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  serviceType === 'BUY_FOR_YOU'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                📦 ຮັບສັ່ງເຄື່ອງ (Proxy)
              </button>
              <button
                type="button"
                onClick={() => setServiceType('PREORDER')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  serviceType === 'PREORDER'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🏷️ ພຣີອໍເດີ (Retail)
              </button>
            </div>
          </div>

          {/* Images Row: Product Photo & Customer Chat Image */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Product Image Card */}
            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative group">
              <span className="text-[10px] font-bold text-slate-600 mb-1">
                📸 ຮູບສິນຄ້າ
              </span>
              <div
                onClick={() => productImageUrl && setPreviewImage(productImageUrl)}
                className="w-full h-24 rounded-xl bg-white border border-slate-300 overflow-hidden flex items-center justify-center cursor-pointer hover:border-slate-900 transition-all shadow-sm"
              >
                {productImageUrl ? (
                  <img
                    src={productImageUrl}
                    alt="Product"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400">ບໍ່ມີຮູບສິນຄ້າ</span>
                )}
              </div>
            </div>

            {/* Customer Chat / Profile Image Card */}
            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative group">
              <span className="text-[10px] font-bold text-slate-600 mb-1">
                👤 ຮູບແຊັດ/FB ລູກຄ້າ
              </span>
              <div
                onClick={() => customerSocialImage && setPreviewImage(customerSocialImage)}
                className="w-full h-24 rounded-xl bg-white border border-slate-300 overflow-hidden flex items-center justify-center cursor-pointer hover:border-slate-900 transition-all shadow-sm"
              >
                {customerSocialImage ? (
                  <img
                    src={customerSocialImage}
                    alt="Customer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400">ບໍ່ມີຮູບແຊັດ</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Snapshot / Edit Toggle */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-900 truncate">
                {productName}
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-[11px] font-bold text-slate-900 hover:underline flex items-center gap-1 flex-shrink-0"
              >
                <Edit3 size={13} />
                {isEditing ? 'ປິດແກ້ໄຂ' : 'ແກ້ໄຂລາຍການ'}
                {isEditing ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            {/* Basic Info view when not editing */}
            {!isEditing ? (
              <div className="text-xs space-y-1 pt-1 border-t border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">👤 ລູກຄ້າ:</span>
                  <span className="font-bold text-slate-900">
                    {customerName} ({customerPhone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">📍 ປາຍທາງ:</span>
                  <span className="text-slate-800">
                    {deliveryProvider}: {deliveryProvince ? `${deliveryProvince} - ` : ''}{deliveryBranch || 'ສາຂາຫຼັກ'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">💵 ຕົ້ນທຶນສິນຄ້າ:</span>
                  <span className="font-semibold text-slate-900">
                    {formatLAK(effectiveProductCostLAK)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">💳 ມັດຈຳແລ້ວ:</span>
                  <span className="font-semibold text-emerald-600">
                    -{formatLAK(effectiveDepositLAK)}
                  </span>
                </div>
              </div>
            ) : (
              /* Extended Edit Form Fields */
              <div className="space-y-2.5 pt-2 border-t border-slate-200 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      📅 ວັນທີສັ່ງຊື້ (Order Date)
                    </label>
                    <input
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      ເລກແທຣັກຕົ້ນທາງ (ຈີນ/ໄທ)
                    </label>
                    <input
                      type="text"
                      value={foreignTrackingNo}
                      onChange={(e) => setForeignTrackingNo(e.target.value)}
                      placeholder="SF... / TH..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    ຊື່ສິນຄ້າ / ລາຍລະອຽດ
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    🔗 ລິ້ງສັ່ງສິນຄ້າ (URL)
                  </label>
                  <input
                    type="url"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      ຕົ້ນທຶນສິນຄ້າ (LAK)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={productCostLAK}
                      onChange={(e) => setProductCostLAK(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      ມັດຈຳແລ້ວ (LAK)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={depositLAK}
                      onChange={(e) => setDepositLAK(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-emerald-600 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      ຊື່ລູກຄ້າ
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      ເບີໂທ
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      ຂົນສົ່ງໃນລາວ
                    </label>
                    <select
                      value={deliveryProvider}
                      onChange={(e) => setDeliveryProvider(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    >
                      {DELIVERY_PROVIDERS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameLao}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      ແຂວງ (Province)
                    </label>
                    <select
                      value={deliveryProvince}
                      onChange={(e) => setDeliveryProvince(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-slate-900 focus:outline-none"
                    >
                      {LAO_PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      ສາຂາ / ບ້ານ / ຈຸດຮັບ
                    </label>
                    <input
                      type="text"
                      value={deliveryBranch}
                      onChange={(e) => setDeliveryBranch(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
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

          {/* Dual Shipping Inputs: Charged to Customer vs Actual Cost */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                🚚 ຄ່າຂົນສົ່ງມາລາວ (Shipping Fee)
              </span>
              <span className="text-[10px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                {serviceType === 'BUY_FOR_YOU' ? 'ຮັບສັ່ງເຄື່ອງ' : 'ພຣີອໍເດີ'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Field 1: Charged to Customer */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-900 flex items-center justify-between">
                  <span>ຄ່າສົ່ງເກັບລູກຄ້າ *</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={shippingCostLAK || ''}
                    onChange={(e) => setShippingCostLAK(Number(e.target.value))}
                    placeholder="ເຊັ່ນ: 80000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    autoFocus
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                    ກີບ
                  </span>
                </div>
              </div>

              {/* Field 2: Actual Cost to Logistics (Admin Only) */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                  <span>ຕົ້ນທຶນສົ່ງຈິງ (ຮ້ານຈ່າຍ)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={actualShippingCostLAK || ''}
                    onChange={(e) => setActualShippingCostLAK(Number(e.target.value))}
                    placeholder="ເຊັ່ນ: 50000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                    ກີບ
                  </span>
                </div>
              </div>
            </div>

            {/* Live Profit Preview on Shipping */}
            {effectiveShippingCharged > 0 && effectiveActualShipping > 0 && (
              <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <TrendingUp size={14} />
                  ກຳໄລສ່ວນຕ່າງຄ່າສົ່ງ:
                </span>
                <span className="font-extrabold text-emerald-700">
                  +{formatLAK(shippingProfitLAK)}
                </span>
              </div>
            )}
          </div>

          {/* Row: Weight and Date */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">⚖️ ນ້ຳໜັກ (Kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={weightKg || ''}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">📅 ວັນທີຮອດສາງ</label>
              <input
                type="date"
                value={arrivedDate}
                onChange={(e) => setArrivedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">📝 ໝາຍເຫດເພີ່ມເຕີມ</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ເຊັ່ນ: ກ່ອງໃຫຍ່, ຝາກສາຂາດົງໂດກ"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
            />
          </div>

          {/* Calculated Summary Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-sm">
            <div className="flex justify-between text-xs text-slate-700">
              <span>ຍອດລວມເກັບລູກຄ້າ (Total):</span>
              <span className="font-bold text-slate-900">{formatLAK(totalCostLAK)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-700">
              <span>ຫັກມັດຈຳ:</span>
              <span className="text-emerald-600 font-semibold">-{formatLAK(effectiveDepositLAK)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-900">🔥 ຍອດ COD ທີ່ຕ້ອງເກັບ:</span>
              <span className="text-lg font-black text-slate-900">
                {formatLAK(balanceDueLAK)}
              </span>
            </div>

            {/* Shop Profit Summary (Admin only view) */}
            <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-600 flex items-center gap-1 font-semibold">
                <Sparkles size={13} className="text-amber-500" />
                ກຳໄລສຸດທິຂອງຮ້ານ (Profit):
              </span>
              <span className="font-bold text-emerald-700">
                +{formatLAK(profitLAK)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer & Notification Actions */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-2">
          {/* Arrived WhatsApp Notification Button */}
          {customerPhone && (
            <a
              href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                generateCustomerMessage(
                  {
                    ...order,
                    service_type: serviceType,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    product_name: productName,
                    delivery_provider: deliveryProvider,
                    delivery_province: deliveryProvince,
                    delivery_branch: deliveryBranch,
                    product_cost_lak: effectiveProductCostLAK,
                    selling_price_lak: sellingPriceLAK,
                    deposit_lak: effectiveDepositLAK,
                    shipping_cost_lak: effectiveShippingCharged,
                    service_fee_lak: Number(serviceFeeLAK) || 0,
                    total_cost_lak: totalCostLAK,
                    balance_due_lak: balanceDueLAK,
                    status: currentStatus,
                  },
                  'arrived'
                )
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <span>📢 ສົ່ງ WhatsApp ແຈ້ງລູກຄ້າວ່າຂອງຮອດລາວແລ້ວ! 🇱🇦</span>
            </a>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyArrivalNotice}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all ${
                copied
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:text-slate-900 hover:border-slate-900 shadow-sm'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'ກັອບປີ້ແລ້ວ!' : 'ກັອບປີ້ຂໍ້ຄວາມແຈ້ງລູກຄ້າ'}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <Check size={16} />
              ບັນທຶກຂໍ້ມູນ
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-lg max-h-[85vh] rounded-2xl overflow-hidden border border-slate-700">
            <img
              src={previewImage}
              alt="Fullscreen Preview"
              className="w-full h-full object-contain"
            />
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
