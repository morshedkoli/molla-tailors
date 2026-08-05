'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Scissors,
  User,
  Phone,
  Calendar,
  Plus,
  Trash2,
  Ruler,
  DollarSign,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MeasurementField {
  name: string;
  unit: string;
  required: boolean;
  placeholder?: string;
}

interface ProductOption {
  _id: string;
  name: string;
  category: string;
  basePrice: number;
  measurementFields: MeasurementField[];
}

interface OrderItemInput {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  measurements: Record<string, string>;
  specialNotes: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Customer state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  // Items / Works state
  const [items, setItems] = useState<OrderItemInput[]>([]);
  const [advancePaid, setAdvancePaid] = useState<number | ''>(0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch available products
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products.length > 0) {
          setProducts(data.products);
          // Add default first item work
          const firstProd = data.products[0];
          const initialMeasurements: Record<string, string> = {};
          firstProd.measurementFields?.forEach((f: MeasurementField) => {
            initialMeasurements[f.name] = '';
          });

          setItems([
            {
              productId: firstProd._id,
              productName: firstProd.name,
              unitPrice: firstProd.basePrice,
              quantity: 1,
              totalPrice: firstProd.basePrice,
              measurements: initialMeasurements,
              specialNotes: '',
            },
          ]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingProducts(false));

    // Default delivery date to 7 days from today
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setDeliveryDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  const handleAddWorkItem = () => {
    if (products.length === 0) return;
    const prod = products[0];
    const initialMeasurements: Record<string, string> = {};
    prod.measurementFields?.forEach((f: MeasurementField) => {
      initialMeasurements[f.name] = '';
    });

    setItems([
      ...items,
      {
        productId: prod._id,
        productName: prod.name,
        unitPrice: prod.basePrice,
        quantity: 1,
        totalPrice: prod.basePrice,
        measurements: initialMeasurements,
        specialNotes: '',
      },
    ]);
  };

  const handleRemoveWorkItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, selectedProductId: string) => {
    const selectedProd = products.find((p) => p._id === selectedProductId);
    if (!selectedProd) return;

    const updated = [...items];
    const initialMeasurements: Record<string, string> = {};
    selectedProd.measurementFields?.forEach((f: MeasurementField) => {
      initialMeasurements[f.name] = '';
    });

    updated[index] = {
      ...updated[index],
      productId: selectedProd._id,
      productName: selectedProd.name,
      unitPrice: selectedProd.basePrice,
      totalPrice: selectedProd.basePrice * updated[index].quantity,
      measurements: initialMeasurements,
    };

    setItems(updated);
  };

  const handleItemMeasurementChange = (itemIndex: number, fieldName: string, value: string) => {
    const updated = [...items];
    updated[itemIndex] = {
      ...updated[itemIndex],
      measurements: {
        ...updated[itemIndex].measurements,
        [fieldName]: value,
      },
    };
    setItems(updated);
  };

  const handleItemNumberChange = (
    index: number,
    key: 'unitPrice' | 'quantity',
    value: number
  ) => {
    const updated = [...items];
    const qty = key === 'quantity' ? Math.max(1, value) : updated[index].quantity;
    const price = key === 'unitPrice' ? Math.max(0, value) : updated[index].unitPrice;

    updated[index] = {
      ...updated[index],
      [key]: value,
      quantity: qty,
      unitPrice: price,
      totalPrice: price * qty,
    };
    setItems(updated);
  };

