'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  PlusCircle,
  PieChart as PieIcon,
  BarChart3,
  Download,
} from 'lucide-react';
import AccountSection from '@/lib/components/AccountSection';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifikasi sesi pengguna
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 font-medium">Memuat data Keuanganku...</p>
      </div>
    );
  }

  return (
    <main className="p-4 max-w-4xl mx-auto space-y-6 min-h-screen bg-gray-50 text-gray-900">
      {/* Header Aplikasi */}
      <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Keuanganku</h1>
          <p className="text-xs text-gray-500">Kelola dompet dan transaksimu dengan mudah</p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className="text-xs text-red-500 hover:text-red-700 font-medium border border-red-200 px-3 py-1.5 rounded-lg"
        >
          Keluar
        </button>
      </header>

      {/* Section 1: Widget Rekening & Dompet Digital */}
      <AccountSection />

      {/* Section 2: Ringkasan Transaksi & Dashboard */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Aktivitas Terbaru</h2>
          <span className="text-xs text-gray-400">Terhubung ke Supabase</span>
        </div>
        <p className="text-sm text-gray-500">
          Pilih dompet di atas atau tambahkan transaksi baru untuk memperbarui saldo secara otomatis.
        </p>
      </section>
    </main>
  );
}