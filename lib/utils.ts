import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert numbers to Bengali digits if needed or use Intl bn-BD
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '৳ 0';
  const formatted = new Intl.NumberFormat('bn-BD', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `৳ ${formatted}`;
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return 'প্রযোজ্য নয়';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'প্রযোজ্য নয়';
  return d.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function generateOrderNumber(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `TRL-${randomNum}`;
}

export const ORDER_STATUS_MAP: Record<string, { label: string; bg: string; text: string; border: string; hexBg: string; hexText: string }> = {
  pending: { label: 'অপেক্ষমাণ (পেন্ডিং)', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', hexBg: '#fffbeb', hexText: '#92400e' },
  cutting: { label: 'কাটিং চলছে', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', hexBg: '#eff6ff', hexText: '#1e40af' },
  sewing: { label: 'সেলাই চলছে', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', hexBg: '#faf5ff', hexText: '#6b21a8' },
  fitting: { label: 'ট্রায়াল / ফিটিং', bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', hexBg: '#f0fdf4', hexText: '#115e59' },
  ready: { label: 'ডেলিভারির জন্য তৈরি', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', hexBg: '#ecfdf5', hexText: '#065f46' },
  delivered: { label: 'ডেলিভারি সম্পন্ন', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', hexBg: '#f1f5f9', hexText: '#334155' },
  cancelled: { label: 'বাতিলকৃত', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', hexBg: '#fff1f2', hexText: '#9f1239' },
};

export function getOrderStatusLabel(status: string): string {
  if (!status) return 'অপেক্ষমাণ';
  const normalized = status.toLowerCase().trim();
  return ORDER_STATUS_MAP[normalized]?.label || status;
}

export function getOrderStatusStyle(status: string) {
  if (!status) return ORDER_STATUS_MAP.pending;
  const normalized = status.toLowerCase().trim();
  return ORDER_STATUS_MAP[normalized] || { label: status, bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', hexBg: '#f8fafc', hexText: '#1e293b' };
}
