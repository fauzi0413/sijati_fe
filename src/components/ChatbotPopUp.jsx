import React from "react";
import { FaTimes } from "react-icons/fa";
import Chatbot from "../pages/Chatbot";
import { AnimatePresence, motion } from "framer-motion";

const ChatbotPopup = ({ isOpen, onClose }) => {
  const handleClose = () => {
    localStorage.removeItem("widget_session_id");
    window.dispatchEvent(new Event("chatResetRequested")); // optional
    onClose();
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 50 }, // sama dengan hidden
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="chatbot-popup"
          variants={popupVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`
            fixed bottom-2 z-50 bg-white border border-gray-300 shadow-2xl
            flex flex-col
            w-[95%] h-[90vh] rounded-xl
            sm:w-[30%] sm:h-[90%] sm:right-6 sm:rounded-xl sm:left-auto
            left-1/2 -translate-x-1/2 sm:translate-x-0
          `}
        >
          {/* Header */}
          <div className="bg-[#050C56] text-white px-4 py-3 flex justify-between items-center rounded-t-xl">
            <span className="font-semibold text-sm">SI JATI</span>
            <button onClick={handleClose} className="text-white hover:bg-red-500 active:bg-red-800 p-1 rounded-full text-lg">
              <FaTimes />
            </button>
          </div>

          {/* Konten Chatbot */}
          <div className="flex-1 overflow-hidden">
            <Chatbot isWidgetMode={true} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatbotPopup;
