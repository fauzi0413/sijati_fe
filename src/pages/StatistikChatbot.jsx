import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Star } from "lucide-react";

import {
  getTotalChatCount,
  getPopularTopics,
  getHourlyChatStats,
  getHourlyLoginStats,
  getFaqCategoryStats,
  getDocumentCategoryStats,
} from "../api/axios";

export default function StatistikChatbot() {
  const [total, setTotal] = useState(0);
  const [topik, setTopik] = useState([]);
  const [dataJamRamai, setDataJamRamai] = useState([]);
  const [range, setRange] = useState("all")
  const [dataJamLogin, setDataJamLogin] = useState([]);
  const [dataPieFaq, setDataPieFaq] = useState([]);
  const [dataPieDokumen, setDataPieDokumen] = useState([]);

  const COLORS = ["#f87171", "#60a5fa", "#facc15", "#34d399", "#a78bfa", "#fb923c"];

  useEffect(() => {
    getTotalChatCount(range, (res) => setTotal(res.total));
    getPopularTopics((res) => setTopik(res.topics));
    getHourlyChatStats((res) => setDataJamRamai(res));
    getHourlyLoginStats((res) => setDataJamLogin(res));
    getFaqCategoryStats((res) => setDataPieFaq(res));
    getDocumentCategoryStats((res) => setDataPieDokumen(res));
  }, [range]);

  const handleRangeClick = (r) => {
    setRange(r);
  };

  const totalFaq = dataPieFaq.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLegend = (props) => {
    const { payload } = props;
    const total = payload.reduce((sum, entry) => sum + entry.payload.value, 0);

    return (
      <ul className="text-sm space-y-1">
        {payload.map((entry, index) => {
          const percent = total > 0
            ? Math.round((entry.payload.value / total) * 100)
            : 0;

          return (
            <li key={`legend-${index}`} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>{`${entry.payload.name} (${percent}%) - ${entry.payload.value}`}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8">Statistik SI JATI</h1>

      {/* Atas - 3 Kartu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Pertanyaan */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-semibold mb-1">Total Pertanyaan</p>
          <p className="text-4xl font-bold">{total}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <button
              onClick={() => handleRangeClick("day")}
              className={range === "day" ? "font-bold underline" : ""}
            >
              Harian
            </button>
            <button
              onClick={() => handleRangeClick("week")}
              className={range === "week" ? "font-bold underline" : ""}
            >
              Mingguan
            </button>
            <button
              onClick={() => handleRangeClick("month")}
              className={range === "month" ? "font-bold underline" : ""}
            >
              Bulanan
            </button>
          </div>
        </div>

        {/* Topik Populer */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-semibold mb-2">Topik Populer</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {topik.length > 0 ? (
              topik.map((t, i) => <li key={i}>{t}</li>)
            ) : (
              <li className="text-gray-400">Belum ada data</li>
            )}
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

      {/* Grafik Jam Ramai Chat*/}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-sm font-semibold mb-4">Grafik Jam Ramai Chat</h2>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataJamRamai}>
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis />
              <XAxis dataKey="jam" tickFormatter={(jam) => `${jam.toString().padStart(2, '0')}:00`}  />
              <Tooltip 
                formatter={(value) => [`${value}`, 'Jumlah']} 
                labelFormatter={(label) => `${label.toString().padStart(2, '0')}:00`} 
              />
              <Bar dataKey="jumlah" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grafik Jam Ramai Login User*/}
      <div className="bg-white p-6 rounded-lg shadow mt-10">
        <h2 className="text-sm font-semibold mb-4">Grafik Jam Ramai Login User</h2>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataJamLogin}>
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis />
              <XAxis dataKey="jam" tickFormatter={(jam) => `${jam.toString().padStart(2, '0')}:00`}  />
              <Tooltip 
                formatter={(value) => [`${value}`, 'Jumlah']} 
                labelFormatter={(label) => `${label.toString().padStart(2, '0')}:00`} 
              />
              <Bar dataKey="jumlah" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-10">
        {/* Pie Chart: Kategori FAQ */}
        <div className="bg-white p-6 rounded-lg shadow w-full lg:w-1/2">
          <h2 className="text-sm font-semibold mb-4">
            Kategori FAQ yang Sering Dibuat
          </h2>
          <div className="w-full min-h-[300px]">
            {totalFaq > 0 ? (
              <div className="relative w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dataPieFaq}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      labelLine={false}
                    >
                      {dataPieFaq.map((entry, index) => (
                        <Cell
                          key={`faq-cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend Desktop - Posisi kanan tengah */}
                <div className="hidden lg:block absolute top-1/2 right-0 -translate-y-1/2">
                  {renderCustomLegend({
                    payload: dataPieFaq.map((d, i) => ({
                      payload: d,
                      color: COLORS[i % COLORS.length],
                      value: d.value,
                    })),
                  })}
                </div>

                {/* Legend Mobile - Di bawah */}
                <div className="block lg:hidden">
                  {renderCustomLegend({
                    payload: dataPieFaq.map((d, i) => ({
                      payload: d,
                      color: COLORS[i % COLORS.length],
                      value: d.value,
                    })),
                  })}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-12">
                Tidak ada data FAQ yang bisa ditampilkan.
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart: Kategori Dokumen */}
        <div className="bg-white p-6 rounded-lg shadow w-full lg:w-1/2">
          <h2 className="text-sm font-semibold mb-4">
            Kategori Dokumen yang Sering Diupload
          </h2>
          <div className="relative w-full min-h-[300px]">
            {dataPieDokumen.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dataPieDokumen}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      labelLine={false}
                    >
                      {dataPieDokumen.map((entry, index) => (
                        <Cell
                          key={`doc-cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend Desktop (kanan) */}
                <div className="hidden lg:block absolute top-1/2 right-4 -translate-y-1/2">
                  {renderCustomLegend({
                    payload: dataPieDokumen.map((d, i) => ({
                      payload: d,
                      color: COLORS[i % COLORS.length],
                      value: d.value,
                    })),
                  })}
                </div>

                {/* Legend Mobile (bawah) */}
                <div className="block lg:hidden mt-4">
                  {renderCustomLegend({
                    payload: dataPieDokumen.map((d, i) => ({
                      payload: d,
                      color: COLORS[i % COLORS.length],
                      value: d.value,
                    })),
                  })}
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-center py-12">
                Tidak ada data dokumen yang bisa ditampilkan.
              </div>
            )}
          </div>
        </div>

      </div>

    </Layout>
  );
}
