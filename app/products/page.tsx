'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Ruler,
  X,
  AlertCircle,
  Scissors,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MeasurementFieldInput {
  _id?: string;
  name: string;
  unit: string;
  required: boolean;
  placeholder?: string;
}

interface ProductItem {
  _id: string;
  name: string;
  category: string;
  basePrice: number;
  description?: string;
  measurementFields: MeasurementFieldInput[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('শার্ট');
  const [basePrice, setBasePrice] = useState<number | ''>(650);
  const [description, setDescription] = useState('');
  const [measurementFields, setMeasurementFields] = useState<MeasurementFieldInput[]>([
    { name: 'দৈর্ঘ্য', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ২৯.৫' },
    { name: 'বুক', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৪০' },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?reset=true');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('শার্ট');
    setBasePrice(650);
    setDescription('');
    setMeasurementFields([
      { name: 'দৈর্ঘ্য', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ২৯.৫' },
      { name: 'বুক', unit: 'ইঞ্চি', required: true, placeholder: 'যেমন: ৪০' },
    ]);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category || 'সাধারণ');
    setBasePrice(product.basePrice);
    setDescription(product.description || '');
    setMeasurementFields(product.measurementFields || []);
    setError('');
    setShowModal(true);
  };

  const handleAddField = () => {
    setMeasurementFields([
      ...measurementFields,
      { name: '', unit: 'ইঞ্চি', required: true, placeholder: '' },
    ]);
  };

  const handleRemoveField = (index: number) => {
    setMeasurementFields(measurementFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, key: keyof MeasurementFieldInput, value: any) => {
    const updated = [...measurementFields];
    updated[index] = { ...updated[index], [key]: value };
    setMeasurementFields(updated);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || basePrice === '') {
      setError('প্রোডাক্টের নাম এবং সেলাই রেট আবশ্যক');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      name,
      category,
      basePrice: Number(basePrice),
      description,
      measurementFields: measurementFields.filter((f) => f.name.trim() !== ''),
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'প্রোডাক্ট সংরক্ষণ ব্যর্থ হয়েছে');

      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message || 'প্রোডাক্ট সংরক্ষণে ত্রুটি');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই প্রোডাক্টটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Ruler className="w-3.5 h-3.5" /> প্রোডাক্ট ও পরিমাপ লাইব্রেরি
          </div>
          <h1 className="text-2xl font-extrabold text-emerald-950">প্রোডাক্ট ও প্রয়োজনীয় মাপসমূহ</h1>
          <p className="text-xs text-slate-500 mt-1 font-bold">
            টেইলর সেলাই প্রোডাক্ট যোগ করুন এবং প্রতিটি প্রোডাক্টের প্রয়োজনীয় পরিমাপের ঘরসমূহ কাস্টমাইজ করুন।
          </p>
        </div>

        <div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-sm shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> নতুন প্রোডাক্ট যোগ করুন
          </button>
        </div>
      </div>

      {/* Products Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">প্রোডাক্ট ক্যাটালগ লোড হচ্ছে...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-emerald-100 rounded-3xl p-8 bg-white">
          <Package className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
          <h3 className="text-base font-bold text-emerald-950">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
            নতুন প্রোডাক্ট যোগ করতে নিচের বাটনটি চাপুন।
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> নতুন প্রোডাক্ট যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-3xl p-6 border border-emerald-100/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      {product.category || 'সাধারণ'}
                    </span>
                    <h3 className="text-lg font-bold text-emerald-950 mt-1">{product.name}</h3>
                  </div>
                  <span className="text-base font-black text-emerald-800 bg-emerald-50/60 px-3 py-1 rounded-xl border border-emerald-100">
                    {formatCurrency(product.basePrice)}
                  </span>
                </div>

                {product.description && (
                  <p className="text-xs text-slate-500 mb-4 font-medium line-clamp-2">{product.description}</p>
                )}

                {/* Required Measurement Fields List */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-2">
                    <Scissors className="w-3 h-3 text-emerald-600" /> প্রয়োজনীয় মাপসমূহ ({product.measurementFields?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.measurementFields?.map((field, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
                      >
                        <span>{field.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({field.unit})</span>
                        {field.required && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="আবশ্যক মাপ" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(product)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> এডিট
                </button>
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> মুছে ফেলুন
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-emerald-950 flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-emerald-600" />
                  {editingProduct ? 'প্রোডাক্ট এডিট করুন' : 'নতুন টেইলর প্রোডাক্ট যোগ করুন'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-bold">
                  প্রোডাক্টের নাম, সেলাই রেট এবং অর্ডার নেয়ার সময় আবশ্যক পরিমাপের ঘরগুলো সেট করুন।
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                    প্রোডাক্টের নাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: জেন্টস শার্ট, পাঞ্জাবী, পায়জামা"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                    ক্যাটাগরি
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: শার্ট, প্যান্ট, ঐতিহ্যবাহী, স্যুট"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                    বেস সেলাই রেট (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="৬৫০"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                    সংক্ষিপ্ত বিবরণ
                  </label>
                  <input
                    type="text"
                    placeholder="স্টাইল বা ডিজাইনের বিবরণ"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                  />
                </div>
              </div>

              {/* Custom Measurement Fields Manager */}
              <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-emerald-600" />
                      ডাইনামিক প্রয়োজনীয় পরিমাপের ঘরসমূহ (Fields)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-bold">
                      এই প্রোডাক্টের জন্য অর্ডার লেখার সময় যেসব মাপ পূরণ করতে হবে তা উল্লেখ করুন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 hover:bg-emerald-900 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> মাপের ঘর যোগ করুন
                  </button>
                </div>

                {measurementFields.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    কোনো মাপের ঘর যোগ করা হয়নি। উপরে "+ মাপের ঘর যোগ করুন" এ ক্লিক করুন।
                  </p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {measurementFields.map((field, idx) => (
                      <div
                        key={idx}
                        className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white p-3 rounded-xl border border-emerald-100 shadow-sm"
                      >
                        <input
                          type="text"
                          required
                          placeholder="মাপের নাম (যেমন: দৈর্ঘ্য, বুক, হাতা, কলার)"
                          value={field.name}
                          onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs border border-slate-200 focus:outline-none focus:border-emerald-600 font-bold"
                        />
                        <select
                          value={field.unit}
                          onChange={(e) => handleFieldChange(idx, 'unit', e.target.value)}
                          className="w-24 px-2 py-1.5 rounded-lg text-xs border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white font-bold"
                        >
                          <option value="ইঞ্চি">ইঞ্চি</option>
                          <option value="সেমি">সেমি</option>
                          <option value="মিমি">মিমি</option>
                        </select>
                        <label className="flex items-center gap-1 text-xs text-slate-700 font-bold px-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleFieldChange(idx, 'required', e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          আবশ্যক
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md shadow-emerald-950/20 cursor-pointer disabled:opacity-70 flex items-center gap-2"
                >
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {editingProduct ? 'প্রোডাক্ট আপডেট করুন' : 'প্রোডাক্ট সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
