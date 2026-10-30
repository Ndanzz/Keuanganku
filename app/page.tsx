"use client";

import { useState } from "react";
import FinancialChart from "./components/FinancialChart";
import AccountSection from "./components/AccountSection";
import { supabase } from "../lib/supabase"; // <--- TAMBAHKAN BARIS INI DI ATAS

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("pemasukan");
  const [loadingTrx, setLoadingTrx] = useState(false);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingTrx(true);

    try {
      const { error } = await supabase.from("transactions").insert([
        {
          amount: Number(amount),
          type: type,
          date: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setAmount("");
      setRefreshKey((prev) => prev + 1);
      alert("Transaksi berhasil disimpan!");
    } catch (err: any) {
      alert("Gagal menyimpan transaksi: " + err.message);
    } finally {
      setLoadingTrx(false);
    }
  };

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Keuanganku</h1>
        <p className="text-sm text-gray-600">Kelola dompet, catat transaksi, dan pantau tren finansialmu dengan mudah.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Dompet & Akun</h2>
          <AccountSection onSuccess={handleSuccess} />
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tambah Transaksi Baru</h2>
          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah (Rp)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="Contoh: 50000"
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Jenis Transaksi</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
              >
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loadingTrx}
              className={`w-full py-3 rounded-xl text-white font-medium text-sm transition ${
                loadingTrx ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100"
              }`}
            >
              {loadingTrx ? "Menyimpan Transaksi..." : "Simpan Transaksi"}
            </button>
          </form>
        </section>
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Analisis Tren Keuangan</h2>
        <FinancialChart key={refreshKey} />
      </section>
    </main>
  );
}