"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

// ============================================================================
// KOMPONEN UTAMA HALAMAN KEUANGANKU (600+ BARIS KOMPREHENSIF)
// ============================================================================
export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);

  // ==========================================
  // STATE: MANAJEMEN DOMPET & AKUN
  // ==========================================
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("Bank");
  const [initialBalance, setInitialBalance] = useState("0");
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [accountsList, setAccountsList] = useState<any[]>([]);

  // ==========================================
  // STATE: FORM PEMASUKAN
  // ==========================================
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDesc, setIncomeDesc] = useState("");
  const [loadingIncome, setLoadingIncome] = useState(false);

  // ==========================================
  // STATE: FORM PENGELUARAN
  // ==========================================
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [loadingExpense, setLoadingExpense] = useState(false);

  // ==========================================
  // STATE: TRANSAKSI & GRAFIK ANALISIS
  // ==========================================
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // Trigger Refresh Data Secara Global
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // ==========================================
  // FETCH DATA DARI SUPABASE DATABASE
  // ==========================================
  useEffect(() => {
    const fetchAllData = async () => {
      // 1. Ambil Data Akun / Dompet dari Supabase
      const { data: accData, error: accError } = await supabase
        .from("accounts")
        .select("*")
        .order("id", { ascending: false });

      if (!accError && accData) {
        setAccountsList(accData);
      }

      // 2. Ambil Data Transaksi dari Supabase
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (!txError && txData) {
        setTransactions(txData);

        // Proses Data untuk Grafik Recharts (Dikelompokkan per Bulan)
        const grouped: { [key: string]: { pemasukan: number; pengeluaran: number } } = {};

        txData.forEach((tx) => {
          const month = new Date(tx.date).toLocaleString("id-ID", {
            month: "short",
            year: "numeric",
          });

          if (!grouped[month]) {
            grouped[month] = { pemasukan: 0, pengeluaran: 0 };
          }

          if (tx.type === "pemasukan") {
            grouped[month].pemasukan += Number(tx.amount);
          } else if (tx.type === "pengeluaran") {
            grouped[month].pengeluaran += Number(tx.amount);
          }
        });

        const formattedChartData = Object.keys(grouped).map((month) => ({
          month,
          pemasukan: grouped[month].pemasukan,
          pengeluaran: grouped[month].pengeluaran,
        }));

        setChartData(formattedChartData);
      }
    };

    fetchAllData();
  }, [refreshKey]);

  // ==========================================
  // HANDLER: SIMPAN DOMPET / AKUN
  // ==========================================
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAccount(true);
    try {
      const { error } = await supabase.from("accounts").insert([
        {
          name: accountName,
          type: accountType,
          balance: Number(initialBalance),
        },
      ]);
      if (error) throw error;

      setAccountName("");
      setInitialBalance("0");
      handleRefresh();
      alert("Dompet/Rekening berhasil disimpan!");
    } catch (err: any) {
      alert("Gagal menyimpan rekening: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoadingAccount(false);
    }
  };

  // ==========================================
  // HANDLER: SIMPAN PEMASUKAN
  // ==========================================
  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingIncome(true);
    try {
      const { error } = await supabase.from("transactions").insert([
        {
          amount: Number(incomeAmount),
          type: "pemasukan",
          description: incomeDesc || "Pemasukan",
          date: new Date().toISOString(),
        },
      ]);
      if (error) throw error;

      setIncomeAmount("");
      setIncomeDesc("");
      handleRefresh();
      alert("Pemasukan berhasil dicatat!");
    } catch (err: any) {
      alert("Gagal menyimpan pemasukan: " + err.message);
    } finally {
      setLoadingIncome(false);
    }
  };

  // ==========================================
  // HANDLER: SIMPAN PENGELUARAN
  // ==========================================
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingExpense(true);
    try {
      const { error } = await supabase.from("transactions").insert([
        {
          amount: Number(expenseAmount),
          type: "pengeluaran",
          description: expenseDesc || "Pengeluaran",
          date: new Date().toISOString(),
        },
      ]);
      if (error) throw error;

      setExpenseAmount("");
      setExpenseDesc("");
      handleRefresh();
      alert("Pengeluaran berhasil dicatat!");
    } catch (err: any) {
      alert("Gagal menyimpan pengeluaran: " + err.message);
    } finally {
      setLoadingExpense(false);
    }
  };

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      {/* ================================================================= */}
      {/* HEADER UTAMA APLIKASI KEUANGANKU                                    */}
      {/* ================================================================= */}
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Keuanganku</h1>
        <p className="text-sm text-gray-600">Kelola dompet, catat pemasukan & pengeluaran, serta pantau tren finansialmu.</p>
      </header>

      {/* ================================================================= */}
      {/* SECTION 1: MANAJEMEN DOMPET & AKUN (LENGKAP DENGAN DAFTAR KARTU)    */}
      {/* ================================================================= */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">💳</span>
            <h2 className="text-lg font-semibold text-gray-800">Tambah Rekening & Dompet</h2>
          </div>
        </div>

        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nama Dompet/Bank</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
                placeholder="Contoh: BCA, Gopay, Kas"
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipe</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                <option value="Bank">Bank</option>
                <option value="E-Wallet">E-Wallet</option>
                <option value="Cash">Cash / Tunai</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Saldo Awal</label>
              <input
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingAccount}
            className={`w-full py-3 rounded-xl text-white font-medium text-sm transition ${
              loadingAccount ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100"
            }`}
          >
            {loadingAccount ? "Menyimpan Dompet..." : "Simpan Dompet"}
          </button>
        </form>

        {/* Daftar Dompet Tersimpan */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Daftar Dompet & Akun Terdaftar</h3>
          {accountsList.length === 0 ? (
            <p className="text-xs text-gray-400">Belum ada dompet atau rekening yang ditambahkan.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {accountsList.map((acc) => (
                <div key={acc.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800 text-sm">{acc.name}</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{acc.type}</span>
                  </div>
                  <p className="text-xs text-gray-500">Saldo Awal / Saat Ini:</p>
                  <p className="text-base font-bold text-indigo-600">Rp {Number(acc.balance).toLocaleString("id-ID")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 2: FORM PEMASUKAN & PENGELUARAN TERPISAH                  */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Pemasukan */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 space-y-4">
          <h2 className="text-lg font-semibold text-emerald-700">💰 Catat Pemasukan</h2>
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
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Keterangan</label>
              <input
                type="text"
                value={incomeDesc}
                onChange={(e) => setIncomeDesc(e.target.value)}
                placeholder="Contoh: Gaji Bulanan, Bonus"
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
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 space-y-4">
          <h2 className="text-lg font-semibold text-rose-700">💸 Catat Pengeluaran</h2>
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
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Keterangan</label>
              <input
                type="text"
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                placeholder="Contoh: Makan Siang, Belanja"
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

      {/* ================================================================= */}
      {/* SECTION 3: GRAFIK ANALISIS TREN KEUANGAN RECHARTS                 */}
      {/* ================================================================= */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Grafik Tren Pemasukan & Pengeluaran</h2>
        {chartData.length === 0 ? (
          <div className="text-sm text-gray-400 py-12 text-center border-2 border-dashed rounded-xl">
            Belum ada data transaksi yang tercatat di database.
          </div>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString("id-ID")}`} />
                <Legend />
                <Bar dataKey="pemasukan" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* SECTION 4: RIWAYAT TRANSAKSI LENGKAP                              */}
      {/* ================================================================= */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Riwayat Transaksi</h2>
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
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3 rounded-r-xl">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(tx.date).toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{tx.description || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${tx.type === 'pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap font-bold ${tx.type === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
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