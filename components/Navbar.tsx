'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  Package,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; username?: string } | null>(null);
  const [settings, setSettings] = useState<{ shopName?: string; tagline?: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ])
      .then(([userData, settingsData]) => {
        if (userData.authenticated) setUser(userData.user);
        if (settingsData.success) setSettings(settingsData.settings);
      })
      .catch(() => {});
  }, []);

  // Hide Navbar on Login page or standalone print receipt page
  if (pathname === '/login' || pathname.includes('/receipt')) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const shopName = settings?.shopName || 'থ্রেড এন্ড ক্রাফট টেইলরস';
  const tagline = settings?.tagline || 'বিসপোক টেইলর ও সেলাই ওয়ার্কশপ';

  const navLinks = [
    { name: 'ড্যাশবোর্ড', href: '/', icon: LayoutDashboard },
    { name: 'অর্ডার সমূহ', href: '/orders', icon: ShoppingBag },
    { name: 'নতুন অর্ডার', href: '/orders/new', icon: PlusCircle },
    { name: 'প্রোডাক্ট ও মাপ', href: '/products', icon: Package },
    { name: 'সেটিংসে', href: '/settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-40 bg-emerald-950/90 backdrop-blur-md border-b border-emerald-800/50 text-white shadow-lg no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Generated Logo Badge */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/logo.png"
              alt="Tailor Shop Logo"
              className="w-9 h-9 rounded-xl object-cover border border-emerald-500/40 shadow-md group-hover:scale-105 transition-transform"
            />
            <div className="whitespace-nowrap">
              <span className="text-lg sm:text-xl font-bold tracking-wider bg-gradient-to-r from-emerald-200 via-teal-100 to-white bg-clip-text text-transparent block">
                {shopName}
              </span>
              <span className="block text-[9px] text-emerald-400 font-medium tracking-widest uppercase">
                {tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5 whitespace-nowrap">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-800/80 text-emerald-200 border border-emerald-600/50 shadow-inner'
                      : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-emerald-400/70'}`} />
                  <span className="whitespace-nowrap">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="hidden lg:flex items-center gap-3 shrink-0 whitespace-nowrap">
            {user && (
              <div className="flex items-center gap-2 text-xs text-emerald-200/90 bg-emerald-900/50 px-3 py-1.5 rounded-lg border border-emerald-800/60 font-bold whitespace-nowrap">
                <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[120px]">{user.name || user.username}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-300 hover:bg-red-950/60 hover:text-red-300 hover:border-red-800 border border-emerald-800/60 transition-all cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              লগআউট
            </button>
          </div>

          {/* Mobile & Tablet menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-emerald-200 hover:bg-emerald-900 focus:outline-none"
              aria-label="মোবাইল মেনু"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950/95 border-b border-emerald-800/80 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-800 text-white'
                    : 'text-emerald-100/80 hover:bg-emerald-900/80'
                }`}
              >
                <Icon className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-emerald-900 flex items-center justify-between px-2">
            <span className="text-xs text-emerald-300 font-bold">
              এডমিন: <span className="text-white">{user?.name || 'লগইন'}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-300 bg-red-950/50 hover:bg-red-900 border border-red-800/60"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              লগআউট
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
