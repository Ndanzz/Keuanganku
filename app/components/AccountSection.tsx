"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase"; // Sesuaikan jalur impor Supabase

export default function TransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("pemasukan");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Tombol dikunci saat proses berjalan

    try {
      // Proses simpan data ke Supabase
      const { error } = await supabase.from("transactions").insert([
        {
          amount: Number(amount),
          type: type,
          date: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Reset form setelah berhasil
      setAmount("");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Gagal menyimpan transaksi:", err);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false); // <--- KUNCI UTAMA: Memastikan tombol aktif kembali
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800">Tambah Transaksi Baru</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Contoh: 50000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="pemasukan">Pemasukan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-xl text-white font-medium transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {loading ? "Menyimpan..." : "Simpan Transaksi"}
      </button>
    </form>
  );
}