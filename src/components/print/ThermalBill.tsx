'use client';

import React from 'react';
import { Order, ShopSettings } from '@/types/database';
import { formatLAK, formatForeignCurrency } from '@/lib/calculations';

interface ThermalBillProps {
  order: Order;
  settings: ShopSettings;
  paperWidth?: '80mm' | '100mm';
}

export const ThermalBill: React.FC<ThermalBillProps> = ({
  order,
  settings,
  paperWidth = '100mm',
}) => {
  const is100mm = paperWidth === '100mm';
  const isChina = order.route === 'CHINA_LAOS';

  return (
    <div
      className={`thermal-slip bg-white text-black p-4 mx-auto border border-dashed border-gray-300 print:border-none font-sans ${
        is100mm ? 'w-[100mm] min-h-[140mm]' : 'w-[80mm] min-h-[120mm]'
      }`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <h1 className="font-extrabold text-base tracking-tight uppercase leading-tight">
          {settings.shop_name || 'LAO PREORDER EXPRESS'}
        </h1>
        <p className="text-[11px] font-semibold text-gray-700">
          {settings.address}
        </p>
        <p className="text-[11px] font-bold">
          ໂທ / WhatsApp: {settings.phone}
        </p>
      </div>

      {/* Bill Type & Route Banner */}
      <div className="my-2 bg-black text-white text-center py-1 px-2 rounded flex items-center justify-between">
        <span className="font-black text-xs">
          {isChina ? '🇨🇳 ຈີນ ➔ ລາວ 🇱🇦' : '🇹🇭 ໄທ ➔ ລາວ 🇱🇦'}
        </span>
        <span className="font-mono font-black text-xs">
          {order.tracking_code}
        </span>
      </div>

      {/* Foreign Tracking # if any */}
      {order.foreign_tracking_no && (
        <div className="text-[10px] text-gray-800 font-mono mb-1">
          ເລກແທຣັກຕົ້ນທາງ: <span className="font-bold">{order.foreign_tracking_no}</span>
        </div>
      )}

      {/* Receiver / Delivery Destination Box */}
      <div className="border-2 border-black rounded p-2 my-2 bg-gray-50">
        <div className="text-[10px] font-bold text-gray-600 uppercase">
          📦 ຜູ້ຮັບ & ຂົນສົ່ງປາຍທາງ:
        </div>
        <div className="text-sm font-extrabold text-black mt-0.5">
          {order.customer_name}
        </div>
        <div className="text-xs font-bold text-black">
          ໂທ: {order.customer_phone}
        </div>
        <div className="text-xs font-bold text-red-700 mt-1 pt-1 border-t border-gray-300">
          📍 {order.delivery_provider}: {order.delivery_province ? `${order.delivery_province} - ` : ''}{order.delivery_branch || 'ສາຂາຫຼັກ'}
        </div>
      </div>

      {/* Product Details */}
      <div className="my-2 text-xs">
        <div className="font-bold text-gray-800">
          🛒 ລາຍການສິນຄ້າ:
        </div>
        <div className="font-medium text-gray-900 mt-0.5">
          {order.product_name}
        </div>
      </div>

      {/* Financial Table */}
      <div className="border-t-2 border-b-2 border-black py-2 my-2 text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-700">1. ຄ່າສິນຄ້າ:</span>
          <span className="font-bold">{formatLAK(order.product_cost_lak)}</span>
        </div>

        {order.shipping_cost_lak > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-700">2. ຄ່າຂົນສົ່ງມາລາວ:</span>
            <span className="font-bold">{formatLAK(order.shipping_cost_lak)}</span>
          </div>
        )}

        {order.service_fee_lak > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-700">3. ຄ່າບໍລິການ:</span>
            <span className="font-bold">{formatLAK(order.service_fee_lak)}</span>
          </div>
        )}

        <div className="flex justify-between pt-1 border-t border-dashed border-gray-400 font-semibold">
          <span>ຍອດລວມທັງໝົດ:</span>
          <span>{formatLAK(order.total_cost_lak)}</span>
        </div>

        {order.deposit_lak > 0 && (
          <div className="flex justify-between text-green-800">
            <span>ຫັກມັດຈຳທີ່ຈ່າຍແລ້ວ:</span>
            <span className="font-bold">-{formatLAK(order.deposit_lak)}</span>
          </div>
        )}
      </div>

      {/* Big Prominent Total Balance Due (COD) */}
      <div className="bg-black text-white p-2.5 rounded my-2 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
            ຍອດເກັບເງິນປາຍທາງ (COD)
          </div>
          <div className="text-lg font-black tracking-tight">
            {formatLAK(order.balance_due_lak)}
          </div>
        </div>
        <div className="text-right text-[10px] font-bold text-gray-300">
          {order.balance_due_lak === 0 ? 'ຈ່າຍແລ້ວ ✅' : 'ເກັບເງິນປາຍທາງ'}
        </div>
      </div>

      {/* Footer Notes */}
      <div className="text-center text-[10px] text-gray-600 mt-2 pt-2 border-t border-gray-300">
        <p className="font-medium">{settings.slip_footer}</p>
        <p className="text-[9px] text-gray-400 mt-1">
          ວັນທີພິມບິນ: {new Date().toLocaleString('lo-LA')}
        </p>
      </div>
    </div>
  );
};
