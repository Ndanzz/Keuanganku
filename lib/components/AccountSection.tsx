'use client';

import { useState, useEffect } from 'react';
import { getAccounts, addAccount, Account } from '@/lib/supabase';
import { Wallet, Building2, CreditCard, Plus } from 'lucide-react';

export default function AccountSection() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'bank' | 'e-wallet' | 'cash'>('bank');
  const [balance, setBalance] = useState('');

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data || []);
    } catch (err) {
      console.error('Gagal mengambil data akun:', err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;

    try {
      await addAccount({
        name,
        type,
        balance: parseFloat(balance),
      });
      setName('');
      setBalance('');
      setIsOpen(false);
      fetchAccounts();
    } catch (err) {
      console.error('Gagal menambah akun:', err);
    }
  };

  const getIcon = (accountType: string) => {
    switch (accountType) {
      case 'bank':
        return <Building2 className="w-5 h-5 text-blue-500" />;
      case 'e-wallet':
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      default:
        return <Wallet className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Daftar Rekening & Dompet</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {/* Form Tambah Akun */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nama Dompet/Bank</label>
            <input
              type="text"
              placeholder="Contoh: BCA, Gopay, Kas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm border rounded-lg p-2 outline-none focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipe</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full text-sm border rounded-lg p-2 outline-none focus:border-indigo-500"
              >
                <option value="bank">Bank</option>
                <option value="e-wallet">E-Wallet</option>
                <option value="cash">Tunai / Kas</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Saldo Awal</label>
              <input
                type="number"
                placeholder="0"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full text-sm border rounded-lg p-2 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full text-sm bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Simpan Dompet
          </button>
        </form>
      )}

      {/* Grid Kartu Dompet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-gray-50 rounded-lg">{getIcon(acc.type)}</div>
            <div>
              <p className="text-xs text-gray-500 capitalize">{acc.type}</p>
              <p className="text-sm font-semibold text-gray-800">{acc.name}</p>
              <p className="text-sm font-bold text-indigo-600">
                Rp {acc.balance.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}