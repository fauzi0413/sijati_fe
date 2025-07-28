import React, { useState, useRef, useEffect } from "react";
import { LuMessageCircleMore } from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import Layout from "../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { getChatHistoryBySessionID, getDocument, getFAQ, postChatHistory } from "../api/axios";
import { v4 as uuidv4 } from "uuid";

// Loader untuk bot loading
const LazyLoader = () => (
  <div className="w-full flex justify-start my-2">
    <div className="flex items-center space-x-2 px-4 py-3 bg-gray-200 rounded-2xl max-w-2xl">
      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0s]" />
      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]" />
      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.4s]" />
    </div>
  </div>
);

export default function DashboardPage({ isWidgetMode = false }) {
  const params = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const [docs, setDocs] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    getDocument((data) => {
      setDocs(data);
    });
    getFAQ((data) => {
      setFaqs(data);
    });
  }, []);

  const session_id = isWidgetMode
    ? localStorage.getItem("widget_session_id")
    : params.session_id;

  const userHasStarted = messages.some((msg) => msg.from === "user");

  // Ambil history saat session_id berubah
  useEffect(() => {
    if (session_id) {
      getChatHistoryBySessionID(session_id, (data) => {
        if (Array.isArray(data)) {
          const formatted = data.map((entry) => ([
            {
              from: "user",
              text: entry.user_message,
              time: entry.created_at,
            },
            {
              from: "bot",
              text: entry.bot_response,
              time: entry.created_at,
            },
          ])).flat();

          setMessages(formatted);
        }
      });
    } else {
      setMessages([]);
    }
  }, [session_id]);

  // Reset chat dari luar
  useEffect(() => {
    const handleResetChat = () => {
      setMessages([]);
      setInput("");
    };
    window.addEventListener("chatResetRequested", handleResetChat);
    return () => {
      window.removeEventListener("chatResetRequested", handleResetChat);
    };
  }, []);

  // Scroll ke bawah setelah ada pesan baru
  useEffect(() => {
    if (messages.length > 1) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (optionalInput) => {
    const finalInput = optionalInput || input;
    if (!finalInput.trim()) return;

    const userMessage = { from: "user", text: finalInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "API key tidak tersedia." },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const localContext = [
        ...(faqs?.map(f => `${f.question}: ${f.answer}`) || []),
        ...(docs?.flatMap(d => d.chunks || []))  // <--- gunakan flatMap untuk meratakan array of chunks
      ].join("\n\n");

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "SiJati Chatbot",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
              role: "system", 
              content: `Kamu adalah SI JATI (Sistem Informasi Jakarta Timur), asisten digital untuk warga yang ingin mengetahui berbagai hal tentang Jakarta Timur. 
              Tugasmu adalah menjawab pertanyaan **hanya seputar wilayah Jakarta Timur**, termasuk layanan publik, administrasi, kegiatan, atau informasi masyarakat.

              Jika pengguna bertanya tentang topik di luar Jakarta Timur, seperti kota lain, resep masakan, atau hal umum yang tidak relevan, 
              jawablah dengan **nada ramah dan sopan**. Sampaikan bahwa kamu hanya dapat membantu pertanyaan yang berkaitan dengan Jakarta Timur.

              Contoh jawaban yang baik: 
              "Topik itu menarik sekali! Tapi saya hanya dapat membantu untuk pertanyaan seputar Jakarta Timur ya 😊 Jika ada yang bisa saya bantu terkait Jakarta Timur, saya siap membantu."`
            },
            { 
              // Untuk membuat sitem RAG berdasarkan FAQ dan dokumen dari database
              role: "user", 
              content: `Referensi lokal:\n${localContext}\n\nPertanyaan: ${finalInput}`,
            },
          ],
        }),
      });

      const data = await res.json();
      const botReply = data?.choices?.[0]?.message?.content || "Maaf, tidak bisa menjawab saat ini.";

      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);

      // Simpan history
      let user = JSON.parse(localStorage.getItem("user"));
      let user_id = user?.user_id || user?.uid || "-";

      let sessionIdToUse = session_id;
      if (!sessionIdToUse) {
        const newSessionId = uuidv4();
        sessionIdToUse = newSessionId;
        if (isWidgetMode) {
          localStorage.setItem("widget_session_id", newSessionId);
        } else {
          navigate(`/chatbot/${newSessionId}`, { replace: true });
        }
      }

      await postChatHistory({
        session_id: sessionIdToUse,
        user_id,
        user_message: finalInput,
        retrieved_context: "-",
        bot_response: botReply,
      }, () => {
        window.dispatchEvent(new Event("chatHistoryUpdated"));
      });

    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Terjadi kesalahan saat menghubungi server." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (datetime) => {
    if (!datetime) return "";
    const date = new Date(datetime);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const recommendedQuestions = [
    "Apa info terbaru dari Jakarta Timur?",
    "Bagaimana cara membuat KTP di Jakarta Timur?",
    "Siapa contact center Kominfo Jakarta Timur?",
    "Kapan jadwal layanan keliling?",
  ];

  const content = (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <main className={`flex-1 overflow-y-auto ${isWidgetMode ? "p-4" : "px-4 sm:px-6 pt-6"}`}>
        <div className={`flex flex-col items-center ${userHasStarted ? "" : "justify-end h-full"}`}>
          {!userHasStarted && (
            <>
              <h1 className="text-pink-500 text-2xl font-semibold mb-6 text-center">What can I help with?</h1>
              <div className="w-full max-w-3xl">
                <div className="flex items-center rounded-full bg-white px-6 py-3 shadow-md">
                  <span className="text-gray-400 mr-3 text-xl"><LuMessageCircleMore /></span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tulis pertanyaan..."
                    className="flex-1 focus:outline-none text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <button onClick={() => handleSend()} className="text-gray-400 ml-3 text-lg">➤</button>
                </div>
              </div>
              <div className="w-full max-w-3xl my-10 space-y-2">
                <p className="text-sm font-bold text-gray-500 mb-2">Pertanyaan populer seputar Jakarta Timur</p>
                {recommendedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="w-full text-left bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md shadow transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[80%] px-4 py-2 rounded-lg text-sm shadow my-1 whitespace-pre-wrap ${
                msg.from === "user" ? "bg-blue-100 self-end" : "bg-gray-200 self-start"
              }`}
            >
              {msg.from === "bot" ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
              {msg.time && (
                <div className="text-[12px] text-gray-700 text-right mt-1">
                  {formatTime(msg.time)}
                </div>
              )}
            </div>
          ))}

          {isLoading && <LazyLoader />}
          <div ref={bottomRef} />
        </div>
      </main>

      {userHasStarted && (
        <div className={`${isWidgetMode ? "w-full px-4 mt-2 mb-4" : "fixed bottom-4 left-4 right-4 sm:left-64 sm:right-6 z-40"}`}>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center rounded-full bg-white px-6 py-3 shadow-md">
              <span className="text-gray-400 mr-3 text-xl"><LuMessageCircleMore /></span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tulis pertanyaan..."
                className="flex-1 focus:outline-none text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={() => handleSend()} className="text-gray-400 ml-3 text-lg">➤</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return isWidgetMode ? content : <Layout>{content}</Layout>;
}
