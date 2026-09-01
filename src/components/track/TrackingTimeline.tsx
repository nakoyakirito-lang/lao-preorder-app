'use client';

import React from 'react';
import { OrderStatus } from '@/types/database';
import { CheckCircle2, Clock, Truck, Package, Home, Check } from 'lucide-react';

interface TrackingTimelineProps {
  status: OrderStatus;
  orderDate: string;
  arrivedDate?: string;
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  status,
  orderDate,
  arrivedDate,
}) => {
  const steps = [
    {
      id: 'ordered',
      title: 'ສັ່ງຊື້ສິນຄ້າແລ້ວ',
      desc: orderDate || 'ຮອດລະບົບ',
      icon: Package,
    },
    {
      id: 'in_transit',
      title: 'ກຳລັງເດີນທາງມາລາວ',
      desc: 'ຂົນສົ່ງລະຫວ່າງປະເທດ',
      icon: Truck,
    },
    {
      id: 'arrived_laos',
      title: 'ຮອດສາງລາວແລ້ວ 🇱🇦',
      desc: arrivedDate ? `ຮອດວັນທີ: ${arrivedDate}` : 'ກຽມຈັດສົ່ງ',
      icon: Home,
    },
    {
      id: 'delivering',
      title: 'ກຳລັງຈັດສົ່ງປາຍທາງ',
      desc: 'ສົ່ງຂົນສົ່ງໃນລາວ',
      icon: Truck,
    },
    {
      id: 'completed',
      title: 'ສຳເລັດ / ຮັບເຄື່ອງແລ້ວ',
      desc: 'ປິດລາຍການ',
      icon: CheckCircle2,
    },
  ];

  const statusOrder: OrderStatus[] = [
    'ordered',
    'in_transit',
    'arrived_laos',
    'delivering',
    'completed',
  ];

  const currentStepIndex = statusOrder.indexOf(status);

  return (
    <div className="py-2">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {steps.map((step, idx) => {
          const isDone = currentStepIndex >= idx;
          const isCurrent = currentStepIndex === idx;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative flex items-start gap-3">
              {/* Step indicator circle */}
              <div
                className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                  isCurrent
                    ? 'bg-neon text-black font-black shadow-neon animate-pulse ring-4 ring-neon/20'
                    : isDone
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-slate-900 border border-slate-700 text-slate-500'
                }`}
              >
                {isDone ? <Check size={13} className="stroke-[3]" /> : idx + 1}
              </div>

              {/* Text */}
              <div className="min-w-0">
                <h4
                  className={`text-xs font-bold leading-tight ${
                    isCurrent
                      ? 'text-neon text-sm'
                      : isDone
                      ? 'text-slate-100'
                      : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
