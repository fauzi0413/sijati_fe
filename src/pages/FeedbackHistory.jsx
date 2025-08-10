import React, { useEffect, useMemo, useRef, useState } from "react";
import { StarIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { getFeedback, getUser } from "../api/axios";
import Layout from "../components/Layout";

// ========================= Utils =========================
const STOPWORDS_ID = new Set([
  "yang","dan","atau","untuk","dengan","pada","dari","kami","kamu","anda","saya","itu",
  "ini","jadi","karena","agar","dalam","ke","di","ada","tidak","serta","juga","sudah",
  "lebih","kurang","sangat","banget","kita","mohon","harap","akan","telah","bisa","oleh"
]);

const normalizeText = (t = "") =>
  t
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // unicode safe
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (t) =>
  normalizeText(t)
    .split(" ")
    .filter((w) => w.length > 2 && !STOPWORDS_ID.has(w));

const makeNgrams = (tokens, minN = 2, maxN = 3) => {
  const grams = [];
  for (let n = minN; n <= maxN; n++) {
    for (let i = 0; i + n <= tokens.length; i++) {
      grams.push(tokens.slice(i, i + n).join(" "));
    }
  }
  return grams;
};

// === EXACT PHRASES + UNIGRAM (no double count per doc) ===
const splitWords = (t="") => normalizeText(t).split(" ").filter(Boolean);

const makeExactNgrams = (words, minN=2, maxN=3) => {
  const grams = [];
  for (let n=minN; n<=maxN; n++) {
    for (let i=0; i+n<=words.length; i++) {
      grams.push(words.slice(i, i+n).join(" "));
    }
  }
  return grams;
};

// buang stopword di pinggir frasa
const trimStopEdges = (phrase) => {
  let arr = phrase.split(" ");
  while (arr.length && STOPWORDS_ID.has(arr[0])) arr.shift();
  while (arr.length && STOPWORDS_ID.has(arr[arr.length-1])) arr.pop();
  return arr.join(" ");
};

const extractTopPhrases = (comments, limit=25, minDistinctDocs=1) => {
  const phraseCounts = {};
  const unigramCounts = {};

  comments.forEach((text) => {
    const orig = normalizeText(text || "");
    const words = splitWords(orig);
    const grams = makeExactNgrams(words, 2, 3);

    // satu set untuk seluruh term pada doc ini (frasa & unigram)
    const seenDoc = new Set();

    // 1) hitung frasa dari n-gram (hanya yang ≥ 2 kata)
    grams.forEach((g) => {
      const trimmed = trimStopEdges(g);
      if (!trimmed) return;
      if (!orig.includes(trimmed)) return;
      if (trimmed.split(" ").length < 2) return; // pastikan frasa
      if (seenDoc.has(trimmed)) return;
      phraseCounts[trimmed] = (phraseCounts[trimmed] || 0) + 1;
      seenDoc.add(trimmed);
    });

    // 2) hitung unigram dari token (bukan dari trim frasa)
    const tokens = tokenize(orig);
    tokens.forEach((tok) => {
      if (tok.length < 4) return;           // abaikan kata terlalu pendek
      if (seenDoc.has(tok)) return;         // hindari dobel (kalau kebetulan sama)
      unigramCounts[tok] = (unigramCounts[tok] || 0) + 1;
      seenDoc.add(tok);
    });
  });

  const phrasesArr = Object.entries(phraseCounts)
    .filter(([, c]) => c >= minDistinctDocs)
    .map(([text, count]) => ({ text, count, kind: "phrase" }));

  const uniArr = Object.entries(unigramCounts)
    .filter(([, c]) => c >= minDistinctDocs)
    .map(([text, count]) => ({ text, count, kind: "uni" }));

  const combined = [...phrasesArr, ...uniArr]
    .sort((a, b) => (b.count - a.count) || (a.kind === "phrase" ? -1 : 1) || a.text.localeCompare(b.text))
    .slice(0, limit);

  const max = combined.length ? Math.max(...combined.map(a => a.count)) : 1;
  return { phrases: combined.map(({text, count}) => ({ text, count })), maxCount: max };
};
// AKHIR EXTRACT TOP PHRASES

// avatar helpers
const hash = (str = "") => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
};
const colorFromName = (name = "") => {
  const palette = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-fuchsia-500",
    "bg-lime-500",
    "bg-sky-500",
    "bg-violet-500",
  ];
  return palette[hash(name) % palette.length];
};

