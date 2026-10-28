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
  Search,
  Loader2,
  LogOut,
  User
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

const PIE_COLORS = ['#f43f5e', '#3b82f6', '#eab308', '#a855f7', '#14b8a6', '#f97316', '#64748b'];

export default function PersonalFinanceApp() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const router = useRouter();

  // 1. Cek Sesi Pengguna
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUserEmail(session.user.email || 'User');
        fetchTransactions();
      }
    };

    checkUser();
  }, [router]);

  // 2. Fetch Data Transaksi Milik User Terkait
  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data:', error.message);
    } else if (data) {
      setTransactions(data as Transaction[]);
    }
    setLoading(false);
  };

  // 3. Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const barChartData = [
    {
      name: 'Ringkasan',
      Pemasukan: totalIncome,
      Pengeluaran: totalExpense,
    },
  ];

  const expenseByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc: { [key: string]: number }, t) => {
      const cat = t.category || 'Lainnya';
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {});

  const pieChartData = Object.keys(expenseByCategory).map((cat) => ({
    name: cat,
    value: expenseByCategory[cat],
  }));

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || Number(amount) <= 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newTransaction = {
      description,
      amount: parseFloat(amount),
      type,
      category: category.trim() || (type === 'income' ? 'Gaji/Lainnya' : 'Umum'),
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([newTransaction])
      .select();

    if (error) {
      alert('Gagal menyimpan: ' + error.message);
    } else if (data) {
      setTransactions([data[0] as Transaction, ...transactions]);
      setDescription('');
      setAmount('');
      setCategory('');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (error) {
      alert('Gagal menghapus: ' + error.message);
    } else {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const exportToCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['ID,Tanggal,Deskripsi,Jenis,Kategori,Nominal (IDR)\n'];
    const rows = transactions.map((t) => 
      `"${t.id}","${t.date}","${t.description.replace(/"/g, '""')}","${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}","${t.category.replace(/"/g, '""')}",${t.amount}`
    );

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VibeFinance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header dengan Info User & Logout */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Keuanganku</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <User size={14} /> {userEmail || 'Memuat...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              disabled={transactions.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                transactions.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Download size={16} />
              Ekspor CSV
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-semibold text-sm transition-all"
              title="Keluar Akun"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </header>

        {/* Ringkasan Saldo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Saldo</p>
              <h3 className={`text-xl font-extrabold mt-1 ${balance < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {formatRupiah(balance)}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Wallet size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pemasukan</p>
              <h3 className="text-xl font-extrabold mt-1 text-emerald-600">{formatRupiah(totalIncome)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowUpCircle size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pengeluaran</p>
              <h3 className="text-xl font-extrabold mt-1 text-rose-600">{formatRupiah(totalExpense)}</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <ArrowDownCircle size={24} />
            </div>
          </div>
        </div>

        {/* Visualisasi Grafik */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-md font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-600" />
              Perbandingan Keuangan
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(val) => `Rp${val / 1000}k`} />
                  <Tooltip formatter={(value: any) => formatRupiah(Number(value))} />
                  <Legend />
                  <Bar dataKey="Pemasukan" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-md font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PieIcon size={18} className="text-indigo-600" />
              Pengeluaran Per Kategori
            </h2>
            <div className="h-64 w-full flex items-center justify-center">
              {pieChartData.length === 0 ? (
                <p className="text-sm text-slate-400">Belum ada data pengeluaran</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatRupiah(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Section Main */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PlusCircle size={20} className="text-indigo-600" />
              Tambah Transaksi
            </h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi</label>
                <input
                  type="text"
                  placeholder="cth: Gaji Bulanan, Kopi"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      type === 'income'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      type === 'expense'
                        ? 'bg-rose-50 border-rose-500 text-rose-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Pengeluaran
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori (Opsional)</label>
                <input
                  type="text"
                  placeholder="cth: Makanan, Transport, Tagihan"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm shadow-sm"
              >
                Simpan ke Cloud
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900">Riwayat Transaksi</h2>
              
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === 'all' ? 'bg-white font-bold text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterType('income')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === 'income' ? 'bg-white font-bold text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Pemasukan
                </button>
                <button
                  onClick={() => setFilterType('expense')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === 'expense' ? 'bg-white font-bold text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Pengeluaran
                </button>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari deskripsi atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <Loader2 className="animate-spin text-indigo-600" size={24} />
                <p className="text-xs">Mengambil data transaksi kamu...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                {transactions.length === 0 
                  ? 'Belum ada transaksi tersimpan untuk akun ini.' 
                  : 'Tidak ada data yang cocok dengan pencarian.'}
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {t.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{t.description}</p>
                        <p className="text-xs text-slate-400">
                          {t.date} • <span className="italic">{t.category}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-bold text-sm ${
                          t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}{formatRupiah(Number(t.amount))}
                      </span>
                      <button
                        onClick={() => handleDeleteTransaction(t.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Hapus Transaksi"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}