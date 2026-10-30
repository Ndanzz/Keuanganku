"use client";

import { useState } from "react";
import FinancialChart from "./components/FinancialChart";
import AccountSection from "./components/AccountSection";

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCancel = () => {
    // Aksi ketika dibatalkan (opsional)
  };

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Utama Aplikasi */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Keuanganku</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola dompet, catat transaksi, dan pantau tren finansialmu dengan mudah.</p>
        </div>
      </header>

      {/* Bagian Manajemen Dompet / Akun */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Dompet & Akun</h2>
        <AccountSection onSuccess={handleSuccess} />
      </section>

      {/* Bagian Komponen Grafik Analisis Tren Keuangan */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Analisis Tren Keuangan</h2>
        <FinancialChart />
      </section>

      {/* Bagian Riwayat & Tabel Transaksi */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Riwayat Transaksi</h2>
        </div>
        <div className="text-sm text-gray-500 py-8 text-center border-2 border-dashed rounded-xl">
          Tabel riwayat pemasukan dan pengeluaran aktif termuat di sini.
        </div>
      </section>
    </main>
  );
}