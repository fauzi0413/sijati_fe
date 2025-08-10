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
  getTotalUserCount,
  getAverageFeedback
} from "../api/axios";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function StatistikChatbot() {
  const [total, setTotal] = useState(0);
  const [topik, setTopik] = useState([]);
  const [dataJamRamai, setDataJamRamai] = useState([]);
  const [dataJamLogin, setDataJamLogin] = useState([]);
  const [dataPieFaq, setDataPieFaq] = useState([]);
  const [dataPieDokumen, setDataPieDokumen] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalUser, setTotalUser] = useState(0);
  const [userStartDate, setUserStartDate] = useState(null);
  const [userEndDate, setUserEndDate] = useState(null);
  const [averageFeedback, setAverageFeedback] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);

  const COLORS = ["#f87171", "#60a5fa", "#facc15", "#34d399", "#a78bfa", "#fb923c"];

  const fetchTotalChat = (start, end) => {
    getTotalChatCount({ start, end }, (res) => setTotal(res.total));
  };

  const fetchTotalUser = (start, end) => {
  getTotalUserCount({ start, end }, (res) => setTotalUser(res.total));
  };

  useEffect(() => {
    fetchTotalChat();
    fetchTotalUser();
    getTotalUserCount((res) => setTotalUser(res.total));
    getPopularTopics((res) => setTopik(res.topics));
    getHourlyChatStats((res) => setDataJamRamai(res));
    getHourlyLoginStats((res) => setDataJamLogin(res));
    getFaqCategoryStats((res) => setDataPieFaq(res));
    getDocumentCategoryStats((res) => setDataPieDokumen(res));
    getAverageFeedback((res) => {
      setAverageFeedback(res.average);
      setFeedbackCount(res.total);
    });
  }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Total Pertanyaan */}
        <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-sm font-semibold mb-1">Total Pertanyaan</p>
        <p className="text-4xl font-bold">{total}</p>
        <div className="flex flex-col gap-2 mt-4">
          <label className="text-sm text-gray-600">Pilih Rentang Waktu</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
              setEndDate(null); 
              fetchTotalChat(date, null);
            }}
            dateFormat="yyyy-MM-dd"
            className="border w-full px-3 py-2 rounded-md text-sm"
            placeholderText="Pilih tanggal"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => {
              setEndDate(date);
              fetchTotalChat(startDate, date);
            }}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="Pilih tanggal akhir (opsional)"
            className="border w-full px-3 py-2 rounded-md text-sm"
          />
        </div>
      </div>

        {/* Total User */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-semibold mb-1">Total Pengguna</p>
          <p className="text-4xl font-bold">{totalUser}</p>
          <div className="flex flex-col gap-2 mt-4">
            <label className="text-sm text-gray-600">Pilih Rentang Waktu</label>
            <DatePicker
              selected={userStartDate}
              onChange={(date) => {
                setUserStartDate(date);
                setUserEndDate(null);
                fetchTotalUser(date, null);
              }}
              dateFormat="yyyy-MM-dd"
              className="border w-full px-3 py-2 rounded-md text-sm"
              placeholderText="Pilih tanggal"
            />
            <DatePicker
              selected={userEndDate}
              onChange={(date) => {
                setUserEndDate(date);
                fetchTotalUser(userStartDate, date);
              }}
              selectsEnd
              startDate={userStartDate}
              endDate={userEndDate}
              minDate={userStartDate}
              placeholderText="Pilih tanggal akhir (opsional)"
              className="border w-full px-3 py-2 rounded-md text-sm"
            />
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
          {/* Angka Rata-Rata */}
          <p className="text-4xl font-bold">
            {isNaN(averageFeedback) ? "0,0" : averageFeedback.toFixed(1).replace(".", ",")}
          </p>

          {/* Bintang Rating */}
          <div className="flex mt-1 space-x-1">
            {[...Array(5)].map((_, i) => {
              const filledPortion = Math.min(Math.max(averageFeedback - i, 0), 1) * 100;

              return (
                <div key={i} className="relative w-5 h-5">
                  {/* Bintang kosong */}
                  <svg viewBox="0 0 20 20" className="absolute w-5 h-5 text-gray-300" fill="currentColor">
                    <path d="M10 15l-5.878 3.09L5.845 12.5.964 8.41l6.09-.885L10 2l2.946 5.525 6.09.885-4.881 4.09 1.723 5.59z" />
                  </svg>

                  {/* Bintang terisi */}
                  <div
                    className="absolute overflow-hidden h-5 text-yellow-400"
                    style={{ width: `${filledPortion}%` }}
                  >
                    <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
                      <path d="M10 15l-5.878 3.09L5.845 12.5.964 8.41l6.09-.885L10 2l2.946 5.525 6.09.885-4.881 4.09 1.723 5.59z" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Pemberi Feedback */}
          <p className="text-sm font-semibold mt-4">Total Feedback</p>
          <p className="text-4xl font-bold">{feedbackCount}</p>
        </div>
      </div>

      {/* Grafik Jam Ramai Chat*/}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-sm font-semibold mb-4">Grafik Jam Ramai Chat</h2>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={dataJamRamai} 
              margin={{ top: 20, right: 50, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="jam"
                domain={[0, 23]}       // paksa range 0–23
                interval={0}           // tampilkan semua tick
                tickFormatter={(val) => `${String(val).padStart(2, "0")}.00`}
                tick={{ fontSize: 11 }} // perkecil font
              />
              <YAxis tickFormatter={(val) => Math.floor(val)} />
              <Tooltip />
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
            <BarChart 
              data={dataJamLogin} 
              margin={{ top: 20, right: 50, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="jam"
                domain={[0, 23]}       // paksa range 0–23
                interval={0}           // tampilkan semua tick
                tickFormatter={(val) => `${String(val).padStart(2, "0")}.00`}
                tick={{ fontSize: 11 }} // perkecil font
              />
              <YAxis tickFormatter={(val) => Math.floor(val)} />
              <Tooltip />
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
