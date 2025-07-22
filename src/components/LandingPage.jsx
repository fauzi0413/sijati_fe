import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegMessage } from "react-icons/fa6";
import bgImage from "../assets/bg-biru.png";
import ChatbotPopup from './ChatbotPopUp';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <h1 className="text-white text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 leading-tight">
        Welcome to SI JATI
      </h1>

      <p className="text-white text-base sm:text-lg md:text-xl mb-10 max-w-md sm:max-w-xl">
        Explore East Jakarta and create your experience.
      </p>

      <button
        onClick={() => navigate("/dashboard")}
        className="px-8 sm:px-12 py-3 sm:py-4 border border-white text-white text-sm sm:text-base md:text-lg rounded-full font-semibold hover:bg-white hover:text-[#0E2A7B] transition"
      >
        Let&apos;s Explore!
      </button>

      {/* Popup Chatbot */}
      {isChatOpen && (
        <ChatbotPopup isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      )}

      {/* Tombol chat (hanya muncul saat popup tertutup) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-500 hover:bg-[#0c1e5a] text-white p-4 rounded-full shadow-lg z-50"
          aria-label="Buka Chatbot"
        >
          <FaRegMessage size={24} />
        </button>
      )}
    </div>
  );
};

export default LandingPage;