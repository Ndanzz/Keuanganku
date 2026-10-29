'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, ArrowLeft } from 'lucide-react';

interface AccountSectionProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AccountSection({ onSuccess, onCancel }: AccountSectionProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Bank');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) {
      alert('Nama dompet dan saldo awal harus diisi!');
      return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      alert('Sesi kedaluwarsa, silakan login ulang.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('accounts').insert([
      {
        user_id: session.user.id,
        name: name,
        type: type,
        balance: parseFloat(balance),
      },
    ]);

    setLoading(false);

    if (error) {
      alert('Gagal menyimpan: ' + error.message);
    } else {
      // Panggil fungsi sukses untuk kembali ke dashboard secara instan
      onSuccess();
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-indigo-600" /> Tambah Rekening & Dompet
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer text-xs flex items-center gap-1 text-gray-600 hover:text-gray-900 font-semibold bg-gray-100 px-3 py-2 rounded-lg transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>
      </div>

      <form onSubmit={handleAddAccount} className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">Nama Dompet/Bank</label>
            <input
              type="text"
              placeholder="Contoh: BCA, Gopay, Kas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg text-sm bg-white text-gray-800"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Tipe</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg text-sm bg-white text-gray-800"
            >
              <option value="Bank">Bank</option>
              <option value="E-Wallet">E-Wallet</option>
              <option value="Cash">Cash / Tunai</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Saldo Awal</label>
            <input
              type="number"
              placeholder="0"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg text-sm bg-white text-gray-800"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition cursor-pointer"
        >
          {loading ? 'Menyimpan...' : 'Simpan Dompet'}
        </button>
      </form>
    </section>
  );
}