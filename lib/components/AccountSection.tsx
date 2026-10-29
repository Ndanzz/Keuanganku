'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, Trash2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountSection() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('Bank');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fungsi mengambil daftar dompet dari Supabase
  const fetchAccounts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', session.user.id);

    if (!error && data) {
      setAccounts(data);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fungsi saat tombol "Simpan Dompet" diklik
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
      setName('');
      setBalance('');
      fetchAccounts();
      alert('Dompet berhasil disimpan! Mengalihkan ke dashboard...');
      router.push('/');
    }
  };

  // Fungsi untuk menghapus dompet
  const handleDeleteAccount = async (id: string) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (!error) {
      fetchAccounts();
    } else {
      alert('Gagal menghapus dompet: ' + error.message);
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6 relative z-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-indigo-600" /> Daftar Rekening & Dompet
        </h2>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="cursor-pointer text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition shadow-sm z-20"
        >
          Ke Dashboard <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Form Input Dompet */}
      <form onSubmit={handleAddAccount} className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
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

      {/* Daftar Dompet yang Tersimpan */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Dompet Aktif</h3>
        {accounts.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Belum ada rekening atau dompet yang ditambahkan.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {accounts.map((acc) => (
              <div key={acc.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <div>
                  <h4 className="font-bold text-sm text-gray-800">{acc.name}</h4>
                  <p className="text-xs text-gray-500">{acc.type} • Saldo: Rp {Number(acc.balance).toLocaleString('id-ID')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAccount(acc.id)}
                  className="text-red-400 hover:text-red-600 p-1 rounded cursor-pointer"
                  title="Hapus Dompet"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}