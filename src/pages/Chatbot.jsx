import React, { useState, useRef, useEffect } from "react";
import { LuMessageCircleMore } from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import Layout from "../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { getChatHistoryBySessionID, getDocument, getFAQ, postChatHistory } from "../api/axios";
import { v4 as uuidv4 } from "uuid";
import maskotSiJati from "../assets/maskot-sijati.svg";

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

export default function Chatbot({ isWidgetMode = false }) {
  const params = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const [docs, setDocs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    getDocument((data) => {
      setDocs(data);
    });
    getFAQ((data) => {
      setFaqs(data);
    });
  }, []);

  // Sumber session ID reaktif (state), supaya re-render saat ID baru dibuat
  const [session_id, setSessionId] = useState(() =>
    isWidgetMode ? localStorage.getItem("widget_session_id") : params.session_id
  );

  // Saat widget dibuka: tandai terbuka & pastikan ID ada
  useEffect(() => {
    if (isWidgetMode) {
      // widget sedang terbuka
      localStorage.setItem("widget_closed", "false");

      let id = localStorage.getItem("widget_session_id");
      if (!id) {
        const newId = uuidv4();
        localStorage.setItem("widget_session_id", newId);
        id = newId;
      }
      setSessionId(id);
    } else {
      // full page ambil dari URL param
      setSessionId(params.session_id);
    }
  }, [isWidgetMode, params.session_id]);

  const userHasStarted = messages.some((msg) => msg.from === "user");

  // Ambil history saat session_id berubah
  useEffect(() => {
    const widgetClosed = localStorage.getItem("widget_closed") === "true";

    if (session_id && !(widgetClosed)) {
      getChatHistoryBySessionID(session_id, (data) => {
        let formatted = [];

        if (Array.isArray(data)) {
          formatted = data.map((entry) => ([
            { from: "user", text: entry.user_message, time: entry.created_at },
            { from: "bot", text: entry.bot_response, time: entry.created_at },
          ])).flat();
        }

        setMessages(formatted);
      });
    }
  }, [session_id]);

  useEffect(() => {
    const shouldReset = localStorage.getItem("reset-chat") === "true";
    const widgetClosed = localStorage.getItem("widget_closed") === "true";

    if (!session_id && shouldReset && widgetClosed) {
      setMessages([]);
      setHasInteracted(false);
      localStorage.removeItem("reset-chat");
      localStorage.removeItem("widget_closed");
    }
  }, [session_id]);

  // Scroll ke bawah setelah ada pesan baru
  useEffect(() => {
    if (messages.length > 1) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleReset = () => {
      setMessages([]);
      setHasInteracted(false);
      localStorage.removeItem("reset-chat");
      localStorage.removeItem("widget_closed");
      localStorage.removeItem("widget_session_id");
      localStorage.removeItem("session_id");
    };

    window.addEventListener("chatResetRequested", handleReset);

    // Jalankan juga saat mount
    const shouldReset = localStorage.getItem("reset-chat") === "true";
    const widgetClosed = localStorage.getItem("widget_closed") === "true";
    if (shouldReset || widgetClosed) {
      handleReset();
    }

    return () => {
      window.removeEventListener("chatResetRequested", handleReset);
    };
  }, [session_id]);

  const handleSend = async (optionalInput) => {
    const finalInput = optionalInput || input;
    if (!finalInput.trim()) return;

    setHasInteracted(true);

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
      function searchDocuments(query, docs) {
        const lowerQuery = query.toLowerCase();

        return docs.filter(doc =>
          Array.isArray(doc.chunks) &&
          doc.chunks.some(chunk => typeof chunk === "string" && chunk.toLowerCase().includes(lowerQuery))
        );
      }

       // Matching FAQ
      const matchedFaqs = faqs.filter(f =>
        f.question?.toLowerCase().includes(finalInput.toLowerCase()) ||
        finalInput.toLowerCase().includes(f.question?.toLowerCase())
      );

      // Matching documents
      const matchedDocs = searchDocuments(finalInput, docs);

      // Gabungkan ke localContext (hati-hati dengan undefined/null)
      const localContext = [
        ...matchedFaqs.map(f => `${f.question}: ${f.answer}`),
        ...matchedDocs.flatMap(d => d.chunks || []),
      ].join("\n\n");

      // Bangun prompt user
      const contextPrompt = localContext.trim()
        ? `Referensi lokal:\n${localContext}\n\nPertanyaan: ${finalInput}`
        : `Pertanyaan: ${finalInput}`;

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
              content: `
                Kamu adalah chatbot SI JATI yang hanya menjawab pertanyaan tentang Jakarta Timur.
                Jika pengguna bertanya di luar topik Jakarta Timur, jawab:
                "Maaf, saya hanya bisa menjawab pertanyaan seputar Jakarta Timur."
                Selalu jawab dengan bahasa Indonesia, santai singkat dan jelas.
              `,
            },
            { 
              role: "user", 
              content: contextPrompt,
            },
          ],
        }),
      });
      
      console.log("Matched FAQs:", matchedFaqs);
      console.log("Matched Docs:", matchedDocs);
      console.log("localContext tokens approx:", localContext.length / 4);

      const data = await res.json();
      const botReply = data?.choices?.[0]?.message?.content || "Maaf, tidak bisa menjawab saat ini.";

      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);

      // Simpan history
      let user = JSON.parse(localStorage.getItem("user"));
      let user_id = user?.user_id || user?.uid || "-";

      let sessionIdToUse = session_id;
      let isNewSession = false;

      if (!sessionIdToUse) {
        const newSessionId = uuidv4();
        sessionIdToUse = newSessionId;
        isNewSession = true;

        // Simpan chat sementara ke localStorage agar bisa dimuat setelah navigate
        const tempChat = [
          { from: "user", text: finalInput },
          { from: "bot", text: botReply },
        ];
        localStorage.setItem("temp_chat", JSON.stringify(tempChat));

        if (isWidgetMode) {
          setSessionId(newSessionId);
        }
      }

      await postChatHistory({
        session_id: sessionIdToUse,
        user_id,
        user_message: finalInput,
        retrieved_context: localContext || "-",
        bot_response: botReply,
      }, () => {
        window.dispatchEvent(new Event("chatHistoryUpdated"));
      });

      // ✅ Lakukan navigate setelah post berhasil
      if (isNewSession && !isWidgetMode) {
        navigate(`/chatbot/${sessionIdToUse}`, { replace: true });
        return;
      }

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
    <div  className={
      isWidgetMode
        ? "flex flex-col h-full max-h-full overflow-hidden rounded-2xl"
        : "flex flex-col flex-1 h-full overflow-hidden"
    }>
      <main className={`flex-1 min-h-0 overflow-y-auto ${isWidgetMode ? "p-4 pb-5" : "px-4 sm:px-6 pt-6"}`} style={{ WebkitOverflowScrolling: "touch" }}>
        <div className={`flex flex-col items-center ${userHasStarted ? "" : (isWidgetMode ? "" : "justify-end h-full")} min-h-0`}>
          {!userHasStarted && (
            <>
              <div className="flex flex-col items-center justify-center mb-6">
                <img
                  src={maskotSiJati}
                  alt="Maskot SI JATI"
                  className={`${isWidgetMode ? "w-30" : "w-70"} mr-3`}
                  style={{ maxHeight: isWidgetMode ? "146px" : "auto" }}
                />
                <h1 className="text-pink-500 text-2xl font-semibold text-center hidden sm:block">
                  Halo! 👋🏻 Aku Jati, siap bantu cari info seputar Jakarta Timur.
                </h1>
              </div>
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
              {msg.from === "bot" ? 
                <div className="text-left">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                : msg.text}
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
        isWidgetMode ? (
          // Popup: ikut kontainer, sticky di bawah
          <div className="w-full px-4 mt-2 pb-4 sticky bottom-0 z-10 bg-white/90 backdrop-blur">
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
        ) : (
          // Full page: tetap fixed
          <div className="fixed bottom-4 left-4 right-4 sm:left-64 sm:right-6 z-40">
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
        )
      )}

    </div>
  );

  return isWidgetMode ? content : <Layout>{content}</Layout>;
}