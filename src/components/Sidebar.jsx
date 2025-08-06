  // Sidebar.jsx
  import { Link } from "react-router-dom";
  import {
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    PaperClipIcon,
    ChatBubbleOvalLeftEllipsisIcon,
  } from "@heroicons/react/24/outline";
  import { History, LucideBotMessageSquare, LucideMessageSquareQuote, UserPlusIcon, UsersIcon } from "lucide-react";
  import { useLocation } from "react-router-dom";
  import { useEffect, useState } from "react";
  import { getChatHistoryBySessionID, getGroupedChatHistoryByUserID, getUserByID } from "../api/axios";
  import { AnimatePresence, motion } from "framer-motion";
  import LogoSiJati from "../assets/jati-logo-polos.png";

  export default function Sidebar({ isOpen = false, onClose = () => {} }) {
    const location = useLocation();
    const pathParts = location.pathname.split("/");
    const session_id = pathParts.includes("chatbot") ? pathParts[2] : null;
    const isMobile = window.innerWidth < 640;
    const [chatHistory, setChatHistory] = useState([]);
    const [groupedChats, setGroupedChats] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
      const localUser = JSON.parse(localStorage.getItem("user")); // ini bisa berisi uid
      if (localUser?.uid || localUser?.user_id) {
        const id = localUser.uid || localUser.user_id;
        getUserByID(id, (data) => {
          setUser(data);
        });
      }
    }, []);

    useEffect(() => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setCurrentUser(storedUser);
    }, []);

    useEffect(() => {
      if (currentUser?.user_id || currentUser?.uid) {
        const fetchGroupedChats = () => {
          getGroupedChatHistoryByUserID(currentUser.user_id || currentUser.uid, (data) => {
            const sortedData = [...data].sort((a, b) => {
              const dateA = new Date(a.chats?.[0]?.created_at || 0);
              const dateB = new Date(b.chats?.[0]?.created_at || 0);
              return dateB - dateA; // Descending: terbaru di atas
            });
            setGroupedChats(sortedData);
          });
        };

        fetchGroupedChats();

        // ⬇️ Tambahkan listener custom event
        window.addEventListener("chatHistoryUpdated", fetchGroupedChats);

        // Cleanup
        return () => {
          window.removeEventListener("chatHistoryUpdated", fetchGroupedChats);
        };
      }
    }, [currentUser]);

    useEffect(() => {
      if (session_id) {
        getChatHistoryBySessionID(session_id, (data) => {
          setChatHistory(data);
        });
      }
    }, [session_id]);

    return (
      <>
        {/* Desktop sidebar */}
        <aside className="hidden sm:flex flex-col w-64 min-h-screen bg-[#050C56] text-white p-6 space-y-6 fixed">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <img src={LogoSiJati} alt="Logo SI JATI" className="w-10 h-10" />
            <Link to="/">SI JATI</Link>
          </h1>

          {/* Wrapper utama agar navigasi dan chat bisa diatur posisi */}
          <div className="flex flex-col flex-1">
            {/* Navigasi utama */}
            <nav className="space-y-5">
              <NavLinks user={user} />
            </nav>

            {/* Chat History di bagian bawah */}
            {groupedChats.length > 0 && (
              <div className="mt-auto">
                <h3 className="flex items-center text-gray-400 gap-2 text-sm font-semibold uppercase mb-2 mt-10">
                  <History className="w-5 h-5" />
                  Chats History
                </h3>

                <div className="overflow-y-auto max-h-48 pr-1 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent space-y-2">
                  {groupedChats.map((group, index) => {
                    const firstMessage = group.chats[0]?.user_message?.trim() || "(tanpa pesan)";
                    const isActive = group.session_id === session_id;

                    return (
                      <Link
                        key={index}
                        to={`/chatbot/${group.session_id}`}
                        className={`block p-2 rounded-lg transition truncate ${
                          isActive ? "bg-pink-600 text-white font-semibold" : "bg-[#0E1C78] hover:bg-pink-600 text-white"
                        }`}
                      >
                        <p className="text-sm truncate">{firstMessage}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </aside>

        <AnimatePresence>
        {/* Mobile sidebar overlay */}
        {isMobile && isOpen && (
          <motion.div
              className="fixed inset-0 z-50 sm:hidden bg-black bg-opacity-40"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#050C56] text-white w-64 h-full p-6 flex flex-col justify-between"
                  onClick={(e) => e.stopPropagation()}
              >
              <div className="">
                <div className="flex mb-4">
                  <img src={LogoSiJati} alt="Logo SI JATI" className="w-10 h-10 mr-2" />
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    <Link to="/">SI JATI</Link>
                  </h1>
                  <button
                    onClick={onClose}
                    className="text-white text-2xl ms-auto p-1 rounded hover:bg-red-500 active:bg-red-800 transition-colors duration-150"
                  >
                    ✕
                  </button>
                </div>
                <NavLinks user={user} />
              </div>

              <nav className="space-y-5">
                {/* Chat History */}
                {groupedChats.length > 0 && (
                  <div className="mt-auto">
                    <h3 className="flex items-center text-gray-400 gap-2 text-sm font-semibold uppercase mb-2">
                      <History className="w-5 h-5" />
                      Chats History
                    </h3>

                    <div className="overflow-y-auto max-h-48 pr-1 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent space-y-2">
                      {groupedChats.map((group, index) => {
                        const firstMessage = group.chats[0]?.user_message?.trim() || "(tanpa pesan)";
                        const isActive = group.session_id === session_id;

                        return (
                          <Link
                            key={index}
                            to={`/chatbot/${group.session_id}`}
                            className={`block p-2 rounded-lg transition truncate ${
                              isActive ? "bg-pink-600 text-white font-semibold" : "bg-[#0E1C78] hover:bg-pink-600 text-white"
                            }`}
                          >
                            <p className="text-sm truncate">{firstMessage}</p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </nav>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </>
    );
  }

  // ⬇️ NavLinks menerima prop user
  function NavLinks({ user }) {
    return (
      <>
        <Link
          to={'/chatbot'}
          onClick={() => {
            localStorage.setItem("reset-chat", "true");
          }}
          className="flex items-center gap-2 hover:text-gray-300 cursor-pointer mb-3"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
          <span className="font-medium">Create Chat</span>
        </Link>

        {user && user.role === "admin" && (
          <>
            <Link to="/statistik" className="flex items-center gap-2 hover:text-gray-300 mb-3">
              <ChartBarIcon className="w-5 h-5" />
              <span className="font-medium">Chat Statistics</span>
            </Link>
            <Link to="/faq" className="flex items-center gap-2 hover:text-gray-300 mb-3">
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span className="font-medium">Manage FAQ</span>
            </Link>
            <Link to="/upload" className="flex items-center gap-2 hover:text-gray-300 mb-3">
              <PaperClipIcon className="w-5 h-5" />
              <span className="font-medium">Upload Document</span>
            </Link>
            <Link to="/user-management" className="flex items-center gap-2 hover:text-gray-300 mb-3">
              <UserPlusIcon className="w-5 h-5" />
              <span className="font-medium">Management User</span>
            </Link>
            <Link to="/login-logs" className="flex items-center gap-2 hover:text-gray-300 mb-3">
              <UsersIcon className="w-5 h-5" />
              <span className="font-medium">Login Logs</span>
            </Link>
            <Link to="/history" className="flex items-center gap-2 hover:text-gray-300 mb-3">
              <LucideBotMessageSquare className="w-5 h-5" />
              <span className="font-medium">Chatbot History</span>
            </Link>
            <Link to="/feedback-history" className="flex items-center gap-2 hover:text-gray-300 mb-3">
              <LucideMessageSquareQuote className="w-5 h-5" />
              <span className="font-medium">Feedback History</span>
            </Link>
          </>
        )}
      </>
    );
  }
