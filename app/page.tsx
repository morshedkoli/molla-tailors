'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Scissors,
  Clock,
  CheckCircle2,
  DollarSign,
  Plus,
  Package,
  Search,
  ArrowUpRight,
  Printer,
  Phone,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatus } from '@/models/Order';

interface StatsData {
  totalOrders: number;
  activeOrders: number;
  readyOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  pendingDue: number;
  totalProducts: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/stats'),
        fetch(`/api/orders?status=${selectedStatus}&search=${encodeURIComponent(searchQuery)}`),
      ]);

      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (ordersData.success) setOrders(ordersData.orders);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const statusTabs = [
    { key: 'All', label: 'সব অর্ডার' },
    { key: 'Pending', label: 'অপেক্ষমান' },
    { key: 'In Progress', label: 'কাজ চলছে' },
    { key: 'Fitting Ready', label: 'ট্রায়াল প্রস্তুত' },
    { key: 'Delivered', label: 'ডেলিভারি সম্পন্ন' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Scissors className="w-3.5 h-3.5" /> টেইলর ওয়ার্কশপ পোটাল
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              অর্ডার ম্যানেজমেন্ট ওভারভিউ
            </h1>
            <p className="text-emerald-200/80 text-sm mt-1 max-w-xl font-medium">
              গ্রাহকের সেলাই কাজ, বডি মেজারমেন্ট মাপ, ডেলিভারি তারিখ এবং হিসাব সংরক্ষণ করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/orders/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-extrabold text-sm shadow-lg shadow-emerald-950/40 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              নতুন অর্ডার রাখুন
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/60 text-emerald-100 font-bold text-sm transition-all"
            >
              <Package className="w-4 h-4 text-emerald-400" />
              প্রোডাক্ট ও মাপ
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">মোট অর্ডার</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-950 mt-3">{stats?.totalOrders ?? '0'}</p>
          <span className="text-[11px] text-slate-500 font-medium">সর্বমোট সেলাই অর্ডার</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">সেলাই চলছে</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-950 mt-3">{stats?.activeOrders ?? '0'}</p>
          <span className="text-[11px] text-slate-500 font-medium">ওয়ার্কশপ কিউতে আছে</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-100/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">ট্রায়াল প্রস্তুত</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-950 mt-3">{stats?.readyOrders ?? '0'}</p>
          <span className="text-[11px] text-slate-500 font-medium">ট্রায়ালের জন্য তৈরি</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-teal-100/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">ডেলিভারি সম্পন্ন</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-950 mt-3">{stats?.deliveredOrders ?? '0'}</p>
          <span className="text-[11px] text-slate-500 font-medium">গ্রাহককে হস্তান্তরকৃত</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">মোট বিক্রয়</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-950 mt-3">
            {stats ? formatCurrency(stats.totalRevenue) : '৳০'}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">অর্ডার রেভিনিউ</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">বকেয়া পাওনা</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-rose-900 mt-3">
            {stats ? formatCurrency(stats.pendingDue) : '৳০'}
          </p>
          <span className="text-[11px] text-rose-600 font-bold">ডেলিভারিতে আদায়যোগ্য</span>
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              অর্ডার তালিকা ও স্ট্যাটাস আপডেট
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              স্ট্যাটাস ব্যাজে ক্লিক করে সেলাই কাজের বর্তমান ধাপ সহজে পরিবর্তন করুন।
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative min-w-[240px] sm:min-w-[300px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="অর্ডার নং, নাম বা মোবাইল দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-emerald-50/20 font-medium"
            />
          </form>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedStatus === tab.key
                  ? 'bg-emerald-900 text-white shadow-md shadow-emerald-900/10'
                  : 'bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100 border border-emerald-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">অর্ডার ডাটাবেজ লোড হচ্ছে...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-emerald-100 rounded-2xl p-8">
            <ShoppingBag className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
            <h3 className="text-base font-bold text-emerald-950">কোনো অর্ডার পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              আপনার ফিল্টার অথবা সার্চ অনুসন্ধানের সাথে মেলে এমন কোনো রেকর্ড নেই।
            </p>
            <Link
              href="/orders/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
            >
              <Plus className="w-4 h-4" /> নতুন অর্ডার লিখুন
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-emerald-100 text-emerald-900 font-bold uppercase tracking-wider text-[11px] bg-emerald-50/40">
                  <th className="py-3 px-4 rounded-l-xl">অর্ডার নং</th>
                  <th className="py-3 px-4">গ্রাহকের নাম ও ফোন</th>
                  <th className="py-3 px-4">সেলাই কাজ / প্রোডাক্ট</th>
                  <th className="py-3 px-4">ডেলিভারি তারিখ</th>
                  <th className="py-3 px-4">বিল ও বকেয়া</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-emerald-50/30 transition-colors group">
                    {/* Order Number */}
                    <td className="py-4 px-4 font-bold text-emerald-950">
                      <Link
                        href={`/orders/${order._id}`}
                        className="hover:underline flex items-center gap-1 text-emerald-900 font-mono text-sm"
                      >
                        {order.orderNumber}
                      </Link>
                      <span className="block text-[10px] text-slate-400 font-sans font-normal">
                        {formatDate(order.orderDate)}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 block">{order.customer?.name}</span>
                      <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-emerald-500" /> {order.customer?.phone}
                      </span>
                    </td>

                    {/* Works / Items */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {order.items?.map((item: any, idx: number) => (
                          <span
                            key={idx}
                            className="inline-block bg-emerald-50 text-emerald-900 font-semibold px-2 py-0.5 rounded-md text-[11px] border border-emerald-200/60 mr-1"
                          >
                            {item.quantity}টি {item.productName}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Delivery Date */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        {formatDate(order.deliveryDate)}
                      </div>
                    </td>

                    {/* Payment */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </div>
                      <div className="text-[10px]">
                        <span className="text-emerald-700 font-bold">জমা: {formatCurrency(order.advancePaid)}</span>
                        {order.balanceAmount > 0 && (
                          <span className="text-rose-600 font-black ml-1.5">
                            বাকি: {formatCurrency(order.balanceAmount)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <StatusBadge
                        status={order.status as OrderStatus}
                        orderId={order._id}
                        interactive={true}
                        onStatusChange={fetchDashboardData}
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/orders/${order._id}`}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1"
                        >
                          দেখুন
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                        <Link
                          href={`/orders/${order._id}/receipt`}
                          title="রসিদ প্রিন্ট"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold inline-flex items-center"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
