'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AccountSection from '@/lib/components/AccountSection';
import { Wallet, Plus, LogOut, TrendingUp, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.push('/login');
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

  // Hitung total saldo keseluruhan dari semua dompet
  const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance || 0), 0);

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
            className="text-xs flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>

        {/* Jika mode tambah dompet aktif */}
        {showAddAccount ? (
          <AccountSection 
            onSuccess={() => {
              setShowAddAccount(false); // Kembali ke dashboard utama setelah simpan
              fetchAccounts(session.user.id);
            }} 
            onCancel={() => setShowAddAccount(false)}
          />
        ) : (
          <div className="space-y-6">
            
            {/* Kartu Ringkasan Total Saldo & Grafik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-2 md:col-span-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-indigo-600" /> Total Saldo Keseluruhan
                  </span>
                  <h2 className="text-2xl font-bold text-gray-800 mt-2">
                    Rp {totalBalance.toLocaleString('id-ID')}
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddAccount(true)}
                  className="cursor-pointer mt-4 w-full text-xs flex items-center justify-center gap-1.5 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-lg transition font-semibold shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Tambah Dompet Baru
                </button>
              </div>

              {/* Grafik Visualisasi Saldo per Dompet */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2 space-y-2">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> Grafik Saldo Dompet
                </h3>
                <div className="h-40 w-full">
                  {accounts.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xs text-gray-400 italic">Belum ada data untuk ditampilkan pada grafik.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={accounts}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Saldo']} />
                        <Bar dataKey="balance" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Daftar Rekening & Dompet Aktif */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-600" /> Dompet Terdaftar
              </h2>

              {accounts.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Belum ada rekening atau dompet yang terdaftar.</p>
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

          </div>
        )}

      </div>
    </main>
  );
}