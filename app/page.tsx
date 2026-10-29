'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AccountSection from '@/lib/components/AccountSection';
import { Wallet, Plus, LogOut, TrendingUp, PlusCircle, ArrowDownLeft, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  
  // State form transaksi
  const [txAccountId, setTxAccountId] = useState('');
  const [txType, setTxType] = useState('income');
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [loadingTx, setLoadingTx] = useState(false);

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.push('/login');
      } else {
        fetchData(session.user.id);
      }
    });
  }, [router]);

  const fetchData = async (userId: string) => {
    // Ambil data accounts
    const { data: accData } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    if (accData) {
      setAccounts(accData);
      if (accData.length > 0 && !txAccountId) setTxAccountId(accData[0].id);
    }

    // Ambil data transactions jika ada
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (txData) {
      setTransactions(txData);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Simpan Transaksi ke Cloud
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || !txAccountId) {
      alert('Pilih dompet dan masukkan nominal!');
      return;
    }

    setLoadingTx(true);
    const { error } = await supabase.from('transactions').insert([
      {
        account_id: txAccountId,
        type: txType,
        description: txDescription,
        amount: parseFloat(txAmount),
        category: txCategory || 'Umum',
        date: new Date().toISOString().split('T')[0], // Kolom tanggal wajib diisi otomatis
      },
    ]);

    setLoadingTx(false);

    if (error) {
      alert('Gagal menyimpan transaksi: ' + error.message);
    } else {
      alert('Transaksi berhasil disimpan!');
      setTxDescription('');
      setTxAmount('');
      setTxCategory('');
      setShowAddTransaction(false);
      fetchData(session.user.id);
    }
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance || 0), 0);

  if (!session) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Dashboard */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Keuanganku</h1>
            <p className="text-xs text-gray-400">Kelola dompet & transaksimu</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs flex items-center gap-1 text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>

        {/* KONDISI 1: Form Tambah Dompet */}
        {showAddAccount ? (
          <AccountSection 
            onSuccess={() => {
              setShowAddAccount(false);
              setShowAddTransaction(true); // Otomatis pindah ke halaman tambah transaksi
              fetchData(session.user.id);
            }} 
            onCancel={() => setShowAddAccount(false)}
          />
        ) : showAddTransaction ? (
          
          /* KONDISI 2: Halaman Tambah Transaksi */
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            
            {/* Grafik Pengeluaran Per Kategori */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Pengeluaran Per Kategori
              </h3>
              <div className="h-32 w-full flex items-center justify-center">
                {transactions.filter(t => t.type === 'expense').length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Belum ada data pengeluaran</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transactions.filter(t => t.type === 'expense')}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="category" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Form Tambah Transaksi */}
            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-indigo-600" /> Tambah Transaksi
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddTransaction(false)}
                  className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                </button>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium">Pilih Dompet</label>
                <select
                  value={txAccountId}
                  onChange={(e) => setTxAccountId(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm bg-white text-gray-800"
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name} (Rp {Number(acc.balance).toLocaleString('id-ID')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium">Deskripsi</label>
                <input
                  type="text"
                  placeholder="cth: Gaji Bulanan, Kopi"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm bg-white text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium">Nominal (Rp)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm bg-white text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setTxType('income')}
                    className={`py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition cursor-pointer ${
                      txType === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" /> Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('expense')}
                    className={`py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition cursor-pointer ${
                      txType === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> Pengeluaran
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium">Kategori (Opsional)</label>
                <input
                  type="text"
                  placeholder="cth: Makanan, Transport, Tagihan"
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm bg-white text-gray-800"
                />
              </div>

              <button
                type="submit"
                disabled={loadingTx}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md cursor-pointer"
              >
                {loadingTx ? 'Menyimpan...' : 'Simpan ke Cloud'}
              </button>
            </form>
          </div>
        ) : (
          
          /* KONDISI 3: Dashboard Utama Ringkasan Saldo */
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-gray-400">Total Saldo Keseluruhan</span>
                <h2 className="text-3xl font-extrabold text-gray-800 mt-1">
                  Rp {totalBalance.toLocaleString('id-ID')}
                </h2>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddAccount(true)}
                  className="cursor-pointer flex-1 text-xs flex items-center justify-center gap-1 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl transition font-semibold shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Tambah Dompet
                </button>
                <button
                  onClick={() => setShowAddTransaction(true)}
                  className="cursor-pointer flex-1 text-xs flex items-center justify-center gap-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl transition font-semibold"
                >
                  <PlusCircle className="w-4 h-4" /> Catat Transaksi
                </button>
              </div>
            </div>

            {/* List Dompet Terdaftar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-600" /> Dompet Terdaftar
              </h3>
              {accounts.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Belum ada dompet. Silakan tambah dompet terlebih dahulu.</p>
              ) : (
                <div className="space-y-2">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">{acc.name}</h4>
                        <p className="text-xs text-gray-400">{acc.type}</p>
                      </div>
                      <span className="font-bold text-sm text-indigo-600">Rp {Number(acc.balance).toLocaleString('id-ID')}</span>
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