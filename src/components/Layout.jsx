import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { FiSettings, FiLogOut } from "react-icons/fi";

export default function Layout({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profileRef = useRef(null);

  const profileImage = user?.photoURL?.startsWith("http")
    ? user.photoURL
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.displayName || "User"
      )}&background=random&rounded=true`;

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (responsif, 1 kali render) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main wrapper */}
      <div className="flex-1 flex flex-col sm:ml-64">
        {/* Header */}
        <header
          className="fixed top-0 left-0 sm:left-64 right-0 h-16 px-4 sm:px-6 bg-[#f5f6fa] border-b flex items-center justify-between sm:justify-end z-40"
          ref={profileRef}
        >
          {/* Hamburger button (mobile only) */}
          <button
            className="sm:hidden text-2xl text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          {/* Welcome & Profile */}
          <div className="flex items-center space-x-2">
            <span className="hidden sm:block text-sm text-gray-700">
              Welcome, {user?.displayName || "User"}
            </span>
            <img
              src={profileImage}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border cursor-pointer"
              onClick={() => setShowMenu(!showMenu)}
            />
          </div>

          {/* Dropdown menu */}
          {showMenu && !showSettings && (
            <div className="absolute top-16 right-6 bg-white shadow-lg rounded-xl py-3 px-5 space-y-3 z-50 w-44">
              <button
                onClick={() => {
                  setShowSettings(true);
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 hover:opacity-80 text-sm"
              >
                <FiSettings className="text-lg" />
                <span>Setting</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-sm text-red-500 hover:opacity-80"
              >
                <FiLogOut className="text-lg" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Settings Modal */}
          {showSettings && (
            <div className="absolute top-16 right-6 w-80 bg-white shadow-2xl rounded-xl p-5 z-50">
              <div className="flex flex-col items-center mb-4">
                <img src={profileImage} className="w-14 h-14 rounded-full mb-2" />
                <span className="font-semibold">
                  {user?.displayName || "User"}
                </span>
              </div>
              <div className="text-gray-500 font-semibold text-sm mb-2">
                Settings
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500">Username</label>
                  <input
                    className="w-full border px-3 py-1 rounded text-sm"
                    value={user?.displayName || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <input
                    className="w-full border px-3 py-1 rounded text-sm"
                    value={user?.email || ""}
                    readOnly
                  />
                </div>
                <div className="text-right mt-2">
                  <Link
                    to="/reset-password"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Reset Password?
                  </Link>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main content */}
        <main className="pt-16 px-4 sm:px-6 pb-20 flex-1 overflow-y-auto bg-[#f5f6fa]">
          {children}
        </main>
      </div>
    </div>
  );
}