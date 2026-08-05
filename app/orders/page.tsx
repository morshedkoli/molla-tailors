'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  Plus,
  Filter,
  Calendar,
  Phone,
  Printer,
  ArrowUpRight,
  User,
  Scissors,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatus } from '@/models/Order';

interface OrderItem {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  status: string;
  orderDate: string;
  deliveryDate: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = `/api/orders?status=${statusFilter}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const statusTabs = [
    { label: 'সকল অর্ডার', value: 'All' },
    { label: 'অপেক্ষমান', value: 'Pending' },
    { label: 'কাজ চলছে', value: 'In Progress' },
    { label: 'ট্রায়াল প্রস্তুত', value: 'Ready for Trial' },
    { label: 'সেলাই সম্পন্ন', value: 'Completed' },
    { label: 'ডেলিভারি সম্পন্ন', value: 'Delivered' },
    { label: 'বাতিলকৃত', value: 'Cancelled' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShoppingBag className="w-3.5 h-3.5" /> মাস্টার অর্ডার রেজিস্ট্রি
          </div>
          <h1 className="text-2xl font-extrabold text-emerald-950">সকল সেলাই অর্ডারের রেজিস্টার</h1>
          <p className="text-xs text-slate-500 mt-1 font-bold">
            গ্রাহকের নাম, মেমো নম্বর বা ফোন নম্বর দিয়ে সহজেই ফিল্টার ও সার্চ করুন।
          </p>
        </div>

        <Link
          href="/orders/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-sm shadow-md shadow-emerald-950/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> নতুন অর্ডার তৈরি করুন
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-emerald-100 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="মেমো নম্বর, গ্রাহকের নাম বা ফোন দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 font-bold"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors shadow-sm cursor-pointer"
          >
            সার্চ
          </button>
        </form>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-emerald-600" /> ফিল্টার:
          </span>
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Directory Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">অর্ডার তালিকা লোড হচ্ছে...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-emerald-100 rounded-3xl p-8 bg-white">
          <ShoppingBag className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
          <h3 className="text-base font-bold text-emerald-950">কোনো অর্ডার পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
            বর্তমান ফিল্টারে কোনো অর্ডার নেই। নতুন অর্ডার এন্ট্রি দিতে "নতুন অর্ডার তৈরি করুন" বাটন চাপুন।
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-950 text-emerald-100 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-4">মেমো # ও তারিখ</th>
                  <th className="py-3.5 px-4">গ্রাহকের নাম ও ফোন</th>
                  <th className="py-3.5 px-4">সেলাই আইটেম</th>
                  <th className="py-3.5 px-4">ডেলিভারির তারিখ</th>
                  <th className="py-3.5 px-4">বিল ও জমা</th>
                  <th className="py-3.5 px-4">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-emerald-950 text-sm block">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatDate(order.orderDate)}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 block">{order.customer?.name}</span>
                      <span className="text-[11px] text-emerald-700 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-500" /> {order.customer?.phone}
                      </span>
                    </td>

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

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        {formatDate(order.deliveryDate)}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</div>
                      <div className="text-[10px]">
                        <span className="text-emerald-700 font-bold">জমা: {formatCurrency(order.advancePaid)}</span>
                        {order.balanceAmount > 0 && (
                          <span className="text-rose-600 font-black ml-1.5">
                            বাকি: {formatCurrency(order.balanceAmount)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge
                        status={order.status as OrderStatus}
                        orderId={order._id}
                        interactive={true}
                        onStatusChange={fetchOrders}
                      />
                    </td>

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
        </div>
      )}
    </div>
  );
}
