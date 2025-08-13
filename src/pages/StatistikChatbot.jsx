import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

import {
  getTotalChatCount,
  getChatHistory,           // total & topik dari pertanyaan (client-side)
  getHourlyChatStats,
  getHourlyLoginStats,
  getFaqCategoryStats,
  getDocumentCategoryStats,
  getAverageFeedback,
  getUser,                  // getUser(callback)
} from "../api/axios";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/* ============================ Utils ============================ */
// Deteksi mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
};


// GANTI definisi ChartScroller-mu jadi ini
const ChartScroller = ({
  children,
  points = 24,
  heightDesktop = 288,
  minWidth = 1080,      // <— minimal lebar kanvas di desktop
  pxPerPoint = 40       // skala per jam (boleh diubah)
}) => {
  const isMobile = useIsMobile();
  if (isMobile) return <div className="w-full min-w-0">{children}</div>;

  // Lebar final = max(perkiraan dari jumlah titik, minWidth)
  const width = Math.max(points * pxPerPoint, minWidth);

  return (
    <div className="w-full max-w-full min-w-0">
      <div className="overflow-x-auto max-w-full" style={{ WebkitOverflowScrolling: "touch" }}>
        <div style={{ width, height: heightDesktop }}>
          {children}
        </div>
      </div>
    </div>
  );
};


// Parser tanggal toleran (support "YYYY-MM-DD HH:mm:ss")
const toDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === "string" && v.length > 10 && v[10] === " ") {
    return new Date(v.replace(" ", "T"));
  }
  return new Date(v);
};

const inRange = (raw, start, end) => {
  const t = toDate(raw);
  if (!t || Number.isNaN(t.getTime())) return false;
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : null;
  if (s) s.setHours(0, 0, 0, 0);
  if (e) e.setHours(23, 59, 59, 999);
  if (s && t < s) return false;
  if (e && t > e) return false;
  return true;
};

const toArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.users)) return res.users;
  if (Array.isArray(res?.chats)) return res.chats;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.result)) return res.result;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

// Lengkapi data jadi 24 jam (00..23) + sediakan dua key:
// - hour (number) untuk LineChart mobile
// - label (string "00".."23") untuk BarChart desktop (scale band)
const toFullHoursSeries = (rows = []) => {
  const byHour = new Map(
    rows.map((r) => [Number(r.jam ?? r.hour ?? r.label), Number(r.jumlah ?? r.count ?? 0)])
  );
  return Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: String(h).padStart(2, "0"),
    jumlah: byHour.get(h) || 0,
  }));
};

/* ===================== Komponen grafik jam ===================== */
const CHART_MARGIN_DESKTOP = { top: 8, right: 4, bottom: 8, left: 4 };
const CHART_MARGIN_MOBILE  = { top: 8,  right: 4, bottom: 6, left: 4 };

const TimeOfDayChart = ({ title, data }) => {
  // bikin daftar tick "00","03","06",...,"21","23"
  const desktopTicks = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const labels = data.map(d => d.label);            // "00".."23"
    const every3 = labels.filter((_, i) => i % 3 === 0);
    // pastikan label terakhir "23" ikut
    if (labels[labels.length - 1] !== every3[every3.length - 1]) {
      every3.push(labels[labels.length - 1]);
    }
    return every3;
}, [data]);

  const isMobile = useIsMobile();
  const hourTicks = isMobile ? [0, 3, 6, 9, 12, 15, 18, 21] : undefined;

  return (
    <div className="bg-white p-6 rounded-lg shadow min-w-0 mb-10">
      <h2 className="text-sm font-semibold mb-4">{title}</h2>

      {isMobile ? (
        // Mobile: LineChart (numeric axis)
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={CHART_MARGIN_MOBILE}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                type="number"
                domain={[0, 23]}
                ticks={hourTicks}
                padding={{ left: 0, right: 0 }}
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `${String(v).padStart(2, "0")}.00`}
              />
              <YAxis width={32} tick={{ fontSize: 10 }} tickFormatter={(v) => Math.floor(v)} />
              <Tooltip />
              <Line type="monotone" dataKey="jumlah" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        // Desktop: BarChart (band) + scroller
        <ChartScroller points={24} heightDesktop={288} minWidth={1000} pxPerPoint={40}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={CHART_MARGIN_DESKTOP}
              barGap={2}
              barCategoryGap="4%"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"          // "00".."23"
                type="category"
                scale="band"
                padding={{ left: 0, right: 0 }}    // mentok kiri-kanan
                ticks={desktopTicks}               // <<< tampilkan tiap 3 jam + 23
                tick={{ fontSize: 12 }}
                tickMargin={8}
                tickLine={false}
                axisLine={{ strokeOpacity: 0.4 }}
                // tampilkan seperti mobile
                tickFormatter={(t) => `${t}.00`}
              />
              <YAxis width={36} tickFormatter={(v) => Math.floor(v)} />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartScroller>
      )}
    </div>
  );
};


