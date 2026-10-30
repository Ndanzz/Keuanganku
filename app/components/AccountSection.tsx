"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AccountSection({ onSuccess }: { onSuccess?: () => void }) {
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("Bank");
  const [initialBalance, setInitialBalance] = useState("0");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Gagal menyimpan rekening:", err);
      alert("Error Supabase: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">💳</span>
          <h3 className="text-md font-semibold text-gray-800">Tambah Rekening & Dompet</h3>
        </div>
        <button
          type="button"
          className="text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition"
        >
          Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-medium text-sm transition ${
            loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100"
          }`}
        >
          {loading ? "Menyimpan Dompet..." : "Simpan Dompet"}
        </button>
      </form>
    </div>
  );
}