"use client";

import { useState } from "react";
import FinancialChart from "./components/FinancialChart";
import AccountSection from "./components/AccountSection";

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      {/* Header Utama Aplikasi */}
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Keuanganku</h1>
        <p className="text-sm text-gray-600">Kelola dompet, catat transaksi, dan pantau tren finansialmu dengan mudah.</p>
      </header>

      {/* Bagian Ringkasan Dompet & Akun (Termasuk Form Tambah Rekening) */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Dompet & Akun</h2>
        <AccountSection onSuccess={handleSuccess} />
      </section>

      {/* Bagian Analisis Tren Keuangan */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Analisis Tren Keuangan</h2>
        <FinancialChart key={refreshKey} />
      </section>
    </main>
  );
}