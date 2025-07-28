import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import { getLoginlogs, getUser } from '../api/axios';

export default function LoginLogs() {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ambil data logs dan user
  useEffect(() => {
    getLoginlogs((logData) => {
      getUser((userData) => {
        const mergedLogs = logData.map((log) => {
          const user = userData.find((u) => u.user_id === log.user_id);
          return {
            ...log,
            email: user ? user.email : '-',
          };
        });
        setLogs(mergedLogs);
      });
    });
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset ke halaman pertama jika tab atau search berubah
  }, [search, activeTab]);

  const isToday = (date) => {
    const today = new Date();
    const d = new Date(date);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const isLast7Days = (date) => {
    const today = new Date();
    const d = new Date(date);
    const diffTime = today - d;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  const sortedLogs = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const filteredLogs = sortedLogs
    .filter((log) => {
      if (activeTab === 'Today') return isToday(log.login_time);
      if (activeTab === 'Last 7 Days') return isLast7Days(log.login_time);
      return true;
    })
    .filter((log) =>
      log.log_id.toLowerCase().includes(search.toLowerCase()) ||
      log.user_id.toLowerCase().includes(search.toLowerCase()) ||
      (log.email || '').toLowerCase().includes(search.toLowerCase())
    );

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  return (
    <Layout>
      <div className="flex-1 px-4 sm:px-8 pt-6 pb-10 bg-[#f8f9fc] min-h-screen">
        <div className="mx-auto">
          <h1 className="text-2xl font-bold text-dark mb-6">Login Logs</h1>

          <div className="bg-white rounded-xl shadow px-4 py-5">
            {/* Search bar */}
            <div className="mb-4">
              <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 w-full sm:max-w-xs">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ml-2 outline-none w-full text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 border-b border-gray-200 text-sm font-semibold text-gray-700 mb-4">
              {['All', 'Today', 'Last 7 Days'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-black'
                      : 'text-gray-500'
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
                    <th className="py-2 px-2 font-semibold">Log ID</th>
                    <th className="py-2 px-2 font-semibold">Email</th>
                    <th className="py-2 px-2 font-semibold hidden sm:table-cell">Login Time</th>
                    <th className="py-2 px-2 font-semibold hidden sm:table-cell">IP Address</th>
                    <th className="py-2 px-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log, index) => (
                      <tr key={log.log_id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">
                          {(currentPage - 1) * itemsPerPage + index + 1}.
                        </td>
                        <td
                          className="py-2 px-2 text-blue-600 underline cursor-pointer"
                          onClick={() => setSelectedLog(log)}
                        >
                          {log.log_id.slice(0, 6)}...
                        </td>
                        <td className="py-2 px-2">{log.email}</td>
                        <td className="py-2 px-2 hidden sm:table-cell">
                          {new Date(log.login_time).toLocaleString()}
                        </td>
                        <td className="py-2 px-2 hidden sm:table-cell">
                          {log.ip_address}
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              log.status.toLowerCase() === 'success'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-500 py-4">
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2 sm:gap-0">
                <p className="text-sm text-gray-600 text-center sm:text-left">
                  Showing {(currentPage - 1) * itemsPerPage + 1}
                  {" to "}
                  {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
                  {" of "}
                  <span className="font-bold">{filteredLogs.length}</span> entries
                </p>
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

        {/* Modal Detail Log */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                onClick={() => setSelectedLog(null)}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold mb-4">Detail Log</h2>
              <div className="space-y-2 text-sm">
                <div><strong>Log ID:</strong> {selectedLog.log_id}</div>
                <div><strong>User ID:</strong> {selectedLog.user_id}</div>
                <div><strong>Email:</strong> {selectedLog.email}</div>
                <div><strong>Login Time:</strong> {new Date(selectedLog.login_time).toLocaleString()}</div>
                <div><strong>IP Address:</strong> {selectedLog.ip_address}</div>
                <div><strong>User Agent:</strong> {selectedLog.user_agent}</div>
                <div><strong>Status:</strong> {selectedLog.status}</div>
                {selectedLog.failure_reason && (
                  <div><strong>Failure Reason:</strong> {selectedLog.failure_reason}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