export default function StatistikChatbot() {
  const [total, setTotal] = useState(0);
  const [topik, setTopik] = useState([]); // [{term, count}]

  const [dataJamRamai, setDataJamRamai] = useState([]);
  const [dataJamLogin, setDataJamLogin] = useState([]);
  const [dataPieFaq, setDataPieFaq] = useState([]);
  const [dataPieDokumen, setDataPieDokumen] = useState([]);

  // ===== Filter Total Pertanyaan (chat)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(new Date());        // default: hari ini

  // ===== Filter Total Pengguna (user)
  const [totalUser, setTotalUser] = useState(0);
  const [userStartDate, setUserStartDate] = useState(null);
  const [userEndDate, setUserEndDate] = useState(new Date()); // default: hari ini

  const [averageFeedback, setAverageFeedback] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);

  const COLORS = ["#f87171", "#60a5fa", "#facc15", "#34d399", "#a78bfa", "#fb923c"];

  // field waktu sesuai tabel
  const getWhenUser = (u) => u?.created_at ?? u?.create_at; // user
  const getWhenChat = (c) => c?.created_at;                 // chat_history

  // Stopwords ID sederhana
  const ID_STOPWORDS = new Set([
    "yang","dan","atau","dari","di","ke","pada","untuk","dengan","karena","agar","dalam",
    "itu","ini","nya","saya","aku","kami","kita","kamu","anda","ia","dia","apa","bagaimana",
    "berapa","dimana","kapan","kenapa","mengapa","ada","jadi","bisa","mohon","tolong",
    "apakah","the","of","to","is","are"
  ]);

  // Hitung Topik Populer (top 5) dari user_message
  const buildTopTopics = (rows = [], start, end) => {
    const filtered = rows.filter((r) => inRange(getWhenChat(r), start, end));
    const texts = filtered.map((r) => r?.user_message ?? r?.question ?? r?.message ?? "");
    const counts = new Map();

    const addWord = (w) => {
      if (!w) return;
      const key = w.toLowerCase();
      if (key.length < 3) return;
      if (ID_STOPWORDS.has(key)) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    };

    for (const t of texts) {
      const clean = (t || "").toLowerCase().replace(/[^\p{L}\s]/gu, " ");
      const tokens = clean.split(/\s+/).filter(Boolean);
      tokens.forEach(addWord);
    }

    const top5 = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([term, count]) => ({ term, count }));

    setTopik(top5);
  };

  /* ====================== Fetchers ====================== */
  // Total Pengguna (filter client-side)
  const fetchTotalUser = (start, end) => {
    getUser((res) => {
      const list = toArray(res);
      const counted = list.filter((u) => inRange(getWhenUser(u), start, end)).length;
      setTotalUser(counted);
    });
  };

  // Total Chat — jika ada filter, hitung client-side; kalau tidak, pakai server
  const fetchTotalChat = (start, end) => {
    const hasFilter = !!start || !!end;
    if (hasFilter) {
      getChatHistory((payload) => {
        const list = toArray(payload);
        setTotal(list.filter((c) => inRange(getWhenChat(c), start, end)).length);
        buildTopTopics(list, start, end);
      });
      return;
    }
    getTotalChatCount({}, (res) => {
      if (typeof res?.total === "number") {
        setTotal(res.total);
      } else {
        getChatHistory((payload) => {
          const list = toArray(payload);
          setTotal(list.length);
        });
      }
    });
  };

  /* ====================== Effects ====================== */
  useEffect(() => {
    // awal: pakai end = hari ini
    fetchTotalChat(null, endDate);
    fetchTotalUser(null, userEndDate);

    getHourlyChatStats((res) => setDataJamRamai(toFullHoursSeries(res || [])));
    getHourlyLoginStats((res) => setDataJamLogin(toFullHoursSeries(res || [])));
    getFaqCategoryStats((res) => setDataPieFaq(res || []));
    getDocumentCategoryStats((res) => setDataPieDokumen(res || []));
    getAverageFeedback((res) => {
      setAverageFeedback(res?.average ?? 0);
      setFeedbackCount(res?.total ?? 0);
    });

    // topik awal (sampai hari ini)
    getChatHistory((payload) => {
      const list = toArray(payload);
      buildTopTopics(list, null, endDate);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalFaq = dataPieFaq.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLegend = (props) => {
    const { payload } = props;
    const total = payload.reduce((sum, entry) => sum + entry.payload.value, 0);
    return (
      <ul className="text-sm space-y-1">
        {payload.map((entry, index) => {
          const percent = total > 0 ? Math.round((entry.payload.value / total) * 100) : 0;
          return (
            <li key={`legend-${index}`} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{`${entry.payload.name} (${percent}%) - ${entry.payload.value}`}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  /* ====================== Handlers ====================== */
  // Total pertanyaan
  const handleStartChatChange = (date) => {
    const today = new Date();
    let nextEnd = endDate || today;
    if (date && nextEnd < date) nextEnd = date;

    setStartDate(date);
    setEndDate(nextEnd);
    fetchTotalChat(date, nextEnd);

    getChatHistory((payload) => {
      const list = toArray(payload);
      buildTopTopics(list, date, nextEnd);
    });
  };

  const handleEndChatChange = (date) => {
    setEndDate(date);
    fetchTotalChat(startDate, date);
    getChatHistory((payload) => {
      const list = toArray(payload);
      buildTopTopics(list, startDate, date);
    });
  };

  // Total pengguna
  const handleStartUserChange = (date) => {
    const today = new Date();
    let nextEnd = userEndDate || today;
    if (date && nextEnd < date) nextEnd = date;

    setUserStartDate(date);
    setUserEndDate(nextEnd);
    fetchTotalUser(date, nextEnd);
  };

  /* ====================== Render ====================== */
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8">Statistik SI JATI</h1>

      {/* 4 kartu teratas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Total Pertanyaan */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-semibold mb-1">Total Pertanyaan</p>
          <p className="text-4xl font-bold">{total}</p>
          <div className="flex flex-col gap-2 mt-4">
            <label className="text-sm text-gray-600">Pilih Rentang Waktu</label>
            <DatePicker
              selected={startDate}
              onChange={handleStartChatChange}
              dateFormat="yyyy-MM-dd"
              className="border w-full px-3 py-2 rounded-md text-sm"
              placeholderText="Pilih tanggal"
            />
            <DatePicker
              selected={endDate}
              onChange={handleEndChatChange}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || undefined}
              dateFormat="yyyy-MM-dd"
              placeholderText="Pilih tanggal akhir (opsional)"
              className="border w-full px-3 py-2 rounded-md text-sm"
            />
          </div>
        </div>

        {/* Total Pengguna */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-semibold mb-1">Total Pengguna</p>
          <p className="text-4xl font-bold">{totalUser}</p>
          <div className="flex flex-col gap-2 mt-4">
            <label className="text-sm text-gray-600">Pilih Rentang Waktu</label>
            <DatePicker
              selected={userStartDate}
              onChange={handleStartUserChange}
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
              minDate={userStartDate || undefined}
              dateFormat="yyyy-MM-dd"
              placeholderText="Pilih tanggal akhir (opsional)"
              className="border w-full px-3 py-2 rounded-md text-sm"
            />
          </div>
        </div>

        {/* Skor Feedback */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-semibold mb-1">Skor Feedback Rata-Rata</p>
          <p className="text-4xl font-bold">
            {isNaN(averageFeedback) ? "0,0" : averageFeedback.toFixed(1).replace(".", ",")}
          </p>
          <div className="flex mt-1 space-x-1">
            {[...Array(5)].map((_, i) => {
              const filledPortion = Math.min(Math.max(averageFeedback - i, 0), 1) * 100;
              return (
                <div key={i} className="relative w-5 h-5">
                  <svg viewBox="0 0 20 20" className="absolute w-5 h-5 text-gray-300" fill="currentColor">
                    <path d="M10 15l-5.878 3.09L5.845 12.5.964 8.41l6.09-.885L10 2l2.946 5.525 6.09.885-4.881 4.09 1.723 5.59z" />
                  </svg>
                  <div className="absolute overflow-hidden h-5 text-yellow-400" style={{ width: `${filledPortion}%` }}>
                    <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
                      <path d="M10 15l-5.878 3.09L5.845 12.5.964 8.41l6.09-.885L10 2l2.946 5.525 6.09.885-4.881 4.09 1.723 5.59z" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm font-semibold mt-4">Total Feedback</p>
          <p className="text-4xl font-bold">{feedbackCount}</p>
        </div>

        {/* Topik Populer (Top 5) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-semibold mb-2">Topik Populer</p>
          <div className="flex flex-wrap gap-3 max-h-48 overflow-auto pr-2">
            {topik.length > 0 ? (
              topik.map((k) => (
                <span
                  key={k.term}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-300 text-blue-700 bg-blue-50"
                >
                  <span className="font-medium">{k.term}</span>
                  <span className="text-xs font-semibold rounded-full bg-blue-200 px-2 py-0.5">
                    {k.count}
                  </span>
                </span>
              ))
            ) : (
              <span className="text-gray-400">Belum ada data</span>
            )}
          </div>
        </div>
      </div>

      {/* Grafik Jam Ramai Chat */}
      <TimeOfDayChart title="Grafik Jam Ramai Chat" data={dataJamRamai} />

      {/* Grafik Jam Ramai Login User */}
      <TimeOfDayChart title="Grafik Jam Ramai Login User" data={dataJamLogin} />

      <div className="flex flex-col lg:flex-row gap-6 mt-10">
        {/* Pie FAQ */}
        <div className="bg-white p-6 rounded-lg shadow w-full lg:w-1/2">
          <h2 className="text-sm font-semibold mb-4">Kategori FAQ yang Sering Dibuat</h2>
          <div className="w-full min-h-[300px]">
            {totalFaq > 0 ? (
              <div className="relative w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={dataPieFaq} cx="50%" cy="50%" outerRadius={100} dataKey="value" labelLine={false}>
                      {dataPieFaq.map((entry, index) => (
                        <Cell key={`faq-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="hidden lg:block absolute top-1/2 right-0 -translate-y-1/2">
                  {renderCustomLegend({
                    payload: dataPieFaq.map((d, i) => ({ payload: d, color: COLORS[i % COLORS.length], value: d.value })),
                  })}
                </div>
                <div className="block lg:hidden">
                  {renderCustomLegend({
                    payload: dataPieFaq.map((d, i) => ({ payload: d, color: COLORS[i % COLORS.length], value: d.value })),
                  })}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-12">Tidak ada data FAQ yang bisa ditampilkan.</div>
            )}
          </div>
        </div>

        {/* Pie Dokumen */}
        <div className="bg-white p-6 rounded-lg shadow w-full lg:w-1/2">
          <h2 className="text-sm font-semibold mb-4">Kategori Dokumen yang Sering Diupload</h2>
          <div className="relative w-full min-h-[300px]">
            {dataPieDokumen.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={dataPieDokumen} cx="50%" cy="50%" outerRadius={100} dataKey="value" labelLine={false}>
                      {dataPieDokumen.map((entry, index) => (
                        <Cell key={`doc-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="hidden lg:block absolute top-1/2 right-4 -translate-y-1/2">
                  {renderCustomLegend({
                    payload: dataPieDokumen.map((d, i) => ({ payload: d, color: COLORS[i % COLORS.length], value: d.value })),
                  })}
                </div>
                <div className="block lg:hidden mt-4">
                  {renderCustomLegend({
                    payload: dataPieDokumen.map((d, i) => ({ payload: d, color: COLORS[i % COLORS.length], value: d.value })),
                  })}
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-center py-12">Tidak ada data dokumen yang bisa ditampilkan.</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
