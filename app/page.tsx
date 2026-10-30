"use client";

import { useState, useEffect } from "react";
import FinancialChart from "./components/FinancialChart";
import AccountSection from "./components/AccountSection";
import { supabase } from "../lib/supabase";

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // State untuk form Pemasukan
  const [incomeAmount, setIncomeAmount] = useState("");
  const [loadingIncome, setLoadingIncome] = useState(false);

  // State untuk form Pengeluaran
  const [expenseAmount, setExpenseAmount] = useState("");
  const [loadingExpense, setLoadingExpense] = useState(false);

  // State untuk Riwayat Transaksi
  const [transactions, setTransactions] = useState<any[]>([]);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    fetchTransactions();
  };

  // Fungsi Ambil Riwayat Transaksi dari Supabase
  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [refreshKey]);

  // Handler Simpan Pemasukan
  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingIncome(true);
    try {
      const { error } = await supabase.from("transactions").insert([
        {
          amount: Number(incomeAmount),
          type: "pemasukan",
          description: "Pemasukan",
          date: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
      setIncomeAmount("");
      handleSuccess();
      alert("Pemasukan berhasil dicatat!");
    } catch (err: any) {
      alert("Gagal menyimpan pemasukan: " + err.message);
    } finally {
      setLoadingIncome(false);
    }
  };

  // Handler Simpan Pengeluaran
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingExpense(true);
    try {
      const { error } = await supabase.from("transactions").insert([
        {
          amount: Number(expenseAmount),
          type: "pengeluaran",
          description: "Pengeluaran",
          date: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
      setExpenseAmount("");
      handleSuccess();
      alert("Pengeluaran berhasil dicatat!");
    } catch (err: any) {
      alert("Gagal menyimpan pengeluaran: " + err.message);
    } finally {
      setLoadingExpense(false);
    }
  };

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      {/* Header Utama */}
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Keuanganku</h1>
        <p className="text-sm text-gray-600">Kelola dompet, catat pemasukan & pengeluaran, serta pantau tren finansialmu.</p>
      </header>

      {/* Bagian Manajemen Dompet */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Dompet & Akun</h2>
        <AccountSection onSuccess={handleSuccess} />
      </section>

      {/* Grid: Form Pemasukan & Form Pengeluaran Terpisah */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Pemasukan */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
          <h2 className="text-lg font-semibold text-emerald-700 mb-4">💰 Catat Pemasukan</h2>
          <form onSubmit={handleIncomeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah Pemasukan (Rp)</label>
              <input
                type="number"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
                required
                placeholder="Contoh: 1500000"
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loadingIncome}
              className={`w-full py-3 rounded-xl text-white font-medium text-sm transition ${
                loadingIncome ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100"
              }`}
            >
              {loadingIncome ? "Menyimpan Pemasukan..." : "Simpan Pemasukan"}
            </button>
          </form>
        </section>

        {/* Form Pengeluaran */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100">
          <h2 className="text-lg font-semibold text-rose-700 mb-4">💸 Catat Pengeluaran</h2>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah Pengeluaran (Rp)</label>
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                required
                placeholder="Contoh: 50000"
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loadingExpense}
              className={`w-full py-3 rounded-xl text-white font-medium text-sm transition ${
                loadingExpense ? "bg-rose-300 cursor-not-allowed" : "bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-100"
              }`}
            >
              {loadingExpense ? "Menyimpan Pengeluaran..." : "Simpan Pengeluaran"}
            </button>
          </form>
        </section>
      </div>

      {/* Bagian Grafik Analisis Tren Keuangan */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Grafik Tren Pemasukan & Pengeluaran</h2>
        <FinancialChart key={refreshKey} />
      </section>

      {/* Bagian Riwayat Transaksi */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Transaksi</h2>
        {transactions.length === 0 ? (
          <div className="text-sm text-gray-400 py-6 text-center border-2 border-dashed rounded-xl">
            Belum ada riwayat transaksi tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Tanggal</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3 rounded-r-xl">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{new Date(tx.date).toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-3 font-medium">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${tx.type === 'pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-bold ${tx.type === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      Rp {Number(tx.amount).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}