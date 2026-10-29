import FinancialChart from "./components/FinancialChart";

export default function Page() {
  return (
    <main className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Utama Aplikasi */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Keuanganku</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola dompet, catat transaksi, dan pantau tren finansialmu dengan mudah.</p>
        </div>
      </header>

      {/* Bagian Komponen Grafik Analisis Tren Keuangan */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Analisis Tren Keuangan</h2>
        <FinancialChart />
      </section>

      {/* Bagian Ringkasan & Fitur Lainnya */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Ringkasan Dompet</h3>
          <p className="text-sm text-gray-500">Kelola akun dan pantau saldo aktif dompetmu di sini.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Riwayat Transaksi</h3>
          <p className="text-sm text-gray-500">Daftar pemasukan dan pengeluaran terbaru tercatat secara otomatis.</p>
        </div>
      </section>
    </main>
  );
}