"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

// Contoh data transaksi per bulan (bisa disesuaikan dengan data dari Supabase)
const data = [
  { month: "Jan", income: 4500000, expense: 3200000 },
  { month: "Feb", income: 5000000, expense: 4100000 },
  { month: "Mar", income: 4800000, expense: 3900000 },
  { month: "Apr", income: 5200000, expense: 4500000 },
  { month: "Mei", income: 6000000, expense: 4200000 },
  { month: "Jun", income: 5500000, expense: 4800000 },
];

export default function FinancialChart() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 my-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Analisis Tren Pemasukan vs Pengeluaran
      </h3>
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `Rp ${value / 1000000}jt`} />
            <Tooltip
              formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, ""]}
              contentStyle={{ backgroundColor: "#F9FAFB", borderRadius: "8px", border: "1px solid #E5E7EB" }}
            />
            <Legend wrapperStyle={{ paddingTop: "15px" }} />
            <Bar dataKey="income" name="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}