// Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  PaperClipIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { History, UserPlusIcon, UsersIcon } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const session_id = pathParts.includes("dashboard") ? pathParts[2] : null;
  const user = JSON.parse(localStorage.getItem("user"));
  const isMobile = window.innerWidth < 640;

  const chatHistory = [
    "Bagaimana cara kerja AI?",
    "Apa itu machine learning?",
    "Fungsi chatbot SI JATI?",
    "Dokumen terakhir saya?",
    "Apakah data saya aman?",
    "Bagaimana cara kerja AI?",
    "Apa itu machine learning?",
    "Fungsi chatbot SI JATI?",
    "Dokumen terakhir saya?",
    "Apakah data saya aman?",
    "Bagaimana cara kerja AI?",
    "Apa itu machine learning?",
    "Fungsi chatbot SI JATI?",
    "Dokumen terakhir saya?",
    "Apakah data saya aman?",
    "Bagaimana cara kerja AI?",
    "Apa itu machine learning?",
    "Fungsi chatbot SI JATI?",
    "Dokumen terakhir saya?",
    "Apakah data saya aman?",
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex flex-col w-64 min-h-screen bg-[#050C56] text-white p-6 space-y-6 fixed">
        <h1 className="text-xl font-bold">
          <Link to="/">SI JATI</Link>
        </h1>

        {/* Wrapper utama agar navigasi dan chat bisa diatur posisi */}
        <div className="flex flex-col flex-1">
          {/* Navigasi utama */}
          <nav className="space-y-5">
            <NavLinks user={user?.displayName || null} />
          </nav>

          {/* Chat History di bagian bawah */}
          {user && session_id && (
            <div className="mt-auto">
              <h3 className="flex items-center text-gray-400 gap-2 text-sm font-semibold uppercase mb-2">
                <History className="w-5 h-5" />
                Chats History
              </h3>
              <div className="overflow-y-auto max-h-48 pr-1 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
                <ul className="space-y-1">
                  {chatHistory.map((chat, index) => (
                    <li
                      key={index}
                      className={`px-3 py-2 text-sm rounded cursor-pointer hover:bg-pink-600 ${
                        index === 0 ? "bg-pink-500 text-white" : "text-white"
                      }`}
                    >
                      {chat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 z-50 sm:hidden bg-black bg-opacity-40" onClick={onClose}>
          <div
            className="bg-[#050C56] text-white w-64 h-full p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-4">
              <button onClick={onClose} className="text-white text-2xl">✕</button>
            </div>
            <h1 className="text-xl font-bold">
              <Link to="/">SI JATI</Link>
            </h1>
            <nav className="space-y-5">
              <NavLinks user={user} />

              {/* Chat History */}
              {user && session_id && (
                <div className="mt-8">
                  <h3 className="text-sm text-gray-300 font-semibold uppercase mb-2">Chats</h3>
                  <ul className="space-y-1">
                    {chatHistory.map((chat, index) => (
                      <li
                        key={index}
                        className={`px-3 py-2 text-sm rounded cursor-pointer hover:bg-pink-600 ${
                          index === 0 ? "bg-pink-500 text-white" : "text-white"
                        }`}
                      >
                        {chat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

// ⬇️ NavLinks menerima prop user
function NavLinks({ user }) {
  return (
    <>
      <Link to="/dashboard" className="flex items-center gap-2 hover:text-gray-300">
        <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
        <span className="font-medium">Create Chat</span>
      </Link>

      {user && (
        <>
          <Link to="/statistik" className="flex items-center gap-2 hover:text-gray-300">
            <ChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Chat Statistics</span>
          </Link>
          <Link to="/faq" className="flex items-center gap-2 hover:text-gray-300">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            <span className="font-medium">Manage FAQ</span>
          </Link>
          <Link to="/upload" className="flex items-center gap-2 hover:text-gray-300">
            <PaperClipIcon className="w-5 h-5" />
            <span className="font-medium">Upload Document</span>
          </Link>
          <Link to="/user-management" className="flex items-center gap-2 hover:text-gray-300">
            <UserPlusIcon className="w-5 h-5" />
            <span className="font-medium">Management User</span>
          </Link>
          <Link to="/login-logs" className="flex items-center gap-2 hover:text-gray-300">
            <UsersIcon className="w-5 h-5" />
            <span className="font-medium">Login Logs</span>
          </Link>
        </>
      )}
    </>
  );
}
