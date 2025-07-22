import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import { getLoginlogs, getUser } from '../api/axios';

export default function LoginLogs() {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

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

  const filteredLogs = logs.filter(
    (log) =>
      log.log_id.toLowerCase().includes(search.toLowerCase()) ||
      log.user_id.toLowerCase().includes(search.toLowerCase()) ||
      (log.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <main className="px-3 sm:px-6 py-4 sm:py-6 w-full min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Login Logs</h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search Log (email, ID)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded w-full text-sm"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full bg-white rounded-md overflow-hidden text-sm">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="px-4 py-2 text-left">Log ID</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left hidden sm:table-cell">Login Time</th>
                <th className="px-4 py-2 text-left hidden sm:table-cell">IP Address</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.sort((a, b) => new Date(b.login_time) - new Date(a.login_time)).map((log) => (
                <tr key={log.log_id} className="border-b">
                  <td
                    className="px-4 py-2 text-blue-600 underline cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    {log.log_id.slice(0, 6)}...
                  </td>
                  <td className="px-4 py-2">{log.email}</td>
                  <td className="px-4 py-2 hidden sm:table-cell">
                    {new Date(log.login_time).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 hidden sm:table-cell">{log.ip_address}</td>
                  <td className="px-4 py-2">
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
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
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
      </main>
    </Layout>
  );
}
