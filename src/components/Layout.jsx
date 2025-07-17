import React from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const profileImage = user?.photoURL?.startsWith('http')
    ? user.photoURL
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=random&rounded=true`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (fixed) */}
      <Sidebar />

      {/* Main wrapper */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Fixed Header */}
        <header className="fixed top-0 left-64 right-0 h-16 px-4 sm:px-6 bg-[#f5f6fa] border-b flex items-center justify-end z-50">
          <span className="mr-2 hidden sm:block text-sm text-gray-700">
            Welcome, {user?.displayName || 'User'}
          </span>
          <img
            src={profileImage}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border"
          />
        </header>

        {/* Main content below header */}
        <main className="pt-16 px-4 sm:px-6 pb-20 flex-1 overflow-y-auto bg-[#f5f6fa]">
          {children}
        </main>
      </div>
    </div>
  );
}
