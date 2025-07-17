import React from "react";
import Layout from "../components/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Star } from "lucide-react";

export default function StatistikChatbot() {
  const dataJamRamai = [
    { jam: "00", jumlah: 20 },
    { jam: "02", jumlah: 30 },
    { jam: "04", jumlah: 45 },
    { jam: "06", jumlah: 50 },
    { jam: "08", jumlah: 80 },
    { jam: "10", jumlah: 120 },
    { jam: "12", jumlah: 180 },
    { jam: "14", jumlah: 300 },
    { jam: "16", jumlah: 280 },
    { jam: "18", jumlah: 220 },
    { jam: "20", jumlah: 150 },
    { jam: "24", jumlah: 90 },
  ];

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8">Statistik SI JATI</h1>

      {/* Atas - 3 Kartu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Pertanyaan */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-semibold mb-1">Total Pertanyaan</p>
          <p className="text-4xl font-bold">1.234</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>Harian</span>
            <span>Mingguan</span>
            <span>Bulanan</span>
          </div>
        </div>

        {/* Topik Populer */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-semibold mb-2">Topik Populer</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Pajak</li>
            <li>Perizinan</li>
            <li>Administrasi</li>
          </ul>
        </div>

        {/* Skor Feedback */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-semibold mb-1">Skor Feedback Rata-Rata</p>
          <p className="text-4xl font-bold">4,2</p>
          <div className="flex mt-1 text-yellow-400">
            {[...Array(4)].map((_, i) => (
              <Star key={i} size={20} fill="currentColor" stroke="none" />
            ))}
            <Star size={20} className="text-yellow-300" />
          </div>
        </div>
      </div>

      {/* Grafik Jam Ramai */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-sm font-semibold mb-4">Grafik Jam ramai</h2>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataJamRamai}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="jam" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