  const handleItemNotesChange = (index: number, notes: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], specialNotes: notes };
    setItems(updated);
  };

  const totalAmount = items.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
  const advance = Number(advancePaid) || 0;
  const balanceDue = Math.max(0, totalAmount - advance);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim() || !customerPhone.trim()) {
      setError('গ্রাহকের নাম এবং মোবাইল নম্বর আবশ্যক');
      return;
    }

    if (!deliveryDate) {
      setError('ডেলিভারির তারিখ নির্বাচন করুন');
      return;
    }

    // Validate required measurements
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const prod = products.find((p) => p._id === item.productId);
      if (prod) {
        for (const field of prod.measurementFields) {
          if (field.required && !item.measurements[field.name]?.trim()) {
            setError(
              `আইটেম #${i + 1} (${item.productName}) এর জন্য "${field.name}" এর পরিমাপ আবশ্যক`
            );
            return;
          }
        }
      }
    }

    setSaving(true);

    const payload = {
      customer: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: customerAddress,
      },
      items,
      totalAmount,
      advancePaid: advance,
      deliveryDate,
      notes,
      status: 'Pending',
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'অর্ডার যুক্ত করতে ব্যর্থ হয়েছে');

      router.push(`/orders/${data.order._id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'অর্ডার তৈরিতে ত্রুটি');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProducts) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium">প্রোডাক্ট ডাটা লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Scissors className="w-3.5 h-3.5 text-emerald-600" /> নতুন অর্ডার এন্ট্রি
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">নতুন সেলাই অর্ডার রাখুন</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          গ্রাহকের সেলাই কাজের প্রোডাক্ট নির্বাচন করুন এবং প্রয়োজনীয় বডি মাপসমূহ নিখুঁতভাবে পূরণ করুন।
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="space-y-8">
        {/* Section 1: Customer Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-emerald-600" /> গ্রাহকের সাধারণ তথ্য
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                গ্রাহকের নাম *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ রহিম উদ্দিন"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-emerald-50/10 font-bold text-emerald-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                মোবাইল নম্বর *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="যেমন: 01711223344"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-emerald-50/10 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                ডেলিভারি / ট্রায়াল তারিখ *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-emerald-50/10 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                ঠিকানা / এলাকা (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="যেমন: ধানমন্ডি, ঢাকা"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-emerald-50/10 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Works / Items Stitched (Dynamic Measurements) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-emerald-600" /> সেলাই কাজ ও প্রয়োজনীয় বডি পরিমাপ
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                প্রোডাক্ট সিলেক্ট করলে তার নির্দিষ্ট পরিমাপের ঘরগুলো নিচে চলে আসবে।
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddWorkItem}
              className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> আরও কাজ যোগ করুন
            </button>
          </div>

          <div className="space-y-6">
            {items.map((item, idx) => {
              const currentProduct = products.find((p) => p._id === item.productId);

              return (
                <div
                  key={idx}
                  className="bg-emerald-50/30 rounded-2xl p-5 border border-emerald-100 space-y-5 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-white text-xs font-bold">
                      কাজ #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveWorkItem(idx)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> কাজ সরান
                      </button>
                    )}
                  </div>

                  {/* Product Picker & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1">
                        প্রোডাক্ট নির্বাচন করুন *
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:border-emerald-600 bg-white font-bold"
                      >
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({formatCurrency(p.basePrice)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1">
                        সেলাই মজুরি (৳)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemNumberChange(idx, 'unitPrice', Number(e.target.value))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:border-emerald-600 bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1">
                        পরিমাণ (পিস)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemNumberChange(idx, 'quantity', Number(e.target.value))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:border-emerald-600 bg-white font-bold"
                      />
                    </div>
                  </div>

                  {/* Dynamic Measurement Inputs for this product */}
                  {currentProduct && currentProduct.measurementFields?.length > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-emerald-100/80 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        <Ruler className="w-3.5 h-3.5 text-emerald-600" />
                        {currentProduct.name} এর প্রয়োজনীয় বডি মাপসমূহ ({currentProduct.measurementFields.length} টি)
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {currentProduct.measurementFields.map((field) => (
                          <div key={field.name}>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {field.name}{' '}
                              <span className="text-slate-400 font-mono">({field.unit})</span>
                              {field.required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
                            </label>
                            <input
                              type="text"
                              required={field.required}
                              placeholder={field.placeholder || `যেমন: ৩৮`}
                              value={item.measurements[field.name] || ''}
                              onChange={(e) =>
                                handleItemMeasurementChange(idx, field.name, e.target.value)
                              }
                              className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 focus:outline-none focus:border-emerald-600 bg-emerald-50/20 font-mono font-bold text-emerald-950"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special instructions */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      বিশেষ সেলাই নির্দেশনা / ডিজাইন নোট
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: কাফ কলার, দুই পাশে পকেট, স্লিম ফিটিং বটম"
                      value={item.specialNotes}
                      onChange={(e) => handleItemNotesChange(idx, e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white font-medium"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Billing & Settlement Summary */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2 pb-3 border-b border-slate-100">
            <DollarSign className="w-5 h-5 text-emerald-600" /> বিলিং ও হিসাব
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">মোট বিল</span>
              <span className="text-2xl font-black text-emerald-950 mt-1 block">{formatCurrency(totalAmount)}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                অগ্রিম জমা (এডভান্স) ৳
              </label>
              <input
                type="number"
                min="0"
                value={advancePaid}
                onChange={(e) =>
                  setAdvancePaid(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="যেমন: ৫০০"
                className="w-full px-4 py-3 rounded-2xl text-lg font-bold border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-emerald-900"
              />
            </div>

            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">বকেয়া টাকা</span>
              <span className="text-2xl font-black text-rose-950 mt-1 block">{formatCurrency(balanceDue)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
              অর্ডারের বিশেষ মন্তব্য / অভ্যন্তরীণ নোট
            </label>
            <textarea
              rows={2}
              placeholder="যেমন: কাপড় কাস্টমার দিয়ে গেছেন। শুক্রবারের মধ্যে ট্রায়াল জরুরি।"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-xs border border-emerald-200 focus:outline-none focus:border-emerald-600 bg-emerald-50/10 font-medium"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              বাতিল
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-extrabold text-sm shadow-lg shadow-emerald-950/20 flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  অর্ডার নিশ্চিত করুন ও রসিদ দেখুন
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
