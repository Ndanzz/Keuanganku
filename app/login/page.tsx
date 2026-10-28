'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, LogIn, UserPlus } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        alert('Pendaftaran berhasil! Silakan login.');
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Keuanganku</h1>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin ? 'Masuk ke akun kamu' : 'Buat akun baru'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs rounded-xl border border-rose-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              'Memproses...'
            ) : isLogin ? (
              <>
                <LogIn size={16} /> Masuk
              </>
            ) : (
              <>
                <UserPlus size={16} /> Daftar Akun
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
            }}
            className="text-xs text-indigo-600 font-semibold hover:underline"
          >
            {isLogin ? 'Belum punya akun? Daftar sekarang' : 'Sudah punya akun? Masuk'}
          </button>
        </div>
      </div>
    </div>
  );
}