'use client';

import React, { useState } from 'react';
import { OrderStatus } from '@/models/Order';
import { Clock, Scissors, CheckCircle2, PackageCheck, AlertCircle, ChevronDown } from 'lucide-react';
import { getOrderStatusLabel, getOrderStatusStyle } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  orderId?: string;
  onStatusChange?: (newStatus: OrderStatus) => void;
  interactive?: boolean;
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
  pending: { label: 'অপেক্ষমাণ', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: Clock },
  'in progress': { label: 'কাজ চলছে', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', icon: Scissors },
  cutting: { label: 'কাটিং চলছে', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', icon: Scissors },
  sewing: { label: 'সেলাই চলছে', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', icon: Scissors },
  fitting: { label: 'ট্রায়াল / ফিটিং', bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', icon: CheckCircle2 },
  'fitting ready': { label: 'ট্রায়াল প্রস্তুত', bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', icon: CheckCircle2 },
  ready: { label: 'ডেলিভারির জন্য তৈরি', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: PackageCheck },
  completed: { label: 'সেলাই সম্পন্ন', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: PackageCheck },
  delivered: { label: 'ডেলিভারি সম্পন্ন', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', icon: PackageCheck },
  cancelled: { label: 'বাতিলকৃত', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', icon: AlertCircle },
};

const SELECTABLE_STATUSES: { key: string; label: string }[] = [
  { key: 'Pending', label: 'অপেক্ষমাণ' },
  { key: 'In Progress', label: 'কাজ চলছে' },
  { key: 'Fitting Ready', label: 'ট্রায়াল প্রস্তুত' },
  { key: 'Completed', label: 'সেলাই সম্পন্ন' },
  { key: 'Delivered', label: 'ডেলিভারি সম্পন্ন' },
  { key: 'Cancelled', label: 'বাতিলকৃত' },
];

export default function StatusBadge({
  status,
  orderId,
  onStatusChange,
  interactive = false,
}: StatusBadgeProps) {
  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(status || 'Pending');

  const normalized = (currentStatus || 'pending').toLowerCase().trim();
  const config = STATUS_MAP[normalized] || {
    label: getOrderStatusLabel(currentStatus),
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  };
  const Icon = config.icon;

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    if (newStatus === currentStatus) return;

    setCurrentStatus(newStatus);
    if (onStatusChange) onStatusChange(newStatus);

    if (orderId) {
      setUpdating(true);
      try {
        await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (err) {
        console.error('Failed to update status', err);
      } finally {
        setUpdating(false);
      }
    }
  };

  if (!interactive || !orderId) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border} shadow-2xs`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {config.label}
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border ${config.bg} ${config.text} ${config.border} shadow-sm transition-all hover:brightness-95`}
      >
        {updating ? (
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          <Icon className="w-3.5 h-3.5 shrink-0" />
        )}
        <select
          value={currentStatus}
          onChange={handleChange}
          disabled={updating}
          className="bg-transparent focus:outline-none cursor-pointer pr-4 font-bold text-xs text-inherit appearance-none"
        >
          {SELECTABLE_STATUSES.map((st) => (
            <option key={st.key} value={st.key} className="text-slate-800 bg-white font-medium py-1">
              {st.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 pointer-events-none absolute right-2.5 text-current opacity-70" />
      </div>
    </div>
  );
}
