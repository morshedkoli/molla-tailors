'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scissors, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<{ shopName?: string; tagline?: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ভুল ইউজারনেম বা পাসওয়ার্ড');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const shopName = settings?.shopName || 'থ্রেড এন্ড ক্রাফট টেইলরস';
  const tagline = settings?.tagline || 'টেইলর ওয়ার্কশপ অর্ডার ম্যানেজমেন্ট সিস্টেম';

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Header */}
        <div className="text-center">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white shadow-xl shadow-emerald-900/20 mb-4 ring-4 ring-emerald-100">
            <Scissors className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-emerald-950 tracking-tight">
            {shopName}
          </h2>
          <p className="mt-2 text-sm text-emerald-700 font-bold">
            {tagline}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-emerald-100/80">
          <div className="mb-6 pb-4 border-b border-emerald-50">
            <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" /> অ্যাডমিন লগইন
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              অর্ডার সিস্টেম অ্যাক্সেস করতে আপনার ইউজারনেম ও পাসওয়ার্ড ব্যবহার করুন।
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">
                ইউজারনেম
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-emerald-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-emerald-50/30 text-emerald-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-emerald-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-emerald-50/30 text-emerald-950"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-emerald-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-sm shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  লগইন করুন <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Credentials Hint Box */}
          <div className="mt-6 pt-4 border-t border-emerald-50 text-center">
            <p className="text-[11px] text-slate-500 font-bold">
              ডিফল্ট লগইন ইউজারনেম: <span className="font-mono text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">admin</span> | পাসওয়ার্ড: <span className="font-mono text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
