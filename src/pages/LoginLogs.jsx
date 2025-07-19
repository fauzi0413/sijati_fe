import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';

const dummyLogs = [
  { id: '1a2b3c4d', userId: 42, time: '2025-07-17 08:23:45', email: 'admin@test.com', status: 'Success' },
  { id: '5e6f7g8h', userId: 24, time: '2025-07-17 08:23:45', email: 'admin@test.com', status: 'Success' },
  { id: '9i0k1l2m', userId: 42, time: '2025-07-17 08:23:45', email: 'admin@test.com', status: 'Failed' },
  { id: '3n4o5p6q', userId: 24, time: '2025-07-17 08:23:45', email: 'admin@test.com', status: 'Success' },
  { id: '7r8s9t0u', userId: 42, time: '2025-07-17 08:23:45', email: 'admin@test.com', status: 'Failed' },
  { id: 'aa1bb2cc', userId: 99, time: '2025-07-17 08:23:45', email: 'admin@test.com', status: 'Failed' },
];

export default function LoginLogs() {
  const [search, setSearch] = useState('');

  const filteredLogs = dummyLogs.filter(
    (log) =>
      log.id.toLowerCase().includes(search.toLowerCase()) ||
      log.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <main className="px-3 sm:px-6 py-4 sm:py-6 w-full min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Login Logs</h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div className="relative w-full sm:max-w-xs">
            <input
            type="text"
            placeholder="Search Log"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded w-full text-sm"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
        </div>
        </div>

        <div className="w-full overflow-x-auto">
        <table className="min-w-[600px] w-full bg-white rounded-md overflow-hidden text-sm">
            <thead>
            <tr className="bg-blue-500 text-white">
                <th className="px-4 py-2 text-left">Log_ID</th>
                <th className="px-4 py-2 text-left">User ID</th>
                <th className="px-4 py-2 text-left">Login Time</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Status</th>
            </tr>
            </thead>
            <tbody>
            {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b">
                <td className="px-4 py-2 whitespace-nowrap">{log.id}</td>
                <td className="px-4 py-2">{log.userId}</td>
                <td className="px-4 py-2">{log.time}</td>
                <td className="px-4 py-2 truncate max-w-[150px]">{log.email}</td>
                <td className="px-4 py-2">
                    <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        log.status === 'Success'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                    >
                    {log.status}
                    </span>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </main>
    </Layout>
  );
}
