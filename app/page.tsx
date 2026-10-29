'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AccountSection from '@/lib/components/AccountSection';
import { Wallet, Plus, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.push('/login'); // Arahkan ke login jika belum masuk
      } else {
        fetchAccounts(session.user.id);
      }
    });
  }, [router]);

  const fetchAccounts = async (userId: string) => {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    if (!error && data) {
      setAccounts(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!session) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Dashboard */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Keuanganku</h1>
            <p className="text-xs text-gray-500">Kelola dompet dan transaksimu dengan mudah</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition font-medium"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>

        {/* Konten Utama: Jika showAddAccount true, tampilkan form. Jika false, tampilkan dashboard */}
        {showAddAccount ? (
          <AccountSection 
            onSuccess={() => {
              setShowAddAccount(false); // Kembali ke dashboard otomatis
              fetchAccounts(session.user.id); // Perbarui data dompet
            }} 
            onCancel={() => setShowAddAccount(false)}
          />
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-indigo-600" /> Daftar Rekening & Dompet
                </h2>
                <button
                  onClick={() => setShowAddAccount(true)}
                  className="cursor-pointer text-xs flex items-center gap-1 text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-lg transition font-semibold shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Tambah
                </button>
              </div>

              {/* List Dompet di Dashboard */}
              {accounts.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p className="text-xs text-gray-400 italic mb-2">Belum ada rekening atau dompet.</p>
                  <button
                    onClick={() => setShowAddAccount(true)}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    + Tambah Dompet Pertama
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="p-4 bg-gray-50 border border-gray-100 rounded-lg flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">{acc.name}</h4>
                        <p className="text-xs text-gray-500">{acc.type} • Saldo: Rp {Number(acc.balance).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aktivitas Terbaru */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800">Aktivitas Terbaru</h3>
                <span className="text-[10px] text-gray-400">Terhubung ke Supabase</span>
              </div>
              <p className="text-xs text-gray-400 italic">Pilih dompet di atas atau tambahkan transaksi baru untuk memperbarui saldo secara otomatis.</p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}