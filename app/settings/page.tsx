'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Scissors,
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Settings State
  const [shopName, setShopName] = useState('');
  const [tagline, setTagline] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('৳');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [footerNote, setFooterNote] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          const s = data.settings;
          setShopName(s.shopName || '');
          setTagline(s.tagline || '');
          setAddress(s.address || '');
          setPhone(s.phone || '');
          setEmail(s.email || '');
          setCurrencySymbol(s.currencySymbol || '৳');
          setTermsAndConditions(s.termsAndConditions || '');
          setFooterNote(s.footerNote || '');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const payload = {
      shopName,
      tagline,
      address,
      phone,
      email,
      currencySymbol,
      termsAndConditions,
      footerNote,
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে');

      setSuccessMsg('ব্র্যান্ডিং ও রসিদ সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
    } catch (err: any) {
      setErrorMsg(err.message || 'সেটিংস সংরক্ষণে ত্রুটি');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium">শপের তথ্য লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <SettingsIcon className="w-3.5 h-3.5" /> ওয়ার্কশপ ব্র্যান্ডিং ও সেটিংস
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">টেইলর শপ কনফিগারেশন</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          আপনার টেইলর শপের নাম, স্লোগান, ঠিকানা, হেল্পলাইন নম্বর, কারেন্সি এবং রসিদের নিয়মাবলী সেটিংসে আপডেট করুন।
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Settings Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Store className="w-5 h-5 text-emerald-600" /> টেইলর শপ ব্র্যান্ডিং তথ্য
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                  টেইলর শপ / ওয়ার্কশপের নাম *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="যেমন: থ্রেড এন্ড ক্রাফট টেইলরস"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold text-emerald-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                  সাবহেডিং / ট্যাগলাইন (স্লোগান)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বিসপোক টেইলর ও সেলাই ওয়ার্কশপ"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                    হেল্পলাইন / ফোন নম্বর *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="যেমন: +৮৮০ ১৭০০-০০০০০০"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                    ইমেইল ঠিকানা
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="যেমন: info@threadcraft.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                  ওয়ার্কশপ ঠিকানা *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    required
                    placeholder="যেমন: হাউজ ৪২, রোড ১১, বনানী / ধানমন্ডি, ঢাকা"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                  মুদ্রা চিহ্ন (Currency)
                </label>
                <input
                  type="text"
                  placeholder="৳"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* Receipt Terms & Policy Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-5 h-5 text-emerald-600" /> রসিদের শর্তাবলী ও পলিসি
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                  শর্তাবলী ও নিয়মাবলী (রসিদের নিচে প্রিন্ট হবে)
                </label>
                <textarea
                  rows={3}
                  placeholder="যেমন: ১. সেলাইকৃত কাপড় পরিবর্তন বা ফেরতযোগ্য নহে..."
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  className="w-full p-3.5 rounded-xl text-xs border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                  ফুটনোট বা ধন্যবাদ বার্তা
                </label>
                <input
                  type="text"
                  placeholder="যেমন: থ্রেড এন্ড ক্রাফট টেইলরস এ অর্ডার করার জন্য আপনাকে ধন্যবাদ!"
                  value={footerNote}
                  onChange={(e) => setFooterNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-sm shadow-md shadow-emerald-950/20 flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> সেটিংস সংরক্ষণ করুন
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Right Column: Live Receipt Header Preview */}
        <div className="space-y-4">
          <div className="sticky top-24 bg-white rounded-3xl p-6 border border-emerald-200 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5 pb-3 border-b border-emerald-100">
              <Eye className="w-4 h-4 text-emerald-600" /> রসিদ হেডার লাইভ প্রিভিউ
            </h3>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-300 font-sans text-slate-900 space-y-3">
              <div className="border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-1.5 text-emerald-950 font-black text-lg tracking-wider">
                  <Scissors className="w-5 h-5 text-emerald-700 shrink-0" />
                  {shopName || 'থ্রেড এন্ড ক্রাফট টেইলরস'}
                </div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-800 mt-0.5">
                  {tagline || 'বিসপোক টেইলর ও সেলাই ওয়ার্কশপ'}
                </span>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  {address || 'হাউজ ৪২, রোড ১১, বনানী / ধানমন্ডি, ঢাকা'}<br />
                  হেল্পলাইন: {phone || '+৮৮০ ১৭০০-০০০০০০'} | {email || 'info@threadcraft.com'}
                </p>
              </div>

              <div className="text-[10px] text-slate-500 italic bg-white p-2.5 rounded-lg border border-slate-200">
                <b>শর্তাবলী প্রিভিউ:</b>
                <pre className="font-sans whitespace-pre-wrap mt-1 text-[10px] text-slate-600">
                  {termsAndConditions || '১. সেলাইকৃত কাপড় পরিবর্তন বা ফেরতযোগ্য নহে।'}
                </pre>
              </div>

              <div className="text-[11px] font-bold text-emerald-800 text-center pt-2">
                {footerNote || 'থ্রেড এন্ড ক্রাফট টেইলরস এ অর্ডার করার জন্য ধন্যবাদ!'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