const initials = (name = "") => {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(/\s+/);
  const i1 = parts[0]?.[0] || "";
  const i2 = parts[1]?.[0] || "";
  return (i1 + i2).toUpperCase();
};

// ===== highlight utils =====
const escapeRegExp = (s = "") =>
  s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

const getHighlightRegex = (q = "") =>
  q ? new RegExp(`(${escapeRegExp(q)})`, "ig") : null;

// Dapatkan frasa yang muncul pada sebuah komentar (untuk badge per kartu)
const phrasesInText = (text = "", phraseList = [], limit = 4) => {
  const t = normalizeText(text || "");
  const hits = [];
  for (const p of phraseList) {
    if (hits.length >= limit) break;
    const q = normalizeText(p.text);
    if (q && t.includes(q)) hits.push({ text: p.text, count: p.count });
  }
  return hits;
};


// small components
const PhraseChip = ({ text, count, max, active, onClick, showCount = false }) => {
  const size = 12 + Math.round((count / max) * 10); // 12px..22px
  const isActive = active === text;

  // hitung intensitas warna (0.3 → 1)
  const intensity = 0.3 + 0.7 * (count / max); 
  const bgColor = `rgba(37, 99, 235, ${intensity})`; // biru pekat sesuai count
  const textColor = intensity > 0.6 ? "#fff" : "#1e40af"; // putih kalau pekat, biru gelap kalau muda

  return (
    <button
      onClick={() => onClick(isActive ? null : text)}
      className={`px-2 py-1 rounded-full border transition whitespace-nowrap flex items-center gap-2
        ${isActive ? "bg-blue-600 text-white border-blue-600"
                   : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"}`}
      style={{ fontSize: `${size}px` }}
      title={`${text} · ${count} feedback`}
      type="button"
    >
      <span>{text}</span>
      {showCount && (
        <span
          className="text-[11px] leading-none px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: bgColor,
            color: textColor,
            border: `1px solid ${intensity > 0.6 ? "rgba(255,255,255,0.3)" : "rgba(37,99,235,0.4)"}`
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
};


const HighlightedText = ({ text, query }) => {
  if (!text) return <span className="text-gray-700">Tidak ada komentar</span>;
  if (!query) return <span className="text-gray-700">{text}</span>;
  const rgx = getHighlightRegex(query);
  const parts = text.split(rgx);
  return (
    <span className="text-gray-700">
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 rounded px-0.5">{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  );
};

export default function FeedbackHistory() {
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // stars
  const [starFilter, setStarFilter] = useState("All"); // 'All' | 1..5
  const [openStarsDropdown, setOpenStarsDropdown] = useState(false);

  // dates
  const [selectedDate, setSelectedDate] = useState("All Dates");
  const [openDateDropdown, setOpenDateDropdown] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // keyword filter
  const [activePhrase, setActivePhrase] = useState(null);

  const starsRef = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      getFeedback((data) => {
        setFeedbacks(Array.isArray(data) ? data : []);
        setLoading(false);
      });
      getUser((data) => setUsers(Array.isArray(data) ? data : []));
    } catch (e) {
      setError("Gagal memuat data.");
      setLoading(false);
    }

    const handleClickOutside = (event) => {
      if (starsRef.current && !starsRef.current.contains(event.target)) {
        setOpenStarsDropdown(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setOpenDateDropdown(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpenStarsDropdown(false);
        setOpenDateDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const getUsernameById = (id) => {
    const user = users.find((u) => u.user_id === id || u.uid === id);
    return user?.username || user?.displayName || "guest";
  };

  const starOptions = [
    { label: "All Ratings", value: "All" },
    { label: "(5 stars)", value: 5 },
    { label: "(4 stars)", value: 4 },
    { label: "(3 stars)", value: 3 },
    { label: "(2 stars)", value: 2 },
    { label: "(1 star)", value: 1 },
  ];

  const dateOptions = [
    "All Dates",
    "Today",
    "Yesterday",
    "Last 7 Days",
    "Last 30 Days",
    "This Month",
    "Last Month",
  ];

  const handleSelectStars = (option) => {
    setStarFilter(option.value);
    setOpenStarsDropdown(false);
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setOpenDateDropdown(false);
  };

  const handleApplyCustomDate = () => {
    if (!customFrom || !customTo) return alert("Lengkapi tanggal From dan To.");
    if (new Date(customFrom) > new Date(customTo))
      return alert("Rentang tanggal tidak valid.");
    setSelectedDate(`${customFrom} - ${customTo}`);
    setOpenDateDropdown(false);
  };

  // date helpers
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  const isWithinDateRange = (feedbackDate) => {
    const date = new Date(feedbackDate);
    const now = new Date();
    const todayStart = startOfDay(now);

    switch (selectedDate) {
      case "Today":
        return date >= todayStart;
      case "Yesterday": {
        const yStart = new Date(todayStart);
        yStart.setDate(yStart.getDate() - 1);
        const yEnd = new Date(todayStart);
        yEnd.setMilliseconds(-1);
        return date >= yStart && date <= yEnd;
      }
      case "Last 7 Days": {
        const d7 = startOfDay(new Date());
        d7.setDate(d7.getDate() - 6);
        return date >= d7;
      }
      case "Last 30 Days": {
        const d30 = startOfDay(new Date());
        d30.setDate(d30.getDate() - 29);
        return date >= d30;
      }
      case "This Month": {
        const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return date >= mStart;
      }
      case "Last Month": {
        const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lmEnd = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
        return date >= lmStart && date <= lmEnd;
      }
      default: {
        if (typeof selectedDate === "string" && selectedDate.includes(" - ")) {
          const [from, to] = selectedDate.split(" - ");
          const fromDate = startOfDay(new Date(from));
          const toDate = endOfDay(new Date(to));
          return date >= fromDate && date <= toDate;
        }
        return true;
      }
    }
  };

  const filteredFeedbacks = useMemo(() => {
    return feedbacks
      .filter((fb) => {
        const datePass = isWithinDateRange(fb.created_at);
        const starPass = starFilter === "All" ? true : fb.rating === starFilter;
        const phrasePass = activePhrase
          ? normalizeText(fb.comment || "").includes(normalizeText(activePhrase))
          : true;
        return starPass && datePass && phrasePass;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [feedbacks, starFilter, selectedDate, activePhrase]);

  const { phrases, maxCount } = useMemo(() => {
    const comments = filteredFeedbacks.map((f) => f.comment).filter(Boolean);
    return extractTopPhrases(comments, 25);
  }, [filteredFeedbacks]);

  const renderAvatar = (name) => {
    const isGuest = !name || /^guest$/i.test(name);
    if (isGuest) {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <UserCircleIcon className="w-8 h-8 text-gray-500" />
        </div>
      );
    }
    return (
      <div
        className={`w-10 h-10 rounded-full ${colorFromName(name)} text-white flex items-center justify-center font-semibold`}
      >
        {initials(name)}
      </div>
    );
  };

  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [starFilter, selectedDate, activePhrase]);

  const totalItems = filteredFeedbacks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredFeedbacks.slice(start, start + PAGE_SIZE);
  }, [filteredFeedbacks, currentPage]);

  // batas tampilan "Showing X to Y of Z"
  const showingFrom = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(totalItems, currentPage * PAGE_SIZE);

  // handler tombol
  const goPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  return (
    <Layout>
      <h1 className="text-xl md:text-2xl font-bold mb-4">Feedback</h1>

      {/* Mobile Keyword Panel */}
      <div className="md:hidden w-full bg-white shadow-md rounded-xl p-5 mb-4">
        <h2 className="text-lg font-semibold mb-3">Keyword Populer</h2>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {phrases.length ? (
            phrases.map((p, idx) => (
              <PhraseChip
                key={idx}
                text={p.text}
                count={p.count}
                max={maxCount}
                active={activePhrase}
                onClick={setActivePhrase}
                showCount
              />
            ))
          ) : (
            <p className="text-gray-500 text-sm">Tidak ada keyword</p>
          )}
        </div>
        {activePhrase && (
          <div className="mt-3">
            <button
              onClick={() => setActivePhrase(null)}
              className="block w-full md:w-auto text-sm md:text-xs text-gray-700 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition"
            >
              Hapus filter kata kunci: “{activePhrase}”
            </button>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        {/* Stars Dropdown */}
        <div ref={starsRef} className="relative w-full md:w-56">
          <button
            onClick={() => setOpenStarsDropdown(!openStarsDropdown)}
            className="border rounded-lg px-3 py-2 flex items-center justify-between w-full bg-white"
          >
            Stars: {starOptions.find((o) => o.value === starFilter)?.label}
            <span className="ml-2">▼</span>
          </button>
          {openStarsDropdown && (
            <div className="absolute left-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-10">
              {starOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectStars(option)}
                  className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {option.value !== "All" ? (
                    <div className="flex items-center mr-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${i < option.value ? "text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center mr-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                      ))}
                    </div>
                  )}
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date Dropdown */}
        <div ref={dateRef} className="relative w-full md:w-72">
          <button
            onClick={() => setOpenDateDropdown(!openDateDropdown)}
            className="border rounded-lg px-3 py-2 flex items-center justify-between w-full bg-white"
          >
            Date: {selectedDate}
            <span className="ml-2">▼</span>
          </button>
          {openDateDropdown && (
            <div className="absolute left-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-10 p-3">
              {dateOptions.map((date, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectDate(date)}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {date}
                </div>
              ))}
              {/* Custom Range */}
              <div className="border-t mt-2 pt-2">
                <p className="text-xs text-gray-600 mb-2">Custom Range</p>
                <div className="flex items-center gap-1 mb-3">
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="border rounded px-1 py-1 text-xs w-full"
                  />
                  <span className="text-xs">To</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="border rounded px-1 py-1 text-xs w-full"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      setCustomFrom("");
                      setCustomTo("");
                      setSelectedDate("All Dates");
                    }}
                    className="text-xs text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    Clear
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setOpenDateDropdown(false)}
                      className="text-xs text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyCustomDate}
                      className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Feedback List */}
        <div className="md:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center text-gray-500 text-sm bg-white p-6 rounded-lg shadow-sm">
              Memuat data...
            </div>
          ) : error ? (
            <div className="text-center text-red-600 text-sm bg-white p-6 rounded-lg shadow-sm">
              {error}
            </div>
          ) : pageData.length === 0 ? (
            <div className="text-center text-gray-500 text-sm bg-white p-6 rounded-lg shadow-sm">
              Tidak ada data feedback yang tersedia.
            </div>
          ) : (
            pageData.map((fb) => (
              <div
                key={fb.feedback_id}
                className="bg-white shadow-sm rounded-lg p-4 flex flex-col hover:shadow-md transition"
              >
                <div className="flex items-center mb-1">
                  {renderAvatar(getUsernameById(fb.user_id))}
                  <div className="ml-3">
                    <p className="font-semibold">{getUsernameById(fb.user_id)}</p>
                    <div className="flex items-center text-yellow-500">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <StarIcon
                          key={idx}
                          className={`w-4 h-4 ${idx < fb.rating ? "text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="ml-2 text-gray-500 text-sm">
                        {new Date(fb.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                {/* keyword badges per card */}
                <div className="mt-2 mb-1 flex flex-wrap gap-2">
                  {phrasesInText(fb.comment, phrases, 4).map((k, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhrase(k.text)}
                      className={`text-xs px-2 py-1 rounded-full border ${
                        activePhrase === k.text
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                      }`}
                      title={`${k.text} · ${k.count}x`}
                    >
                      #{k.text}
                    </button>
                  ))}
                </div>
                {/* highlighted comment */}
                <HighlightedText text={fb.comment} query={activePhrase} />
              </div>
            ))
          )}

          {/* Pagination footer */}
          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{showingFrom}</span> to{" "}
              <span className="font-medium">{showingTo}</span> of{" "}
              <span className="font-medium">{totalItems}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 px-2">
                Page <span className="font-semibold">{currentPage}</span> of{" "}
                <span className="font-semibold">{totalPages}</span>
              </span>
              <button
                onClick={goNext}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>

        </div>

        {/* Desktop Keyword Panel */}
        <div
          className="
            hidden md:block w-full bg-white shadow-md rounded-xl p-5
            md:sticky md:top-24
            md:max-h-[calc(100vh-8rem)] md:overflow-hidden
          "
        >
          <h2 className="text-lg font-semibold mb-3">Keyword Populer</h2>

          <div
            className="
              flex flex-wrap gap-2
              overflow-y-auto pr-1 pb-10
              md:max-h-[calc(100vh-8rem-3.25rem)]
            "
          >
            {phrases.length ? (
              phrases.map((p, idx) => (
                <PhraseChip
                  key={idx}
                  text={p.text}
                  count={p.count}
                  max={maxCount}
                  active={activePhrase}
                  onClick={setActivePhrase}
                  showCount
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">Tidak ada keyword</p>
            )}
          </div>

          {activePhrase && (
            <div className="mt-3">
              <button
                onClick={() => setActivePhrase(null)}
                className="block w-full md:w-auto text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition"
              >
                Hapus filter kata kunci: “{activePhrase}”
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
