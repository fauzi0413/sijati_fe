import React from "react";
import { FaTimes } from "react-icons/fa";
import Chatbot from "../pages/Chatbot";
import { AnimatePresence, motion } from "framer-motion";

const ChatbotPopup = ({ isOpen, onClose }) => {
  const handleClose = () => {
    localStorage.setItem("reset-chat", "true");
    localStorage.setItem("widget_closed", "true");
    window.dispatchEvent(new Event("chatResetRequested"));
    onClose();
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 50 },
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
          className="fixed z-50 inset-0 flex items-end justify-start sm:items-end sm:justify-end"
        >
          <div
            className="
              bg-white border border-gray-300 shadow-2xl
              flex flex-col rounded-t-xl sm:rounded-xl
              w-full h-[92vh] max-w-full             /* Mobile: lebih tinggi */
              sm:w-[500px] sm:h-[85vh]               /* Desktop: lebih lebar */
              sm:mr-6 sm:mb-6
            "
          >
            {/* Header */}
            <div className="bg-[#050C56] text-white px-4 py-3 flex justify-between items-center rounded-t-xl">
              <span className="font-semibold text-sm">SI JATI</span>
              <button
                onClick={handleClose}
                className="text-white hover:bg-red-500 active:bg-red-800 p-1 rounded-full text-lg"
              >
                <FaTimes />
              </button>
            </div>

            {/* Konten Chatbot */}
            <div className="flex-1 overflow-hidden flex flex-col items-stretch">
              <Chatbot isWidgetMode={true} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatbotPopup;