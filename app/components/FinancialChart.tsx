"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Sesuaikan jalur impor Supabase jika diperlukan
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

interface ChartData {
  month: string;
  pemasukan: number;
  pengeluaran: number;
}

export default function FinancialChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactionData() {
      try {
        setLoading(true);
        // Ambil data transaksi dari Supabase (sesuaikan nama tabel 'transactions' jika berbeda)
        const { data: transactions, error } = await supabase
          .from("transactions")
          .select("amount, type, date");

        if (error) {
          console.error("Gagal mengambil data transaksi:", error);
          return;
        }

        // Kelompokkan data berdasarkan bulan
        const monthlyMap: { [key: string]: { pemasukan: number; pengeluaran: number } } = {};

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

        // Inisialisasi bulan standar atau biarkan dinamis dari data
        transactions?.forEach((trx) => {
          const dateObj = new Date(trx.date);
          const monthName = monthNames[dateObj.getMonth()];

          if (!monthlyMap[monthName]) {
            monthlyMap[monthName] = { pemasukan: 0, pengeluaran: 0 };
          }

          if (trx.type === "income" || trx.type === "pemasukan") {
            monthlyMap[monthName].pemasukan += Number(trx.amount);
          } else if (trx.type === "expense" || trx.type === "pengeluaran") {
            monthlyMap[monthName].pengeluaran += Number(trx.amount);
          }
        });

        // Format data untuk Recharts
        const formattedData = Object.keys(monthlyMap).map((month) => ({
          month,
          pemasukan: monthlyMap[month].pemasukan,
          pengeluaran: monthlyMap[month].pengeluaran,
        }));

        setData(formattedData);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactionData();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-500">Memuat data grafik dari Supabase...</div>;
  }

  if (data.length === 0) {
    return <div className="py-12 text-center text-sm text-gray-500">Belum ada data transaksi yang tercatat di database.</div>;
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="pemasukan" name="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}