'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scissors,
  Printer,
  ArrowLeft,
  Camera,
  Download,
  CreditCard,
  Ruler,
  User,
  Phone,
  Calendar,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusStyle } from '@/lib/utils';
import { OrderStatus } from '@/models/Order';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const hiddenReceiptRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [additionalPayment, setAdditionalPayment] = useState<number | ''>('');
  const [generatingPhoto, setGeneratingPhoto] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const [orderRes, settingsRes] = await Promise.all([
        fetch(`/api/orders/${resolvedParams.id}`),
        fetch('/api/settings'),
      ]);
      const orderData = await orderRes.json();
      const settingsData = await settingsRes.json();

      if (orderData.success) {
        setOrder(orderData.order);
      }
      if (settingsData.success) {
        setSettings(settingsData.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [resolvedParams.id]);

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (additionalPayment === '' || Number(additionalPayment) <= 0) return;

    setUpdatingPayment(true);
    try {
      const res = await fetch(`/api/orders/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalPayment: Number(additionalPayment) }),
      });
      if (res.ok) {
        setAdditionalPayment('');
        fetchOrder();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingPayment(false);
    }
  };

  const shopName = settings?.shopName || 'থ্রেড এন্ড ক্রাফট টেইলরস';
  const tagline = settings?.tagline || 'বিসপোক টেইলর ও সেলাই ওয়ার্কশপ';
  const address = settings?.address || 'হাউজ ৪২, রোড ১১, বনানী / ধানমন্ডি, ঢাকা';
  const phone = settings?.phone || '+৮৮০ ১৭০০-০০০০০০';
  const terms = settings?.termsAndConditions || '১. সেলাইকৃত কাপড় পরিবর্তন বা ফেরতযোগ্য নহে।\n২. ট্রায়াল ও ডেলিভারির সময় এই রসিদ প্রদর্শন করুন।';
  const footerNote = settings?.footerNote || `${shopName} এ অর্ডার করার জন্য আপনাকে ধন্যবাদ!`;

  // Modern Screenshot PNG Generator
  const generateReceiptBlob = async (): Promise<{ blob: Blob; dataUrl: string }> => {
    if (!hiddenReceiptRef.current) throw new Error('Receipt container element not found');

    const dataUrl = await domToPng(hiddenReceiptRef.current, {
      scale: 2, // 2x HD Crisp resolution
      backgroundColor: '#ffffff',
      quality: 1.0,
    });

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return { blob, dataUrl };
  };

  // Direct Share Photo via Web Share API or download fallback
  const handleShareAsPhoto = async () => {
    if (!order) return;
    setGeneratingPhoto(true);

    try {
      const { blob, dataUrl } = await generateReceiptBlob();
      const fileName = `রসিদ-${order.orderNumber}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `অর্ডার রসিদ #${order.orderNumber}`,
          text: `আসসালামু আলাইকুম ${order.customer?.name}, ${shopName} এ আপনার অর্ডারের রসিদ।`,
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Error generating photo receipt:', err);
      handleDownloadPhoto();
    } finally {
      setGeneratingPhoto(false);
    }
  };

  // Direct Download Photo
  const handleDownloadPhoto = async () => {
    if (!order) return;
    setGeneratingPhoto(true);

    try {
      const { dataUrl } = await generateReceiptBlob();
      const fileName = `রসিদ-${order.orderNumber}.png`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download photo error:', err);
      alert('রসিদ ছবি ডাউনলোডে ত্রুটি হয়েছে।');
    } finally {
      setGeneratingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium">অর্ডারের তথ্য লোড হচ্ছে...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-12 text-center bg-white rounded-3xl p-8 border border-emerald-100 max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">অর্ডার পাওয়া যায়নি</h2>
        <p className="text-xs text-slate-500 mt-1">
          অনুরোধকৃত অর্ডারটি ডাটাবেজে খুঁজে পাওয়া যায়নি।
        </p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> অর্ডার তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  // Cumulative Payment Calculations for Live Preview
  const currentPaid = order.advancePaid || 0;
  const newPayInput = typeof additionalPayment === 'number' ? additionalPayment : 0;
  const projectedPaid = Math.min(order.totalAmount, currentPaid + newPayInput);
  const projectedBalance = Math.max(0, order.totalAmount - projectedPaid);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Action Buttons Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200/80 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> অর্ডার তালিকায় ফিরে যান
        </Link>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Share Image / Photo */}
          <button
            onClick={handleShareAsPhoto}
            disabled={generatingPhoto}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            {generatingPhoto ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
            ছবি শেয়ার
          </button>

          {/* Download Image / Photo */}
          <button
            onClick={handleDownloadPhoto}
            disabled={generatingPhoto}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
            title="ছবি ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5" /> ছবি ডাউনলোড
          </button>

          {/* Print Receipt */}
          <Link
            href={`/orders/${order._id}/receipt`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> প্রিন্ট রসিদ
          </Link>
        </div>
      </div>

      {/* Main Order Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
              টেইলর অর্ডার মেমো
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono mt-1">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              অর্ডার বুকিং তারিখ: <b>{formatDate(order.orderDate)}</b>
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              কাজের বর্তমান স্ট্যাটাস
            </span>
            <StatusBadge
              status={order.status as OrderStatus}
              orderId={order._id}
              interactive={true}
              onStatusChange={fetchOrder}
            />
          </div>
        </div>

        {/* Customer & Delivery Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-2">
              <User className="w-4 h-4 text-emerald-600" /> গ্রাহকের তথ্য
            </span>
            <p className="text-base font-bold text-slate-900">{order.customer?.name}</p>
            <p className="text-xs text-emerald-800 font-mono font-bold flex items-center gap-1 mt-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> {order.customer?.phone}
            </p>
            {order.customer?.address && (
              <p className="text-xs text-slate-600 mt-1 font-medium">ঠিকানা: {order.customer?.address}</p>
            )}
          </div>

          <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-2">
              <Calendar className="w-4 h-4 text-emerald-600" /> ট্রায়াল ও ডেলিভারির তারিখ
            </span>
            <p className="text-xl font-extrabold text-emerald-950">
              {formatDate(order.deliveryDate)}
            </p>
            {order.notes && (
              <p className="text-xs text-slate-600 mt-2 bg-white/80 p-2 rounded-xl border border-emerald-100 font-medium">
                <b>মন্তব্য:</b> {order.notes}
              </p>
            )}
          </div>
        </div>

        {/* Stitched Works & Recorded Measurements Grid */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-emerald-950 flex items-center gap-2">
            <Scissors className="w-4 h-4 text-emerald-600" /> সেলাই কাজ ও পরিমাপের রেকর্ড (Body Measurements)
          </h2>

          <div className="space-y-4">
            {order.items?.map((item: any, idx: number) => {
              const measurementsObj = item.measurements
                ? item.measurements instanceof Map
                  ? Object.fromEntries(item.measurements)
                  : item.measurements
                : {};

              const measurementEntries = Object.entries(measurementsObj);

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        আইটেম #{idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-emerald-950 mt-1">
                        {item.productName} <span className="text-slate-400 font-normal">({item.quantity} পিস)</span>
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 font-medium block">আইটেম মোট:</span>
                      <span className="text-base font-extrabold text-emerald-950">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Recorded Measurement Badges Grid */}
                  {measurementEntries.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5 text-emerald-600" /> রেকর্ডকৃত পরিমাপসমূহ:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {measurementEntries.map(([key, val]) => (
                          <div
                            key={key}
                            className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center"
                          >
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">
                              {key}
                            </span>
                            <span className="text-sm font-mono font-extrabold text-slate-900 mt-0.5 block">
                              {String(val || '-')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.specialNotes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                      <b>বিশেষ সেলাই নির্দেশিকা:</b> {item.specialNotes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cumulative Bill Summary & Add Payment Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          {/* Bill Summary Card */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" /> বিলিং হিসাব সারসংক্ষেপ
            </h3>
            <div className="flex justify-between items-center text-sm text-slate-700 font-bold">
              <span>মোট সেলাই বিল:</span>
              <span className="text-base font-black text-slate-900">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-emerald-800 font-bold">
              <span>মোট জমা (অগ্রিম):</span>
              <span className="text-base font-black">{formatCurrency(order.advancePaid)}</span>
            </div>
            <div className="flex justify-between items-center text-base pt-3 border-t border-slate-200 font-black">
              <span className="text-slate-900">বকেয়া টাকা:</span>
              <span className={order.balanceAmount > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                {formatCurrency(order.balanceAmount)}
              </span>
            </div>
          </div>

          {/* Cumulative Add Payment Form */}
          <form
            onSubmit={handleUpdatePayment}
            className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1">
                <PlusCircle className="w-4 h-4 text-emerald-600" /> নতুন টাকা জমা দিন (যোগ হবে)
              </h3>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                পূর্বের জমার সাথে যোগ হবে
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আজকের জমার পরিমাণ (৳) *
              </label>
              <input
                type="number"
                min="1"
                max={order.balanceAmount > 0 ? order.balanceAmount : order.totalAmount}
                required
                placeholder="যেমন: ৫০০"
                value={additionalPayment}
                onChange={(e) => setAdditionalPayment(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-bold text-emerald-950"
              />
            </div>

            {/* Live Calculation Preview */}
            {newPayInput > 0 && (
              <div className="p-3 rounded-xl bg-emerald-100/60 border border-emerald-200/80 text-xs text-emerald-900 font-bold space-y-1">
                <div className="flex justify-between">
                  <span>পূর্বের জমা: {formatCurrency(currentPaid)}</span>
                  <span>+ নতুন জমা: {formatCurrency(newPayInput)}</span>
                </div>
                <div className="flex justify-between border-t border-emerald-200/60 pt-1 text-emerald-950 font-black">
                  <span>নতুন মোট জমা হবে: {formatCurrency(projectedPaid)}</span>
                  <span>নতুন বকেয়া: {formatCurrency(projectedBalance)}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={updatingPayment || !additionalPayment || Number(additionalPayment) <= 0}
              className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md shadow-emerald-950/10 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {updatingPayment && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {updatingPayment ? 'জমা যোগ হচ্ছে...' : 'টাকা জমা যোগ করুন'}
            </button>
          </form>
        </div>
      </div>

      {/* Hidden Clean Printable Receipt Card Element */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div
          ref={hiddenReceiptRef}
          style={{
            width: '800px',
            padding: '40px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontFamily: "'Hind Siliguri', 'Noto Serif Bengali', sans-serif",
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <img
                src="/logo.png"
                alt={shopName}
                style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #047857' }}
              />
              <div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#064e3b' }}>{shopName}</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#047857', marginTop: '4px' }}>{tagline}</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '8px' }}>{address} | হেল্পলাইন: {phone}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '16px' }}>{order.orderNumber}</div>
              <div style={{ fontSize: '12px', marginTop: '8px', color: '#475569' }}>অর্ডার তারিখ: {formatDate(order.orderDate)}</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '4px', color: '#064e3b' }}>ডেলিভারি: {formatDate(order.deliveryDate)}</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}>গ্রাহকের তথ্য</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{order.customer?.name}</div>
              <div style={{ color: '#047857', fontWeight: 'bold' }}>{order.customer?.phone}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}>স্ট্যাটাস</div>
              <div style={{ fontWeight: 'bold', color: getOrderStatusStyle(order.status).hexText, backgroundColor: getOrderStatusStyle(order.status).hexBg, padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>{getOrderStatusLabel(order.status)}</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>সেলাই কাজ ও পরিমাপসমূহ</div>
            {order.items?.map((item: any, idx: number) => {
              const measurementsObj = item.measurements ? (item.measurements instanceof Map ? Object.fromEntries(item.measurements) : item.measurements) : {};
              const measurementEntries = Object.entries(measurementsObj);
              return (
                <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '12px', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px', marginBottom: '8px' }}>
                    <span>{idx + 1}. {item.productName} ({item.quantity} পিস)</span>
                    <span>{formatCurrency(item.totalPrice)}</span>
                  </div>
                  {measurementEntries.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', fontSize: '11px' }}>
                      {measurementEntries.map(([k, v]) => (
                        <div key={k} style={{ backgroundColor: '#f8fafc', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>{k}</span>
                          <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{String(v || '-')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', paddingTop: '16px', fontSize: '12px' }}>
            <div style={{ width: '300px', color: '#475569', fontSize: '11px' }}>{terms}</div>
            <div style={{ width: '240px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>মোট বিল:</span><span>{formatCurrency(order.totalAmount)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#047857' }}><span>জমা:</span><span>{formatCurrency(order.advancePaid)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '6px' }}><span>বকেয়া:</span><span style={{ color: order.balanceAmount > 0 ? '#e11d48' : '#047857' }}>{formatCurrency(order.balanceAmount)}</span></div>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#047857', marginTop: '24px' }}>{footerNote}</div>
        </div>
      </div>
    </div>
  );
}
