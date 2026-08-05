'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import {
  Printer,
  ArrowLeft,
  Camera,
  Download,
} from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusStyle } from '@/lib/utils';

export default function OrderReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const receiptRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/orders/${resolvedParams.id}`).then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ])
      .then(([orderData, settingsData]) => {
        if (orderData.success) setOrder(orderData.order);
        if (settingsData.success) setSettings(settingsData.settings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  const handlePrint = () => {
    window.print();
  };

  const shopName = settings?.shopName || 'মোল্লা টেইলরস (Molla Tailors)';
  const tagline = settings?.tagline || 'বিসপোক টেইলর ও সেলাই ওয়ার্কশপ';
  const address = settings?.address || 'হাউজ ৪২, রোড ১১, বনানী / ধানমন্ডি, ঢাকা';
  const phone = settings?.phone || '+৮৮০ ১৭০০-০০০০০০';
  const email = settings?.email || 'info@mollatailors.com';
  const terms = settings?.termsAndConditions || '১. সেলাইকৃত কাপড় পরিবর্তন বা ফেরতযোগ্য নহে।\n২. ট্রায়াল ও ডেলিভারির সময় এই রসিদ প্রদর্শন করুন।\n৩. ডেলিভারির সময় অবশিষ্ট বকেয়া পরিশোধ করতে হবে।';
  const footerNote = settings?.footerNote || `${shopName} এ অর্ডার করার জন্য আপনাকে ধন্যবাদ!`;

  // Modern Screenshot PNG Generator
  const generateReceiptImageBlob = async (): Promise<{ blob: Blob; dataUrl: string }> => {
    if (!receiptRef.current) throw new Error('Receipt container element not ready');

    const dataUrl = await domToPng(receiptRef.current, {
      scale: 2, // 2x Crisp HD resolution
      backgroundColor: '#ffffff',
      quality: 1.0,
    });

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return { blob, dataUrl };
  };

  // Share receipt image directly via Web Share API or download photo
  const handleShareAsPhoto = async () => {
    if (!order) return;
    setGeneratingPhoto(true);

    try {
      const { blob, dataUrl } = await generateReceiptImageBlob();
      const fileName = `রসিদ-${order.orderNumber}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `অর্ডার রসিদ #${order.orderNumber}`,
          text: `আসসালামু আলাইকুম ${order.customer?.name}, ${shopName} এ আপনার সেলাই অর্ডারের রসিদের ছবি।`,
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      }
    } catch (err: any) {
      console.error('Error generating photo receipt:', err);
      handleDownloadPhoto();
    } finally {
      setGeneratingPhoto(false);
    }
  };

  // Download high-resolution PNG receipt photo
  const handleDownloadPhoto = async () => {
    if (!order) return;
    setGeneratingPhoto(true);

    try {
      const { dataUrl } = await generateReceiptImageBlob();
      const fileName = `রসিদ-${order.orderNumber}.png`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert('রসিদ ছবি ডাউনলোডে সমস্যা হয়েছে।');
    } finally {
      setGeneratingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-400 font-sans">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-medium">প্রিন্ট রসিদ তৈরি হচ্ছে...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-700 font-sans">
        <h2 className="text-lg font-bold">রসিদ পাওয়া যায়নি</h2>
        <Link href="/orders" className="text-xs text-emerald-700 font-bold underline mt-2">
          অর্ডার তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      {/* Top Control Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 no-print bg-emerald-950 text-white p-4 rounded-2xl shadow-xl">
        <Link
          href={`/orders/${order._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> অর্ডারের বিস্তারিত পাতায় যান
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShareAsPhoto}
            disabled={generatingPhoto}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 text-xs font-black hover:from-emerald-400 hover:to-teal-300 shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            {generatingPhoto ? (
              <div className="w-4 h-4 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            ছবি হিসেবে শেয়ার করুন
          </button>

          <button
            onClick={handleDownloadPhoto}
            disabled={generatingPhoto}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-800 text-emerald-100 text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> ছবি ডাউনলোড
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-100 text-xs font-bold hover:bg-slate-700 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> প্রিন্ট
          </button>
        </div>
      </div>

      {/* Printable / Snapshot Receipt Element */}
      <div
        ref={receiptRef}
        className="max-w-3xl mx-auto p-8 sm:p-10 rounded-2xl shadow-lg print-card font-sans"
        style={{
          width: '100%',
          maxWidth: '800px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          border: '1px solid #cbd5e1',
        }}
      >
        {/* Dynamic Shop Branding Header with Brand Logo */}
        <div
          className="flex justify-between items-start pb-6 mb-6 gap-4"
          style={{ borderBottom: '2px solid #0f172a' }}
        >
          <div className="flex-1 flex items-start gap-3">
            {/* Brand Logo Image in Receipt */}
            <img
              src="/logo.png"
              alt={shopName}
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-emerald-800/30 shadow-sm"
              style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
            />
            <div>
              <div
                className="font-black text-xl sm:text-2xl tracking-tight leading-tight"
                style={{ color: '#064e3b' }}
              >
                {shopName}
              </div>
              <span
                className="block text-xs font-bold uppercase tracking-widest mt-0.5"
                style={{ color: '#047857' }}
              >
                {tagline}
              </span>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#475569' }}>
                {address}<br />
                হেল্পলাইন: <b style={{ color: '#0f172a' }}>{phone}</b> {email ? `| ইমেইল: ${email}` : ''}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 min-w-[180px]">
            <span
              className="inline-block font-mono font-bold text-base px-3 py-1.5 rounded-lg shadow-sm"
              style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
            >
              {order.orderNumber}
            </span>
            <p className="text-xs mt-2 font-medium" style={{ color: '#475569' }}>
              অর্ডার তারিখ: <b style={{ color: '#0f172a' }}>{formatDate(order.orderDate)}</b>
            </p>
            <p className="text-xs font-bold mt-1.5" style={{ color: '#0f172a' }}>
              ট্রায়াল / ডেলিভারি তারিখ:<br />
              <span className="text-sm font-black" style={{ color: '#064e3b' }}>
                {formatDate(order.deliveryDate)}
              </span>
            </p>
          </div>
        </div>

        {/* Customer Information */}
        <div
          className="grid grid-cols-2 gap-4 p-4 rounded-xl mb-6 text-xs"
          style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
        >
          <div>
            <span
              className="font-bold uppercase tracking-wider block text-[10px]"
              style={{ color: '#94a3b8' }}
            >
              গ্রাহকের তথ্য
            </span>
            <span className="font-extrabold text-sm block mt-0.5" style={{ color: '#0f172a' }}>
              {order.customer?.name}
            </span>
            <span className="font-mono font-bold block mt-0.5" style={{ color: '#047857' }}>
              {order.customer?.phone}
            </span>
          </div>

          <div>
            <span
              className="font-bold uppercase tracking-wider block text-[10px]"
              style={{ color: '#94a3b8' }}
            >
              স্ট্যাটাস ও ডেলিভারি তথ্য
            </span>
            <span className="font-bold block mt-0.5" style={{ color: '#1e293b' }}>
              স্ট্যাটাস: <span className="font-extrabold px-2 py-0.5 rounded-md" style={{ backgroundColor: getOrderStatusStyle(order.status).hexBg, color: getOrderStatusStyle(order.status).hexText }}>{getOrderStatusLabel(order.status)}</span>
            </span>
            {order.customer?.address && (
              <span className="block mt-0.5" style={{ color: '#475569' }}>
                {order.customer?.address}
              </span>
            )}
          </div>
        </div>

        {/* Stitched Works & Measurement Details */}
        <div className="mb-6">
          <h3
            className="text-xs font-bold uppercase tracking-wider pb-2 mb-3"
            style={{ color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}
          >
            সেলাই আইটেম ও বডি পরিমাপসমূহ (Body Measurements)
          </h3>

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
                  className="rounded-xl p-4 space-y-3"
                  style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}
                >
                  <div
                    className="flex justify-between items-center text-xs font-bold pb-2"
                    style={{ color: '#0f172a', borderBottom: '1px solid #f1f5f9' }}
                  >
                    <span className="font-extrabold">
                      {idx + 1}. {item.productName} ({item.quantity} পিস)
                    </span>
                    <span className="font-black" style={{ color: '#0f172a' }}>
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>

                  {/* Recorded Measurements Grid */}
                  {measurementEntries.length > 0 && (
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase block mb-1.5"
                        style={{ color: '#94a3b8' }}
                      >
                        পরিমাপসমূহ:
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[11px]">
                        {measurementEntries.map(([key, val]) => (
                          <div
                            key={key}
                            className="p-2 rounded-lg text-center"
                            style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                          >
                            <span
                              className="text-[9px] font-bold block uppercase"
                              style={{ color: '#64748b' }}
                            >
                              {key}
                            </span>
                            <span
                              className="font-mono font-bold text-xs"
                              style={{ color: '#0f172a' }}
                            >
                              {String(val || '-')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.specialNotes && (
                    <p
                      className="text-[11px] italic p-2 rounded-lg"
                      style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', color: '#475569' }}
                    >
                      বিশেষ নোট: {item.specialNotes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Summary & Dynamic Terms */}
        <div
          className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8"
          style={{ borderTop: '2px solid #0f172a' }}
        >
          <div className="text-xs space-y-1 max-w-sm" style={{ color: '#475569' }}>
            <span
              className="font-bold uppercase tracking-wider block text-[10px]"
              style={{ color: '#0f172a' }}
            >
              শর্তাবলী ও ওয়ার্কশপ নিয়মাবলী:
            </span>
            <pre
              className="font-sans whitespace-pre-wrap text-[11px] leading-normal font-medium"
              style={{ color: '#475569' }}
            >
              {terms}
            </pre>
          </div>

          <div
            className="w-full sm:w-64 p-4 rounded-xl space-y-2 text-xs"
            style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            <div className="flex justify-between font-bold" style={{ color: '#334155' }}>
              <span>মোট বিল:</span>
              <span className="font-black" style={{ color: '#0f172a' }}>
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between font-bold" style={{ color: '#047857' }}>
              <span>জমা (অগ্রিম):</span>
              <span className="font-black">{formatCurrency(order.advancePaid)}</span>
            </div>
            <div
              className="flex justify-between font-bold text-sm pt-2"
              style={{ color: '#0f172a', borderTop: '1px solid #e2e8f0' }}
            >
              <span>বকেয়া পরিশোধযোগ্য:</span>
              <span
                className="font-black"
                style={{ color: order.balanceAmount > 0 ? '#e11d48' : '#047857' }}
              >
                {formatCurrency(order.balanceAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note & Signatures */}
        <div
          className="text-center text-xs font-bold mb-8 pt-2"
          style={{ color: '#047857' }}
        >
          {footerNote}
        </div>

        <div
          className="pt-8 flex justify-between items-end text-xs font-bold"
          style={{ color: '#64748b' }}
        >
          <div className="text-center">
            <div className="w-36 mb-1" style={{ borderBottom: '1px solid #cbd5e1' }} />
            গ্রাহকের স্বাক্ষর
          </div>
          <div className="text-center">
            <div className="w-36 mb-1" style={{ borderBottom: '1px solid #cbd5e1' }} />
            মাস্টার / কারিগরের স্বাক্ষর
          </div>
        </div>
      </div>
    </div>
  );
}
