import React from "react";
import { FaTimes } from "react-icons/fa";
import DashboardPage from "../pages/DashboardPage";

const ChatbotPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed bottom-2 z-50 bg-white border border-gray-300 shadow-2xl
        flex flex-col
        w-[95%] h-[90vh] rounded-xl
        sm:w-[30%] sm:h-[90%] sm:right-6 sm:rounded-xl sm:left-auto
        left-1/2 -translate-x-1/2 sm:translate-x-0
      `}
    >
      {/* Header biru */}
      <div className="bg-[#050C56] text-white px-4 py-3 flex justify-between items-center">
        <span className="font-semibold text-sm">SI JATI</span>
        <button onClick={onClose} className="text-white hover:text-gray-300 text-lg">
          <FaTimes />
        </button>
      </div>

      {/* Konten Chatbot */}
      <div className="flex-1 overflow-hidden">
        <DashboardPage isWidgetMode={true} />
      </div>
    </div>
  );
};

export default ChatbotPopup;