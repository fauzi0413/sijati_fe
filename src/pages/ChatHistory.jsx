import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Layout from "../components/Layout";
import { getChatHistory } from "../api/axios";
import ReactMarkdown  from 'react-markdown';

export default function ChatHistory() {
  const [activeTab, setActiveTab] = useState("All");
  const [chatHistory, setChatHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ambil data chat history dari API saat komponen pertama kali dimuat
  useEffect(() => {
    getChatHistory((data) => {
        const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setChatHistory(sorted);
    });
  }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab]);

  const isToday = (date) => {
    const today = new Date();
    const d = new Date(date);
    return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    };

    const isLast7Days = (date) => {
    const today = new Date();
    const d = new Date(date);
    const diffTime = today - d;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
    };

  // Filter berdasarkan input pencarian
  const filteredData = chatHistory
  .filter((row) => {
    // Filter berdasarkan tab
    if (activeTab === "Today") return isToday(row.created_at);
    if (activeTab === "Last 7 Days") return isLast7Days(row.created_at);
    return true; // "All"
  })
  .filter((row) =>
    row.user_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.bot_response.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

    const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <Layout>
      <div className="flex-1 px-4 sm:px-8 pt-6 pb-10 bg-[#f8f9fc] min-h-screen">
        <div className="mx-auto">
          <h1 className="text-2xl font-bold text-dark mb-6">Chat History</h1>

          <div className="bg-white rounded-xl shadow px-4 py-5">
            {/* Search bar */}
            <div className="mb-4">
              <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 w-full sm:max-w-xs">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ml-2 outline-none w-full text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 border-b border-gray-200 text-sm font-semibold text-gray-700 mb-4">
              {["All", "Today", "Last 7 Days"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 ${
                    activeTab === tab
                      ? "border-b-2 border-blue-600 text-black"
                      : "text-gray-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-800">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 px-2 font-semibold">No.</th>
                    <th className="py-2 px-2 font-semibold">Chat ID</th>
                    <th className="py-2 px-2 font-semibold hidden sm:table-cell">Session ID</th>
                    <th className="py-2 px-2 font-semibold hidden sm:table-cell">User ID</th>
                    <th className="py-2 px-2 font-semibold">User Message</th>
                    <th className="py-2 px-2 font-semibold hidden sm:table-cell">Bot Response</th>
                    <th className="py-2 px-2 font-semibold">Created At</th>
                  </tr>
                </thead>
                <tbody>
                {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                    <tr
                        key={index}
                        className="border-b align-top hover:bg-gray-50"
                    >
                        {/* ✅ Desktop version */}
                         <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        {/* <td className="py-2 px-2 sm:table-cell">{index + 1}</td> */}
                        <td className="py-2 px-2 break-words">
                        <a
                            onClick={() => setSelectedChat(item)}
                            className="text-blue-600 hover:underline"
                            title="Lihat detail"
                            role="button"
                        >
                            {item.chat_id?.slice(0, 6)}...{item.chat_id?.slice(-3)}
                        </a>
                        </td>
                        <td className="py-2 px-2 break-words hidden sm:table-cell">
                        <span title={item.session_id}>
                            {item.session_id?.slice(0, 6)}...{item.session_id?.slice(-3)}
                        </span>
                        </td>
                        <td className="py-2 px-2 break-words hidden sm:table-cell">
                        <span title={item.user_id}>
                            {item.user_id?.slice(0, 6)}...{item.user_id?.slice(-3)}
                        </span>
                        </td>
                        <td className="py-2 px-2 break-words">
                        <span title={item.user_message} className="cursor-help">
                            <ReactMarkdown>
                            {item.user_message?.length > 200
                                ? item.user_message.slice(0, 200) + "..."
                                : item.user_message}
                            </ReactMarkdown>
                        </span>
                        </td>
                        <td className="py-2 px-2 break-words hidden sm:table-cell">
                        <span title={item.bot_response} className="cursor-help">
                            <ReactMarkdown>
                            {item.bot_response?.length > 200
                                ? item.bot_response.slice(0, 200) + "..."
                                : item.bot_response}
                            </ReactMarkdown>
                        </span>
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleString()}
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-500">
                        No results found.
                    </td>
                    </tr>
                )}
                </tbody>
              </table>
              {/* Total Data & Pagination */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2 sm:gap-0">
                {/* Keterangan jumlah data */}
                <p className="text-sm text-gray-600 text-center sm:text-left">
                    Showing {(currentPage - 1) * itemsPerPage + 1}
                    {" to "}
                    {Math.min(currentPage * itemsPerPage, filteredData.length)}
                    {" of "}
                    <span className="font-bold">{filteredData.length}</span> entries
                </p>

                {/* Tombol Navigasi */}
                <div className="flex justify-center sm:justify-start gap-2 text-sm">
                    <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                    Previous
                    </button>
                    <span className="self-center">
                    Page {currentPage} of {totalPages}
                    </span>
                    <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                    Next
                    </button>
                </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {selectedChat && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md h-[90vh] overflow-y-auto p-6 relative mx-4 sm:mx-0">
            <button
                className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-red-500"
                onClick={() => setSelectedChat(null)}
            >
                ✕
            </button>

            <h2 className="text-lg font-semibold mb-5 pr-6">Detail Chat</h2>

            <div className="space-y-3 text-sm break-words">
                <p><strong>Chat ID:</strong><br /> {selectedChat.chat_id}</p>
                <p><strong>Session ID:</strong><br /> {selectedChat.session_id}</p>
                <p><strong>User ID:</strong><br /> {selectedChat.user_id}</p>
                <p><strong>Created At:</strong><br /> {new Date(selectedChat.created_at).toLocaleString()}</p>
                <div>
                    <strong>User Message:</strong>
                    <div className="mt-1 border p-2 rounded bg-gray-50">
                        <ReactMarkdown>{selectedChat.user_message}</ReactMarkdown>
                    </div>
                </div>
                <div>
                    <strong>Bot Response:</strong>
                    <div className="mt-1 border p-2 rounded bg-gray-50">
                        <ReactMarkdown>{selectedChat.bot_response}</ReactMarkdown>
                    </div>
                </div>
            </div>
            </div>
        </div>
        )}
    </Layout>
  );
}
