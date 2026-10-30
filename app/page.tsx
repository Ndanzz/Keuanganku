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

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);

  // State: Dompet & Akun
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("Bank");
  const [initialBalance, setInitialBalance] = useState("0");
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [accountsList, setAccountsList] = useState<any[]>([]);

  // State: Target Tabungan (Savings Goals)
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("");
  const [loadingGoal, setLoadingGoal] = useState(false);
  const [goalsList, setGoalsList] = useState<any[]>([]);

  // State: Form Pemasukan & Pengeluaran
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDesc, setIncomeDesc] = useState("");
  const [loadingIncome, setLoadingIncome] = useState(false);

  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [loadingExpense, setLoadingExpense] = useState(false);

  // State: Transaksi & Statistik
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Fetch Semua Data dari Supabase
  useEffect(() => {
    const fetchAllData = async () => {
      // 1. Ambil Data Dompet
      const { data: accData, error: accError } = await supabase
        .from("accounts")
        .select("*")
        .order("id", { ascending: false });

      let currentAccounts = [];
      if (!accError && accData) {
        setAccountsList(accData);
        currentAccounts = accData;
      }

      // 2. Ambil Data Target Keuangan (Goals)
      const { data: goalData, error: goalError } = await supabase
        .from("goals")
        .select("*")
        .order("id", { ascending: false });

      if (!goalError && goalData) {
        setGoalsList(goalData);
      }

      // 3. Ambil Data Transaksi
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      let inc = 0;
      let exp = 0;

      if (!txError && txData) {
        setTransactions(txData);

        txData.forEach((tx) => {
          const amt = Number(tx.amount || 0);
          const tType = String(tx.type || "").toLowerCase();
          if (tType === "pemasukan") {
            inc += amt;
          } else if (tType === "pengeluaran") {
            exp += amt;
          }
        });

        // Proses Data Grafik Recharts
        const grouped: { [key: string]: { pemasukan: number; pengeluaran: number } } = {};

        txData.forEach((tx) => {
          const month = new Date(tx.date).toLocaleString("id-ID", {
            month: "short",
            year: "numeric",
          });

          if (!grouped[month]) {
            grouped[month] = { pemasukan: 0, pengeluaran: 0 };
          }

          const tType = String(tx.type || "").toLowerCase();
          if (tType === "pemasukan") {
            grouped[month].pemasukan += Number(tx.amount || 0);
          } else if (tType === "pengeluaran") {
            grouped[month].pengeluaran += Number(tx.amount || 0);
          }
        });

        const formattedChartData = Object.keys(grouped).map((month) => ({
          month,
          pemasukan: grouped[month].pemasukan,
          pengeluaran: grouped[month].pengeluaran,
        }));

        setChartData(formattedChartData);
      }

      setTotalIncome(inc);
      setTotalExpense(exp);

      // Hitung Total Saldo Keseluruhan (Total Saldo Awal Dompet + Total Pemasukan - Total Pengeluaran)
      const initialAccBalance = currentAccounts.reduce((sum, acc) => {
        const rawBal = acc.balance ?? acc.initial_balance ?? acc.amount ?? acc.jumlah ?? 0;
        return sum + Number(rawBal);
      }, 0);

      setTotalBalance(initialAccBalance + inc - exp);
    };

    fetchAllData();
  }, [refreshKey]);

  // Handler Simpan Dompet
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAccount(true);
    try {
      const payload: any = {
        name: accountName,
        type: accountType,
        balance: Number(initialBalance),
      };

      const { error } = await supabase.from("accounts").insert([payload]);
      if (error) {
        // Coba fallback jika kolom bernama initial_balance
        delete payload.balance;
        payload.initial_balance = Number(initialBalance);
        const { error: err2 } = await supabase.from("accounts").insert([payload]);
        if (err2) throw err2;
      }

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

  // Handler Simpan Target Tabungan
  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingGoal(true);
    try {
      const { error } = await supabase.from("goals").insert([
        {
          title: goalTitle,
          target_amount: Number(goalTarget),
          current_amount: Number(goalCurrent || 0),
        },
      ]);
      if (error) throw error;

      setGoalTitle("");
      setGoalTarget("");
      setGoalCurrent("");
      handleRefresh();
      alert("Target keuangan berhasil disimpan!");
    } catch (err: any) {
      alert("Gagal menyimpan target: " + err.message);
    } finally {
      setLoadingGoal(false);
    }
  };

  // Handler Simpan Pemasukan
  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingIncome(true);
    try {
      const { error } = await supabase.from("transactions").insert([
        {
          amount: Number(incomeAmount),
          type: "Pemasukan",
          description: incomeDesc || "Pemasukan",
          category: "Umum",
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

  // Handler Simpan Pengeluaran
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingExpense(true);
    try {
      const { error } = await supabase.from("transactions").insert([
        {
          amount: Number(expenseAmount),
          type: "Pengeluaran",
          description: expenseDesc || "Pengeluaran",
          category: "Umum",
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
      {/* Header & Ringkasan Total Saldo Keseluruhan */}
      <header className="space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Keuanganku</h1>
          <p className="text-sm text-gray-600">Kelola dompet, catat pemasukan & pengeluaran, serta pantau tren finansialmu.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-6 rounded-2xl shadow-lg space-y-1">
            <p className="text-xs font-medium text-indigo-200 uppercase tracking-wider">Total Saldo Keseluruhan</p>
            <h2 className="text-3xl font-extrabold">Rp {totalBalance.toLocaleString("id-ID")}</h2>
            <p className="text-xs text-indigo-100 pt-1">Akumulasi dompet, pemasukan & pengeluaran</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 space-y-1">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Total Pemasukan</p>
            <h2 className="text-2xl font-bold text-emerald-700">Rp {totalIncome.toLocaleString("id-ID")}</h2>
            <p className="text-xs text-gray-400 pt-1">Keseluruhan pemasukan tercatat</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 space-y-1">
            <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">Total Pengeluaran</p>
            <h2 className="text-2xl font-bold text-rose-700">Rp {totalExpense.toLocaleString("id-ID")}</h2>
            <p className="text-xs text-gray-400 pt-1">Keseluruhan pengeluaran tercatat</p>
          </div>
        </div>
      </header>

      {/* Section 1: Manajemen Dompet & Akun */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">💳</span>
          <h2 className="text-lg font-semibold text-gray-800">Tambah Rekening & Dompet</h2>
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

        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Daftar Dompet & Akun Terdaftar</h3>
          {accountsList.length === 0 ? (
            <p className="text-xs text-gray-400">Belum ada dompet atau rekening yang ditambahkan.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {accountsList.map((acc) => {
                const bal = Number(acc.balance ?? acc.initial_balance ?? acc.amount ?? acc.jumlah ?? 0);
                return (
                  <div key={acc.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800 text-sm">{acc.name}</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{acc.type}</span>
                    </div>
                    <p className="text-xs text-gray-500">Saldo Dompet:</p>
                    <p className="text-base font-bold text-indigo-600">Rp {bal.toLocaleString("id-ID")}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Fitur Target Keuangan (Savings Goals) */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <h2 className="text-lg font-semibold text-gray-800">Target Keuangan & Tabungan</h2>
        </div>

        <form onSubmit={handleGoalSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nama Target</label>
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                required
                placeholder="Contoh: Beli Laptop, Liburan"
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah Target (Rp)</label>
              <input
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                required
                placeholder="Contoh: 10000000"
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Terkumpul Saat Ini (Rp)</label>
              <input
                type="number"
                value={goalCurrent}
                onChange={(e) => setGoalCurrent(e.target.value)}
                placeholder="Contoh: 2000000"
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loadingGoal}
            className={`w-full py-3 rounded-xl text-white font-medium text-sm transition ${
              loadingGoal ? "bg-purple-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-100"
            }`}
          >
            {loadingGoal ? "Menyimpan Target..." : "Simpan Target Tabungan"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Daftar Target Tabungan</h3>
          {goalsList.length === 0 ? (
            <p className="text-xs text-gray-400">Belum ada target tabungan yang dibuat.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalsList.map((goal) => {
                const target = Number(goal.target_amount || 0);
                const current = Number(goal.current_amount || 0);
                const percent = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
                return (
                  <div key={goal.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800 text-sm">{goal.title}</span>
                      <span className="text-xs font-bold text-purple-600">{percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Terkumpul: Rp {current.toLocaleString("id-ID")}</span>
                      <span>Target: Rp {target.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Form Pemasukan & Pengeluaran */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Section 4: Grafik Tren Keuangan */}
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

      {/* Section 5: Riwayat Transaksi */}
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
                      <span className={`px-2.5 py-1 rounded-full text-xs ${String(tx.type).toLowerCase() === 'pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {String(tx.type).toUpperCase()}
                      </span>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap font-bold ${String(tx.type).toLowerCase() === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
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