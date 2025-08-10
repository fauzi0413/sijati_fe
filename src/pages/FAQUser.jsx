import { useEffect, useMemo, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Layout from "../components/Layout";
import { getFAQ } from "../api/axios";

export default function FAQUser() {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState(""); // query pencarian

  const normalizeFaqs = (rows = []) =>
    rows.map((item, i) => ({
      id: item.id ?? item.faq_id ?? i,
      question: item.question ?? item.title ?? item.pertanyaan ?? "(Tanpa judul)",
      answer: item.answer ?? item.content ?? item.jawaban ?? "",
      created_at: item.created_at ?? item.createdAt ?? null,
    }));

  useEffect(() => {
    let active = true;

    const fetchFAQs = async () => {
      setLoading(true); setError("");
      try {
        const maybe = getFAQ();
        if (maybe && typeof maybe.then === "function") {
          const data = await maybe;
          if (!active) return;
          const normalized = normalizeFaqs(data)
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)); // terbaru dulu
          setFaqs(normalized);
          setLoading(false);
          return;
        }
      } catch (e) { /* fallthrough ke callback */ }

      try {
        getFAQ((data) => {
          if (!active) return;
          const normalized = normalizeFaqs(data)
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          setFaqs(normalized);
          setLoading(false);
        });
      } catch (e) {
        if (!active) return;
        setError("Gagal memuat FAQ.");
        setLoading(false);
      }
    };

    fetchFAQs();
    return () => { active = false; };
  }, []);

  // daftar yang sudah difilter berdasarkan pencarian
  const filteredFaqs = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return faqs;
    return faqs.filter((f) => f.question.toLowerCase().includes(term));
  }, [faqs, q]);

  const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <Layout>
      <div className="p-6 sm:p-10 w-full">
        <h1 className="text-2xl font-bold mb-2">FAQ</h1>
        <p className="text-gray-600 mb-6">Pertanyaan yang Sering Diajukan</p>

        {/* Search box */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari pertanyaan…"
            className="w-full pl-10 pr-3 py-2 border rounded-md outline-none focus:ring focus:ring-pink-200"
          />
        </div>

        {loading && <p className="text-gray-500">Memuat FAQ…</p>}
        {error && (
          <p className="text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</p>
        )}

        {!loading && !error && filteredFaqs.length === 0 && (
          <p className="text-gray-500">Tidak ada hasil untuk “{q}”.</p>
        )}

        {!loading && !error && filteredFaqs.length > 0 && (
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => (
              <div
                key={faq.id ?? index}
                className="bg-white rounded-md shadow p-4 cursor-pointer transition hover:shadow-md"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-center gap-2">
                  {openIndex === index ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <h2 className="font-semibold text-gray-800">{faq.question}</h2>
                  </div>
                </div>
                {openIndex === index && (
                  <p className="mt-2 text-gray-600 pl-7 whitespace-pre-line">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
