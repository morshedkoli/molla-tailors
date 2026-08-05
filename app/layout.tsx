import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'টেইলর অর্ডার ম্যানেজমেন্ট সিস্টেম | টেলারিং ও সেলাই সলিউশন',
  description: 'প্রিমিয়াম টেলারিং ও সেলাই ট্র্যাকিং অর্ডার ম্যানেজমেন্ট সফটওয়্যার',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-[#f4fbf7] text-[#064e3b] font-sans antialiased selection:bg-emerald-200 selection:text-emerald-950 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <footer className="bg-emerald-950 border-t border-emerald-900 text-emerald-300 py-6 text-center text-xs font-bold no-print">
          <p>© {new Date().getFullYear()} টেইলর ম্যানেজমেন্ট সিস্টেম। সর্বস্বত্ব সংরক্ষিত।</p>
        </footer>
      </body>
    </html>
  );
}
